<script lang="ts" module>
  // @ts-expect-error fix class name for mablibre
  MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
  // @ts-expect-error fix class name for mablibre
  MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
  // @ts-expect-error fix class name for mablibre
  MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

  function getDrawingTypeName(drawing: Drawing) {
    switch (drawing.geom.type) {
      case 'LineString':
        return 'Route';
      case 'Polygon':
        return 'Bereich';
      case 'Point':
        return 'POI';
      default:
        return 'Markierung';
    }
  }
</script>

<script lang="ts">
  import type {
    DrawCreateEvent,
    DrawSelectionChangeEvent,
    DrawUpdateEvent,
  } from '@mapbox/mapbox-gl-draw';
  import MapboxDraw from '@mapbox/mapbox-gl-draw';
  import { editorDrawingStyles } from './drawings-style';
  import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
  import './mapbox-gl-draw.css';
  import type { Drawing, DrawingsService } from '../../drawings.svelte';
  import type { TagsService } from '$lib/tags.svelte';
  import TagsInput from '$lib/components/TagsInput.svelte';
  import ColorPickerButton from '$lib/components/ColorPickerButton.svelte';
  import DrawingIcon from '$lib/components/DrawingIcon.svelte';
  import DrawingSize from '$lib/components/DrawingSize.svelte';
  import deepEqual from 'fast-deep-equal';
  import DrawingsOutline from './DrawingsOutline.svelte';
  import IcRoundRoute from '~icons/ic/round-route';
  import { getLayersService, getMabLibre } from '$lib/components/MapView.svelte';
  import { applyFilterToArray, type Filter } from '$lib/filter.svelte';
  import { noop } from '$lib/utils';

  interface Props {
    drawingsService: DrawingsService;
    tagsService: TagsService;
  }

  let { drawingsService, tagsService }: Props = $props();
  const map = getMabLibre();
  let draw: MapboxDraw;
  let filters = $state<Filter[]>([]);
  const filteredDrawings = $derived(applyFilterToArray(drawingsService.all, ...filters));
  let selectedDrawing = $state<Drawing>();
  let selectedDrawingOrg = $state<Drawing>();
  let isSaving = $state(false);

  const layersService = getLayersService();
  layersService.addLayer({
    id: 'drawings-edit',
    activate,
    deactivate,
    snippets: {
      selection: selectionSnippet,
      outline: {
        id: 'drawings',
        icon: IcRoundRoute,
        snippet: outlineSnippet,
      },
    },
  });

  function activate() {
    draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        point: true,
        line_string: true,
      },
      styles: editorDrawingStyles,
      userProperties: true,
      modes: {
        ...MapboxDraw.modes,
        // @ts-expect-error disable internal move function
        simple_select: { ...MapboxDraw.modes.simple_select, dragMove: noop },
        // @ts-expect-error disable internal move function
        direct_select: { ...MapboxDraw.modes.direct_select, dragFeature: noop },
      },
    });

    // @ts-expect-error type problem between mablibre and mapbox
    map.addControl(draw, 'top-left');
    map.on('draw.create', handleDrawCreate);
    map.on('draw.update', handleDrawUpdate);
    map.on('draw.selectionchange', handleSelectionChange);
    map.on('contextmenu', handleRightClick);
  }

  function deactivate() {
    // @ts-expect-error type problem between mablibre and mapbox
    map.removeControl(draw);
    map.off('draw.create', handleDrawCreate);
    map.off('draw.update', handleDrawUpdate);
    map.off('draw.selectionchange', handleSelectionChange);
    map.off('contextmenu', handleRightClick);
  }

  $effect(() => {
    draw.set({
      type: 'FeatureCollection',
      features: filteredDrawings.map((d) => ({
        type: 'Feature',
        id: d.id,
        properties: d.properties,
        geometry: d.geom,
      })),
    });
  });

  function selectDrawing(id?: string) {
    if (!id) {
      selectedDrawing = undefined;
      selectedDrawingOrg = undefined;
      return;
    }

    if (selectedDrawing && selectedDrawing.id === id) {
      return;
    }

    selectedDrawing = drawingsService.draft(id);
    selectedDrawingOrg = drawingsService.draft(id);
  }

  const isSaved = $derived.by(() => {
    if (!selectedDrawing) {
      return true;
    }
    if (!selectedDrawingOrg) {
      return false;
    }
    return deepEqual(selectedDrawing, selectedDrawingOrg);
  });

  async function handleDrawUpdate(e: DrawUpdateEvent) {
    const drawing = selectedDrawing;
    if (!drawing) {
      return;
    }

    const feature = e.features.find((f) => f.id === drawing.id);
    if (!feature) {
      return;
    }

    if (deepEqual(drawing.geom, feature.geometry)) {
      return;
    }

    drawing.geom = feature.geometry;
    saveDrawing(drawing);
  }

  function handleDrawCreate(e: DrawCreateEvent) {
    const feature = e.features.at(0);
    if (!feature) {
      return;
    }

    selectDrawing(feature.id as string);
    if (selectedDrawing) {
      selectedDrawing.geom = feature.geometry;
      saveDrawing(selectedDrawing);
    }
  }

  function handleSelectionChange(e: DrawSelectionChangeEvent) {
    const feature = e.features.at(0);
    if (feature) {
      selectDrawing(feature.id as string);
    } else {
      selectDrawing();
    }
  }

  async function saveDrawing(drawing: Drawing) {
    isSaving = true;
    const success = await drawingsService.updateOrCreate([drawing]);
    isSaving = false;
    if (success && drawing.id === selectedDrawing?.id) {
      selectedDrawing = drawingsService.draft(drawing.id);
      selectedDrawingOrg = drawingsService.draft(drawing.id);
    }
  }

  function handleSaveClick() {
    if (selectedDrawing) {
      saveDrawing(selectedDrawing);
    }
  }

  function handleDeleteClick() {
    if (!selectedDrawing) {
      return;
    }

    drawingsService.remove([selectedDrawing.id]);
    draw.delete(selectedDrawing.id);
    selectDrawing();
  }

  function handleRightClick() {
    const points = draw.getSelectedPoints();
    if (points.features.length === 0) {
      return;
    }

    draw.trash();
  }

  function tagsProvider(value: string) {
    return tagsService.values.filter(
      (t) => t.includes(value) && !selectedDrawing?.tags.includes(t),
    );
  }

  function handleReverseClick() {
    if (!selectedDrawing || selectedDrawing.geom.type !== 'LineString') {
      return;
    }

    selectedDrawing.geom.coordinates = [...selectedDrawing.geom.coordinates].reverse();
  }
</script>

{#snippet selectionSnippet()}
  {#if selectedDrawing}
    <section>
      <h3>{getDrawingTypeName(selectedDrawing)}</h3>
      <div>
        <DrawingIcon drawing={selectedDrawing} />
        <DrawingSize drawing={selectedDrawing} />
      </div>
      <div>
        Erstellt: {selectedDrawing.created_at.toLocaleString()}
      </div>
      <div>
        Bearbeitet: {selectedDrawing.updated_at.toLocaleString()}
      </div>
      <label>
        Tags
        <TagsInput bind:tags={selectedDrawing.tags} options={tagsProvider} />
      </label>
      <label>
        Name
        <input type="text" bind:value={selectedDrawing.name} />
      </label>
      <label>
        Bemerkung
        <textarea bind:value={selectedDrawing.description}></textarea>
      </label>
      <label>
        Farbe
        <ColorPickerButton bind:color={selectedDrawing.properties.color} />
      </label>
      <button onclick={handleReverseClick}>Reverse</button>
      <div class="buttons">
        <button class="button-primary" onclick={handleSaveClick} disabled={isSaved || isSaving}>
          Speichern
        </button>
        <button class="button-accent" onclick={handleDeleteClick} disabled={isSaving}>
          Löschen
        </button>
      </div>
    </section>
  {/if}
{/snippet}

{#snippet outlineSnippet()}
  <DrawingsOutline {map} {drawingsService} {tagsService} bind:filters />
{/snippet}

<style>
  section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
