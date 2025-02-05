<script lang="ts">
  import { getLayersService, getMabLibre } from '$lib/components/MapView.svelte';
  import type { GeoJSONSource } from 'maplibre-gl';
  import { circleColor, hiddenColor, lineColor, polygonColor } from './drawings-style';
  import type { DrawingsService } from '$lib/drawings.svelte';
  import { filtersMatch, type Filter } from '$lib/filter.svelte';

  interface Props {
    drawingsService: DrawingsService;
    filters: Filter[];
    showFiltered?: number;
  }

  let { drawingsService, filters, showFiltered = 13 }: Props = $props();

  const map = getMabLibre();
  let mapSource = $state<GeoJSONSource>();

  const layersService = getLayersService();
  layersService.addLayer({ id: 'drawings-view', activate, deactivate, snippets: {} });

  async function activate() {
    map.addSource('drawings', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    });

    map.addLayer({
      id: 'lines',
      type: 'line',
      source: 'drawings',
      filter: [
        'all',
        ['any', ['==', ['geometry-type'], 'LineString'], ['==', ['geometry-type'], 'Polygon']],
        ['any', ['==', ['get', 'hidden'], false], ['>', ['zoom'], showFiltered]],
      ],
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'hidden'], true],
          hiddenColor,
          ['has', 'color'],
          ['get', 'color'],
          ['==', ['geometry-type'], 'LineString'],
          lineColor,
          polygonColor,
        ],
        'line-width': 3.5,
        'line-opacity': 0.7,
      },
    });

    map.addLayer({
      id: 'points',
      type: 'circle',
      source: 'drawings',
      filter: [
        'all',
        ['==', ['geometry-type'], 'Point'],
        ['any', ['==', ['get', 'hidden'], false], ['>', ['zoom'], 13]],
      ],
      paint: {
        'circle-radius': 7,
        'circle-color': 'transparent',
        'circle-stroke-color': [
          'case',
          ['==', ['get', 'hidden'], true],
          hiddenColor,
          ['has', 'color'],
          ['get', 'color'],
          circleColor,
        ],
        'circle-stroke-width': 3,
        'circle-opacity': 0.7,
      },
    });

    try {
      const imageResponse = await map.loadImage('/route-start-symbol.png');
      map.addImage('start-image', imageResponse.data);
      map.addLayer({
        id: 'line-start-symbol',
        type: 'symbol',
        source: 'drawings',
        filter: [
          'all',
          ['==', ['geometry-type'], 'LineString'],
          ['==', ['get', 'hidden'], false],
          ['>', ['zoom'], 12],
        ],
        layout: {
          'icon-image': 'start-image',
          'icon-size': 0.5,
          'icon-allow-overlap': true,
          'symbol-placement': 'point',
          'symbol-z-order': 'source',
        },
      });
    } catch (e) {
      console.error(e);
    }

    mapSource = map.getSource('drawings') as GeoJSONSource;
  }

  function deactivate() {
    mapSource = undefined;
    map.removeLayer('points');
    map.removeLayer('lines');
    map.removeSource('drawings');
  }

  $effect(() => {
    if (mapSource) {
      mapSource.setData({
        type: 'FeatureCollection',
        features: drawingsService.all.map((d) => ({
          type: 'Feature',
          id: d.id,
          properties: { ...d.properties, hidden: !filtersMatch(d, ...filters) },
          geometry: d.geom,
        })),
      });
    }
  });
</script>
