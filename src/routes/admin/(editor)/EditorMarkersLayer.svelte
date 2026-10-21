<script lang="ts">
  import type { GeoJSONSource, MapMouseEvent } from 'maplibre-gl';
  import { point } from '@turf/turf';
  import type { Marker } from '#lib/markers.svelte.js';
  import { getLayersService, getMabLibre } from '#lib/components/MapView.svelte';
  import { stateColors, unsyncedColor } from '#lib/marker-states.js';

  interface Props {
    markers: Marker[];
    isUnsynced: (id: string) => boolean;
    /** the marker being edited, drawn at its (possibly unsaved) position */
    selected?: Marker;
    /** while picking, clicks on the map set a position instead of selecting */
    picking: boolean;
    onmarkerclick: (id: string) => void;
    /** clicks that did not hit a marker, or any click while picking */
    onmapclick: (e: MapMouseEvent) => void;
  }

  let { markers, isUnsynced, selected, picking, onmarkerclick, onmapclick }: Props = $props();

  const map = getMabLibre();
  let markersSource = $state<GeoJSONSource>();
  let selectedSource = $state<GeoJSONSource>();

  getLayersService().addLayer({ id: 'editor-markers', activate, deactivate });

  function activate() {
    map.addSource('editor-markers', { type: 'geojson', data: emptyCollection() });
    markersSource = map.getSource('editor-markers') as GeoJSONSource;
    map.addLayer({
      id: 'editor-markers',
      type: 'circle',
      source: 'editor-markers',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 2, 15, 7, 18, 10],
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 2,
        'circle-stroke-color': ['case', ['get', 'unsynced'], unsyncedColor, '#ffffff'],
      },
    });

    map.addSource('editor-markers-selected', { type: 'geojson', data: emptyCollection() });
    selectedSource = map.getSource('editor-markers-selected') as GeoJSONSource;
    map.addLayer({
      id: 'editor-markers-selected',
      type: 'circle',
      source: 'editor-markers-selected',
      paint: {
        'circle-radius': 16,
        'circle-color': 'transparent',
        'circle-stroke-width': 8,
        'circle-stroke-color': '#00000055',
      },
    });

    map.on('click', handleClick);
    map.on('mouseenter', 'editor-markers', setPointer);
    map.on('mouseleave', 'editor-markers', updateCursor);
  }

  function deactivate() {
    map.off('click', handleClick);
    map.off('mouseenter', 'editor-markers', setPointer);
    map.off('mouseleave', 'editor-markers', updateCursor);
    map.removeLayer('editor-markers-selected');
    map.removeSource('editor-markers-selected');
    map.removeLayer('editor-markers');
    map.removeSource('editor-markers');
  }

  function emptyCollection(): GeoJSON.FeatureCollection {
    return { type: 'FeatureCollection', features: [] };
  }

  $effect(() => {
    // the selected marker is drawn at its draft position, new ones are not in the list yet
    const all = markers.filter((m) => m.id !== selected?.id);
    if (selected) {
      all.push(selected);
    }
    markersSource?.setData({
      type: 'FeatureCollection',
      features: all.map((m) =>
        point([m.lng, m.lat], {
          id: m.id,
          color: stateColors[m.state],
          unsynced: isUnsynced(m.id),
        }),
      ),
    });
  });

  $effect(() => {
    selectedSource?.setData({
      type: 'FeatureCollection',
      features: selected ? [point([selected.lng, selected.lat])] : [],
    });
  });

  $effect(() => {
    // pick mode changes the cursor until it is left again
    updateCursor();
  });

  function setPointer() {
    if (!picking) {
      map.getCanvas().style.cursor = 'pointer';
    }
  }

  function updateCursor() {
    map.getCanvas().style.cursor = picking ? 'crosshair' : '';
  }

  function handleClick(e: MapMouseEvent) {
    if (picking) {
      onmapclick(e);
      return;
    }

    const hit = map.queryRenderedFeatures(e.point, { layers: ['editor-markers'] }).at(0);
    if (hit) {
      onmarkerclick(hit.properties.id as string);
    } else {
      onmapclick(e);
    }
  }
</script>
