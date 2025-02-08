import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase.types';
import { debounce, postgresTimestampToDate } from '$lib/utils';
import type { Point } from 'geojson';
import type { AlertsService } from '$lib/alerts.svelte';
import { SvelteMap } from 'svelte/reactivity';
import type { LngLatBounds } from 'maplibre-gl';
import { browser } from '$app/environment';

export interface Marker {
  id: string;
  name: string;
  description: string;
  state: MarkerState;
  lng: number;
  lat: number;
  created_at: Date;
  updated_at: Date;
}
export type MarkerState = Database['public']['Enums']['marker_state_enum'];

export const markerStates: MarkerState[] = ['new', 'marked', 'done'] as const;

export type MarkersService = ReturnType<typeof createMarkersService>;

export function createMarkersService(supabase: SupabaseClient<Database>, alerts: AlertsService) {
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
      title: 'Du bist offline',
      msg: 'Deine Einträge werden auf deinem Gerät gespeichert und automatisch synchronisiert, sobald du wieder online bist – dafür muss die App geöffnet sein.',
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
      const parsedData: Marker[] = JSON.parse(stringData);
      if (Array.isArray(parsedData)) {
        parsedData.forEach((d) => unsyncedMarkersMap.set(d.id, d));
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
    const { data, error } = await supabase
      .from('markers')
      .select('id, name, description, state, location, created_at, updated_at')
      .limit(2000);

    if (error) {
      console.error('Failed to fetch markers', error);
      alerts.error({ title: 'Failed to fetch markers', msg: error.message, error });
      return;
    }

    updateMarkersFromRows(data);
  }

  async function loadView(bounds: LngLatBounds) {
    const minBounds = bounds.getSouthWest();
    const maxBounds = bounds.getNorthEast();

    const { data, error } = await supabase.rpc('markers_in_view', {
      max_lat: minBounds.lat,
      max_lng: minBounds.lng,
      min_lat: maxBounds.lat,
      min_lng: maxBounds.lng,
      limit_rows: 100,
    });

    if (error) {
      console.error('Failed to fetch markers', error);
      return;
    }

    updateMarkersFromRows(data);
  }

  function updateMarkersFromRows(
    rows:
      | Database['public']['Tables']['markers']['Row'][]
      | Database['public']['Functions']['markers_in_view']['Returns'],
  ) {
    rows.forEach((r) => {
      const location = r.location as Point;
      markersMap.set(r.id, {
        id: r.id,
        name: r.name,
        description: r.description,
        state: r.state,
        lng: location.coordinates[0],
        lat: location.coordinates[1],
        created_at: postgresTimestampToDate(r.created_at),
        updated_at: postgresTimestampToDate(r.updated_at),
      });
    });
  }

  // BACKEND SAVE

  let syncMarkersTimeoutId: ReturnType<typeof setInterval> | undefined;

  $effect(() => {
    if (unsyncedMarkersMap.size > 0 && syncMarkersTimeoutId === undefined && !isOffline) {
      save();
    }
  });

  $effect(() => {
    if (unsyncedMarkersMap.size === 0) {
      alerts.delete('marker-save');
    } else {
      alerts.info({
        id: 'marker-save',
        canClose: false,
        title: 'Speichern läuft...',
        msg: 'Deine Einträge werden gleich gespeichert. Bitte habe noch einen Moment Geduld. 😊',
      });
    }
  });

  async function save() {
    const markersToUpdate = Array.from(unsyncedMarkersMap.values());
    const rows = markersToUpdate.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      state: p.state,
      location: `POINT(${p.lng} ${p.lat})`,
    }));

    const { error, data } = await supabase.from('markers').upsert(rows).select();

    if (error) {
      console.error(error);
      alerts.error({
        id: 'marker-save-error',
        canClose: false,
        title: 'Speicherproblem',
        msg: 'Beim Speichern ist etwas schiefgelaufen, aber keine Panik! Wir versuchen es gleich erneut. 😊',
        error,
      });
      syncMarkersTimeoutId = setTimeout(save, 15 * 1000);
      return;
    }

    alerts.delete('marker-save-error');
    syncMarkersTimeoutId = undefined;

    data.forEach((r) => {
      const location = r.location as Point;
      const marker: Marker = {
        id: r.id,
        name: r.name,
        description: r.description,
        state: r.state,
        lng: location.coordinates[0],
        lat: location.coordinates[1],
        created_at: postgresTimestampToDate(r.created_at),
        updated_at: postgresTimestampToDate(r.updated_at),
      };
      unsyncedMarkersMap.delete(marker.id);
      markersMap.set(marker.id, marker);
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
    const { error } = await supabase.from('markers').delete().eq('id', marker.id);
    if (error) {
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
