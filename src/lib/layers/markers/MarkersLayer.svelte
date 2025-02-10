<script lang="ts">
  import MarkerSelection, { type MarkerSelectionMode } from './MarkerSelection.svelte';
  import type { GeoJSONSource, MapLayerMouseEvent } from 'maplibre-gl';
  import IcRoundAddLocation from '~icons/ic/round-add-location';
  import type { DialogParams, DialogsService } from '$lib/dialogs.svelte';
  import type { Marker, MarkersService, MarkerState } from '../../markers.svelte';
  import { getLayersService, getMabLibre } from '$lib/components/MapView.svelte';
  import { point } from '@turf/turf';
  import type { Feature, Point } from 'geojson';
  import { canUpdateLocation } from '$lib/utils';

  const confirmDialogParams = {
    title: 'Ungespeicherte Änderungen',
    msg: 'Deine Änderungen wurden noch nicht gespeichert. Möchtest du diese verwerfen?',
    buttons: {
      cancel: { type: 'primary', label: 'Bearbeiten forsetzten' },
      confirm: { type: 'accent', label: 'Änderung verwerfen' },
    },
  } satisfies DialogParams;

  const stateColors: Record<MarkerState, string> = {
    new: 'red',
    marked: 'yellow',
    done: 'green',
  };

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
    snippets: {},
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
          borderColor: 'orange',
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

    const center = map.getCenter();
    const date = new Date();
    selectedMarker = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      state: 'new',
      lat: center.lat,
      lng: center.lng,
      created_at: date,
      updated_at: date,
    };
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

  function handleMarkerDelete() {
    if (selectedMarker) {
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
    return (await dialogsService.modal(confirmDialogParams)) === 'confirm';
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
    canMove={canMove || canUpdateLocation(selectedMarker.created_at)}
    onSave={handleMarkerDetailsSave}
    onDelete={handleMarkerDelete}
    onClose={handleMarkerDetailsClose}
  />
{/if}

{#if !selectedMarker && canInsert}
  <button class="button-primary button-icon button-overlay button-create" onclick={handleNewClick}>
    <IcRoundAddLocation />
  </button>
{/if}

<style>
  .button-create {
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    z-index: 3;
    font-size: 3rem;
  }
</style>
