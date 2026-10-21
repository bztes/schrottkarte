import { debounce } from '#lib/utils.js';
import type { AlertsService } from '#lib/alerts.svelte.js';
import {
  deleteMarker,
  getMarkers,
  getMarkersInView,
  saveMarkers,
} from '#lib/remote/markers.remote.js';
import { SvelteMap } from 'svelte/reactivity';
import { untrack } from 'svelte';
import type { LngLat, LngLatBounds } from 'maplibre-gl';
import { browser } from '$app/env';

export type Marker = Awaited<ReturnType<typeof getMarkers>>[number];

/** A marker that is not saved yet, placed at `center` */
export function newMarker(center: LngLat): Marker {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    state: 'new',
    lng: center.lng,
    lat: center.lat,
    createdAt: now,
    updatedAt: now,
  };
}

export type MarkersService = ReturnType<typeof createMarkersService>;

export function createMarkersService(alerts: AlertsService) {
  // ONLINE / OFFLINE

  let isOffline = $state(false);

  if (browser) {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (window.navigator.onLine) {
      handleOnline();
    } else {
      handleOffline();
    }
  }

  function handleOnline() {
    isOffline = false;
    alerts.delete('offline');
  }

  function handleOffline() {
    isOffline = true;
    alerts.warn({
      id: 'offline',
      canClose: false,
      title: 'You are offline',
      msg: 'Your changes are stored on this device and synced automatically once you are back online, as long as the app stays open.',
    });
  }

  // STORAGE

  const storageKey = 'unsyncedMarkers';
  const unsyncedMarkersMap = new SvelteMap<Marker['id'], Marker>();
  const allUnsyncedMarkers = $derived(Array.from(unsyncedMarkersMap.values()));

  if (browser) {
    loadFromLocaleStorage();
  }

  function loadFromLocaleStorage() {
    const stringData = localStorage.getItem(storageKey);
    unsyncedMarkersMap.clear();
    if (stringData) {
      // markers stored before the switch to camelCase still have `created_at` and `updated_at`
      const parsedData: (Marker & { created_at?: string; updated_at?: string })[] =
        JSON.parse(stringData);
      if (Array.isArray(parsedData)) {
        // dates are serialized as strings in JSON
        parsedData.forEach(({ created_at, updated_at, ...d }) =>
          unsyncedMarkersMap.set(d.id, {
            ...d,
            createdAt: new Date(d.createdAt ?? created_at),
            updatedAt: new Date(d.updatedAt ?? updated_at),
          }),
        );
      }
    }
  }

  $effect(() => {
    const stringData = JSON.stringify(Array.from(unsyncedMarkersMap.values()));
    localStorage.setItem(storageKey, stringData);
  });

  // BACKEND LOAD

  const markersMap = new SvelteMap<Marker['id'], Marker>();
  const allMarkers = $derived(Array.from(markersMap.values()));

  async function loadAll() {
    try {
      updateMarkersFromRows(await getMarkers());
    } catch (error) {
      console.error('Failed to fetch markers', error);
      alerts.error({ title: 'Failed to fetch markers', error });
    }
  }

  async function loadView(bounds: LngLatBounds) {
    const minBounds = bounds.getSouthWest();
    const maxBounds = bounds.getNorthEast();

    try {
      const rows = await getMarkersInView({
        minLng: minBounds.lng,
        minLat: minBounds.lat,
        maxLng: maxBounds.lng,
        maxLat: maxBounds.lat,
        limit: 100,
      });
      updateMarkersFromRows(rows);
    } catch (error) {
      console.error('Failed to fetch markers', error);
    }
  }

  function updateMarkersFromRows(rows: Marker[]) {
    rows.forEach((r) => markersMap.set(r.id, r));
  }

  // BACKEND SAVE

  let syncMarkersTimeoutId: ReturnType<typeof setInterval> | undefined;

  $effect(() => {
    if (unsyncedMarkersMap.size > 0 && syncMarkersTimeoutId === undefined && !isOffline) {
      // the remote command updates reactive state (pending count), don't let the effect depend on it
      untrack(save);
    }
  });

  $effect(() => {
    if (unsyncedMarkersMap.size === 0) {
      alerts.delete('marker-save');
    } else {
      alerts.info({
        id: 'marker-save',
        canClose: false,
        title: 'Saving…',
        msg: 'Your changes will be saved in a moment. 😊',
      });
    }
  });

  async function save() {
    let data: Marker[];
    try {
      // the command ignores the timestamps, the server sets them
      data = await saveMarkers(Array.from(unsyncedMarkersMap.values()));
    } catch (error) {
      console.error(error);
      alerts.error({
        id: 'marker-save-error',
        canClose: false,
        title: 'Saving failed',
        msg: 'Something went wrong while saving, but don’t worry, we will retry shortly. 😊',
        error,
      });
      syncMarkersTimeoutId = setTimeout(save, 15 * 1000);
      return;
    }

    alerts.delete('marker-save-error');
    syncMarkersTimeoutId = undefined;

    data.forEach((r) => {
      unsyncedMarkersMap.delete(r.id);
      markersMap.set(r.id, r);
    });
  }

  function draft(markerId: string) {
    let marker = unsyncedMarkersMap.get(markerId);
    if (marker) {
      return marker;
    }

    marker = markersMap.get(markerId);
    if (marker) {
      return $state.snapshot(marker);
    }

    return undefined;
  }

  function saveDraft(marker: Marker) {
    unsyncedMarkersMap.set(marker.id, marker);
  }

  async function remove(marker: Marker) {
    try {
      await deleteMarker(marker.id);
    } catch (error) {
      console.error('Failed to delete marker', error);
      return;
    }

    markersMap.delete(marker.id);
  }

  function isUnsynced(markerId: string) {
    return unsyncedMarkersMap.has(markerId);
  }

  function get(markerId: string) {
    return markersMap.get(markerId);
  }

  return {
    draft,
    saveDraft,
    remove,
    isUnsynced,
    loadAll,
    loadView: debounce(loadView, 1000),
    get,
    get all() {
      return allMarkers;
    },
    get allUnsynced() {
      return allUnsyncedMarkers;
    },
  };
}
