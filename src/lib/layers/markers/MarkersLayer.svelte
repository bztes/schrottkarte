<script lang="ts">
  import MarkerSelection, { type MarkerSelectionMode } from './MarkerSelection.svelte';
  import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
  import LucideMapPinPlus from '~icons/lucide/map-pin-plus';
  import {
    discardChangesDialog,
    type DialogParams,
    type DialogsService,
  } from '#lib/dialogs.svelte.js';
  import { newMarker, type Marker, type MarkersService } from '../../markers.svelte';
  import { stateColors, unsyncedColor } from '#lib/marker-states.js';
  import Fab from '#lib/components/ui/Fab.svelte';
  import { getLayersService, getMabLibre } from '#lib/components/MapView.svelte';
  import { point } from '@turf/turf';
  import type { Feature, Point } from 'geojson';
  import { canUpdateLocation } from '#lib/utils.js';

  const deleteDialogParams = {
    title: 'Delete marker',
    msg: 'Do you really want to delete this marker? This cannot be undone.',
    buttons: {
      cancel: { type: 'primary', label: 'Keep marker' },
      confirm: { type: 'accent', label: 'Delete' },
    },
  } satisfies DialogParams;

  interface Props {
    markersService: MarkersService;
    dialogsService: DialogsService;
    canUpdate?: boolean;
    canDelete?: boolean;
    canInsert?: boolean;
    canMove?: boolean;
  }

  const map = getMabLibre();

  let {
    markersService,
    dialogsService,
    canUpdate = false,
    canDelete = false,
    canInsert = false,
    canMove = false,
  }: Props = $props();

  let selectedMarker = $state<Marker>();
  let selectedMarkerMode: MarkerSelectionMode = $state('view');
  let selectedMarkerHasChanged = $state(false);
  let mapSource = $state<GeoJSONSource>();
  let highlightSource = $state<GeoJSONSource>();
  let markerFeatures = $derived.by(getFeatures);

  const layersService = getLayersService();
  layersService.addLayer({
    id: 'markers',
    activate,
    deactivate,
  });

  function activate() {
    map.addSource('markers', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
      promoteId: 'id',
    });
    mapSource = map.getSource('markers') as GeoJSONSource;

    map.addLayer({
      id: 'markers',
      type: 'circle',
      source: 'markers',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 1, 15, 8],
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 3,
        'circle-stroke-color': ['get', 'borderColor'],
      },
    });

    map.addSource('markers-highlight', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });
    highlightSource = map.getSource('markers-highlight') as GeoJSONSource;

    map.addLayer({
      id: 'markers-highlight',
      type: 'circle',
      source: 'markers-highlight',
      paint: {
        'circle-radius': 16,
        'circle-color': 'transparent',
        'circle-stroke-width': 8,
        'circle-stroke-color': '#00000055',
      },
    });

    map.on('moveend', handleMoveEnd);
    map.on('click', 'markers', onMarkerLayerClick);

    markersService.loadAll();
  }

  function deactivate() {
    map.off('moveend', handleMoveEnd);
    map.off('click', 'markers', onMarkerLayerClick);
    map.removeLayer('markers');
    map.removeSource('markers');
  }

  function getFeatures() {
    let features: Feature<Point>[] = [];

    for (const marker of markersService.all) {
      if (markersService.isUnsynced(marker.id)) {
        continue;
      }

      features.push(
        point([marker.lng, marker.lat], {
          id: marker.id,
          color: stateColors[marker.state],
          borderColor: 'transparent',
        }),
      );
    }

    for (const marker of markersService.allUnsynced) {
      features.push(
        point([marker.lng, marker.lat], {
          id: marker.id,
          color: stateColors[marker.state],
          borderColor: unsyncedColor,
        }),
      );
    }

    return features;
  }

  $effect(() => {
    mapSource?.setData({
      type: 'FeatureCollection',
      features: markerFeatures,
    });
  });

  $effect(() => {
    if (selectedMarker) {
      map.panTo({ lat: selectedMarker.lat, lng: selectedMarker.lng });
    }
  });

  export async function createMarker() {
    if (!(await confirmDiscard())) {
      return;
    }

    selectedMarker = newMarker(map.getCenter());
    selectedMarkerMode = 'create';
  }

  async function selectMarker(marker?: Marker) {
    if (!marker) {
      if (await confirmDiscard()) {
        selectedMarker = undefined;
        selectedMarkerMode = 'view';
        selectedMarkerHasChanged = false;
      }
      return;
    }

    if (selectedMarker && marker.id !== selectedMarker.id && !(await confirmDiscard())) {
      return;
    }

    selectedMarker = markersService.draft(marker.id);
    selectedMarkerMode = 'view';
  }

  $effect(() => {
    if (!highlightSource) {
      return;
    }

    highlightSource.setData({
      type: 'FeatureCollection',
      features:
        selectedMarker && selectedMarkerMode !== 'create'
          ? [point([selectedMarker.lng, selectedMarker.lat])]
          : [],
    });
  });

  function handleMarkerDetailsSave() {
    if (selectedMarker) {
      markersService.saveDraft(selectedMarker);
      selectMarker(undefined);
    }
  }

  async function handleMarkerDelete() {
    if (selectedMarker && (await dialogsService.modal(deleteDialogParams)) === 'confirm') {
      markersService.remove(selectedMarker);
      selectMarker(undefined);
    }
  }

  function handleMoveEnd() {
    markersService.loadView(map.getBounds());
  }

  async function onMarkerLayerClick(e: MapLayerMouseEvent) {
    if (!e.features) {
      return;
    }

    const feature = e.features.at(0);
    if (!feature) {
      return;
    }

    const marker = markersService.get(feature.id as string);
    if (!marker) {
      return;
    }

    await selectMarker(marker);
    if (selectedMarker) {
      map?.panTo({ lng: selectedMarker.lng, lat: selectedMarker.lat });
    }
  }

  function handleMarkerDetailsClose() {
    selectMarker(undefined);
  }

  async function confirmDiscard() {
    if (!selectedMarkerHasChanged) {
      return true;
    }
    return (await dialogsService.modal(discardChangesDialog)) === 'discard';
  }

  function handleNewClick() {
    createMarker();
  }
</script>

{#if selectedMarker}
  <MarkerSelection
    bind:marker={selectedMarker}
    bind:hasChanged={selectedMarkerHasChanged}
    bind:mode={selectedMarkerMode}
    {map}
    {canUpdate}
    {canDelete}
    canMove={canMove || canUpdateLocation(selectedMarker.createdAt)}
    onSave={handleMarkerDetailsSave}
    onDelete={handleMarkerDelete}
    onClose={handleMarkerDetailsClose}
  />
{/if}

{#if !selectedMarker && canInsert}
  <div class="create">
    <Fab label="Add marker" onclick={handleNewClick}>
      {#snippet icon()}<LucideMapPinPlus />{/snippet}
    </Fab>
  </div>
{/if}

<style>
  .create {
    position: absolute;
    z-index: 3;
    display: flex;
    right: 2.25rem;
    bottom: 2.25rem;
  }

  @media (max-width: 720px) {
    .create {
      bottom: calc(2.25rem + env(safe-area-inset-bottom));
    }
  }
</style>
