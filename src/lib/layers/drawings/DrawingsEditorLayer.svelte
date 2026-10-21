<script lang="ts" module>
  // @ts-expect-error fix class name for mablibre
  MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
  // @ts-expect-error fix class name for mablibre
  MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
  // @ts-expect-error fix class name for mablibre
  MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';
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
  import deepEqual from 'fast-deep-equal';
  import { getLayersService, getMabLibre } from '#lib/components/MapView.svelte';

  interface Props {
    drawingsService: DrawingsService;
    /** drawings shown on the map */
    drawings: Drawing[];
    /** id of the selected drawing, the map and the sidebar both change it */
    selectedId?: string;
    /** may refuse the change, e.g. when there are unsaved edits */
    onselect: (id: string | undefined) => boolean | Promise<boolean>;
  }

  let { drawingsService, drawings, selectedId, onselect }: Props = $props();
  const map = getMabLibre();
  let draw: MapboxDraw;

  const layersService = getLayersService();
  layersService.addLayer({ id: 'drawings-edit', activate, deactivate });

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
    });

    // @ts-expect-error type problem between mablibre and mapbox
    map.addControl(draw, 'top-left');
    // @ts-expect-error mapbox-gl-draw events are not part of maplibre's MapEventType
    map.on('draw.create', handleDrawCreate);
    // @ts-expect-error mapbox-gl-draw events are not part of maplibre's MapEventType
    map.on('draw.update', handleDrawUpdate);
    // @ts-expect-error mapbox-gl-draw events are not part of maplibre's MapEventType
    map.on('draw.selectionchange', handleSelectionChange);
    map.on('contextmenu', handleRightClick);
  }

  function deactivate() {
    // @ts-expect-error type problem between mablibre and mapbox
    map.removeControl(draw);
    // @ts-expect-error mapbox-gl-draw events are not part of maplibre's MapEventType
    map.off('draw.create', handleDrawCreate);
    // @ts-expect-error mapbox-gl-draw events are not part of maplibre's MapEventType
    map.off('draw.update', handleDrawUpdate);
    // @ts-expect-error mapbox-gl-draw events are not part of maplibre's MapEventType
    map.off('draw.selectionchange', handleSelectionChange);
    map.off('contextmenu', handleRightClick);
  }

  $effect(() => {
    draw.set({
      type: 'FeatureCollection',
      features: drawings.map((d) => ({
        type: 'Feature',
        id: d.id,
        properties: d.properties,
        geometry: d.geom,
      })),
    });
  });

  // reflect a selection made in the sidebar on the map
  $effect(() => {
    const current = draw.getSelectedIds();
    const wanted = selectedId && draw.get(selectedId) ? [selectedId] : [];
    if (!deepEqual(current, wanted)) {
      draw.changeMode('simple_select', { featureIds: wanted });
    }
  });

  async function handleDrawUpdate(e: DrawUpdateEvent) {
    for (const feature of e.features) {
      const drawing = drawingsService.draft(feature.id as string);
      if (deepEqual(drawing.geom, feature.geometry)) {
        continue;
      }
      // the geometry is owned by the map, other fields by the sidebar form
      drawing.geom = feature.geometry;
      await drawingsService.updateOrCreate([drawing]);
    }
  }

  async function handleDrawCreate(e: DrawCreateEvent) {
    const feature = e.features.at(0);
    if (!feature) {
      return;
    }

    const drawing = drawingsService.draft(feature.id as string);
    drawing.geom = feature.geometry;
    if (await drawingsService.updateOrCreate([drawing])) {
      onselect(drawing.id);
    }
  }

  async function handleSelectionChange(e: DrawSelectionChangeEvent) {
    const id = e.features.at(0)?.id as string | undefined;
    if (id !== selectedId && !(await onselect(id))) {
      draw.changeMode('simple_select', { featureIds: selectedId ? [selectedId] : [] });
    }
  }

  function handleRightClick() {
    const points = draw.getSelectedPoints();
    if (points.features.length === 0) {
      return;
    }

    draw.trash();
  }
</script>
