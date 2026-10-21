<script lang="ts">
  import {
    getDialogsService,
    getDrawingsService,
    getMarkersService,
    getTagsService,
  } from '#lib/components/AppServices.svelte';
  import MapLayers from '#lib/layers/MapLayers.svelte';
  import { createLayersService } from '#lib/layers.svelte.js';
  import MapView from '#lib/components/MapView.svelte';
  import DrawingsEditorLayer from '#lib/layers/drawings/DrawingsEditorLayer.svelte';
  import { applyFilterToArray, type Filter, type FilterOperator } from '#lib/filter.svelte.js';
  import type { Drawing } from '#lib/drawings.svelte.js';
  import { newMarker, type Marker } from '#lib/markers.svelte.js';
  import { discardChangesDialog } from '#lib/dialogs.svelte.js';
  import { createMapViewStorage } from '#lib/storage.svelte.js';
  import { bbox } from '@turf/turf';
  import deepEqual from 'fast-deep-equal';
  import type { Map as MapLibre, MapMouseEvent } from 'maplibre-gl';
  import { onMount } from 'svelte';
  import EditorMarkersLayer from './EditorMarkersLayer.svelte';
  import FeatureList, { type ListTab } from './FeatureList.svelte';
  import DrawingDetails from './DrawingDetails.svelte';
  import MarkerDetails from './MarkerDetails.svelte';

  type Selection =
    { type: 'drawing'; id: string } | { type: 'marker'; id: string; isNew: boolean } | undefined;

  const layersService = createLayersService();
  const drawingsService = getDrawingsService();
  const markersService = getMarkersService();
  const tagsService = getTagsService();
  const dialogsService = getDialogsService();
  const { getValue: getMapProps, setValue: setMapProps } = createMapViewStorage();
  const mapProps = getMapProps();

  let map = $state<MapLibre>();
  let selection = $state<Selection>();
  let tab = $state<ListTab>('shapes');
  let filterTags = $state<string[]>([]);
  let filterOperator = $state<FilterOperator>('contains');
  const filters = $derived<Filter[]>(
    filterTags.length > 0 ? [{ field: 'tags', operator: filterOperator, values: filterTags }] : [],
  );
  let drawingDetails = $state<DrawingDetails>();
  let markerDraft = $state<Marker>();
  let markerSaved = $state<Marker>();
  let picking = $state(false);
  /** mobile only: whether the bottom sheet takes most of the screen */
  let expanded = $state(false);

  const filteredDrawings = $derived(applyFilterToArray(drawingsService.all, ...filters));

  // markers waiting to be synced replace their server version
  const allMarkers = $derived.by(() => {
    const byId = new Map(markersService.all.map((m) => [m.id, m]));
    markersService.allUnsynced.forEach((m) => byId.set(m.id, m));
    return [...byId.values()];
  });

  const markerDirty = $derived(
    !!markerDraft && !!markerSaved && !deepEqual($state.snapshot(markerDraft), markerSaved),
  );
  const dirty = $derived(
    selection?.type === 'drawing' ? (drawingDetails?.isDirty() ?? false) : markerDirty,
  );

  onMount(() => {
    markersService.loadAll();
  });

  async function confirmDiscard() {
    if (!dirty) {
      return true;
    }
    return (await dialogsService.modal(discardChangesDialog)) === 'discard';
  }

  function isSame(a: Selection, b: Selection) {
    return a?.type === b?.type && a?.id === b?.id;
  }

  /** changes the selection, returns false when the user keeps editing */
  async function select(next: Selection, marker?: Marker) {
    if (isSame(selection, next)) {
      return true;
    }
    if (!(await confirmDiscard())) {
      return false;
    }
    setSelection(next, marker);
    return true;
  }

  function setSelection(next: Selection, marker?: Marker) {
    picking = false;
    selection = next;

    if (next?.type === 'marker') {
      const source = marker ?? markersService.draft(next.id);
      markerDraft = source ? $state.snapshot(source) : undefined;
      markerSaved = markerDraft ? $state.snapshot(markerDraft) : undefined;
      tab = 'markers';
    } else {
      markerDraft = undefined;
      markerSaved = undefined;
      if (next) {
        tab = 'shapes';
      }
    }
    expanded = !!next;
  }

  function zoomToDrawing(drawing: Drawing) {
    const [minLng, minLat, maxLng, maxLat] = bbox(drawing.geom);
    map?.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 80, maxZoom: 18 },
    );
  }

  function zoomToMarker(marker: Marker) {
    map?.flyTo({ center: [marker.lng, marker.lat], zoom: Math.max(map.getZoom(), 17) });
  }

  async function handleSelectDrawing(drawing: Drawing) {
    if (await select({ type: 'drawing', id: drawing.id })) {
      zoomToDrawing(drawing);
    }
  }

  async function handleSelectMarker(marker: Marker) {
    if (await select({ type: 'marker', id: marker.id, isNew: false })) {
      zoomToMarker(marker);
    }
  }

  async function handleAddMarker() {
    if (!map) {
      return;
    }
    const marker = newMarker(map.getCenter());
    if (await select({ type: 'marker', id: marker.id, isNew: true }, marker)) {
      picking = true;
    }
  }

  function handleMapClick(e: MapMouseEvent) {
    if (picking && markerDraft) {
      markerDraft.lng = e.lngLat.lng;
      markerDraft.lat = e.lngLat.lat;
      picking = false;
      return;
    }

    // clicks on shapes are handled by the drawing tools
    const onShape = map
      ?.queryRenderedFeatures(e.point)
      .some((f) => f.source.startsWith('mapbox-gl-draw'));
    if (selection?.type === 'marker' && !onShape) {
      select(undefined);
    }
  }

  function handleSaveMarker() {
    if (!markerDraft || selection?.type !== 'marker') {
      return;
    }
    const marker = { ...$state.snapshot(markerDraft), updatedAt: new Date() };
    markersService.saveDraft(marker);
    markerDraft = marker;
    markerSaved = $state.snapshot(marker);
    selection = { ...selection, isNew: false };
  }

  async function handleDeleteMarker() {
    if (!markerDraft) {
      return;
    }
    const action = await dialogsService.modal({
      title: 'Delete marker',
      msg: `Do you really want to delete “${markerDraft.name || 'Untitled'}”?`,
      buttons: {
        cancel: { type: 'none', label: 'Cancel' },
        delete: { type: 'accent', label: 'Delete' },
      },
    });
    if (action === 'delete') {
      markersService.remove(markerDraft);
      setSelection(undefined);
    }
  }
</script>

<div class="editor" class:expanded class:has-selection={!!selection}>
  <aside class="sidebar">
    <button
      class="grabber"
      aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
      onclick={() => (expanded = !expanded)}
    >
      <span></span>
    </button>

    {#if selection?.type === 'drawing'}
      {#key selection.id}
        <DrawingDetails
          id={selection.id}
          {drawingsService}
          {tagsService}
          {dialogsService}
          bind:this={drawingDetails}
          onclose={() => select(undefined)}
          ondelete={() => setSelection(undefined)}
          onzoom={zoomToDrawing}
        />
      {/key}
    {:else if selection?.type === 'marker' && markerDraft}
      <MarkerDetails
        bind:draft={markerDraft}
        bind:picking
        isNew={selection.isNew}
        unsynced={markersService.isUnsynced(selection.id)}
        dirty={markerDirty}
        onclose={() => select(undefined)}
        onzoom={() => markerDraft && zoomToMarker(markerDraft)}
        onsave={handleSaveMarker}
        ondelete={handleDeleteMarker}
      />
    {:else}
      <FeatureList
        {map}
        drawings={filteredDrawings}
        drawingsTotal={drawingsService.all.length}
        markers={allMarkers}
        isUnsynced={markersService.isUnsynced}
        {tagsService}
        bind:tags={filterTags}
        bind:operator={filterOperator}
        {filters}
        bind:tab
        onselectdrawing={handleSelectDrawing}
        onselectmarker={handleSelectMarker}
        onaddmarker={handleAddMarker}
      />
    {/if}
  </aside>

  <div class="map">
    <MapView
      {layersService}
      center={mapProps.center}
      zoom={mapProps.zoom}
      onloaded={(m) => (map = m)}
      onmoveend={(m) => setMapProps({ center: m.getCenter(), zoom: m.getZoom() })}
    >
      <MapLayers />
      <DrawingsEditorLayer
        {drawingsService}
        drawings={filteredDrawings}
        selectedId={selection?.type === 'drawing' ? selection.id : undefined}
        onselect={(id) => select(id ? { type: 'drawing', id } : undefined)}
      />
      <EditorMarkersLayer
        markers={allMarkers}
        isUnsynced={markersService.isUnsynced}
        selected={markerDraft}
        {picking}
        onmarkerclick={(id) => select({ type: 'marker', id, isNew: false })}
        onmapclick={handleMapClick}
      />
    </MapView>
    {#if picking}
      <div class="pick-hint">Click on the map to place the marker</div>
    {/if}
  </div>
</div>

<style>
  .editor {
    display: grid;
    grid-template-columns: 22rem minmax(0, 1fr);
    grid-template-areas: 'sidebar map';
    height: 100%;
    min-height: 0;
    background-color: var(--c-base-100);
  }

  .sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    border-right: 1px solid var(--c-border);
    background-color: var(--c-base-100);
  }

  .sidebar > :global(:not(.grabber)) {
    flex: 1;
    min-height: 0;
  }

  .map {
    grid-area: map;
    position: relative;
    min-height: 0;
  }

  .grabber {
    display: none;
  }

  .pick-hint {
    position: absolute;
    top: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background-color: var(--c-base-600);
    color: var(--c-base-100);
    font-size: var(--fs-sm);
    box-shadow: var(--shadow-md);
    pointer-events: none;
  }

  /* mobile: the map on top, the sidebar becomes a bottom sheet */
  @media (max-width: 720px) {
    .editor {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: 1fr auto;
      grid-template-areas: 'map' 'sidebar';
    }

    .sidebar {
      height: 38svh;
      border-right: none;
      border-top: 1px solid var(--c-border);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      margin-top: calc(-1 * var(--radius-lg));
      position: relative;
      z-index: 2;
      box-shadow: 0 -8px 24px rgb(16 24 40 / 0.12);
      transition: height 0.2s ease;
    }

    .expanded .sidebar {
      height: 58svh;
    }

    .grabber {
      display: grid;
      place-items: center;
      flex: none;
      height: 1.25rem;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
    }

    .grabber span {
      width: 2.5rem;
      height: 0.3rem;
      border-radius: 999px;
      background-color: var(--c-base-500);
    }
  }
</style>
