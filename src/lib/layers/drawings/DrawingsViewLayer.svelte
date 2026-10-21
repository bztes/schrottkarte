<script lang="ts">
  import { getLayersService, getMabLibre } from '#lib/components/MapView.svelte';
  import type { FilterSpecification, GeoJSONSource, SymbolLayerSpecification } from 'maplibre-gl';
  import { circleColor, hiddenColor, lineColor, polygonColor } from './drawings-style';
  import type { DrawingsService } from '#lib/drawings.svelte.js';
  import { filtersMatch, type Filter } from '#lib/filter.svelte.js';
  import routeArrowIcon from '#lib/assets/map-icons/route-arrow.png';
  import routeStartIcon from '#lib/assets/map-icons/route-start.png';

  interface Props {
    drawingsService: DrawingsService;
    filters: Filter[];
    showFiltered?: number;
  }

  let { drawingsService, filters, showFiltered = 13 }: Props = $props();

  const map = getMabLibre();
  let mapSource = $state<GeoJSONSource>();

  const layersService = getLayersService();
  layersService.addLayer({ id: 'drawings-view', activate, deactivate });

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
      const [arrowImage, startImage] = await Promise.all([
        map.loadImage(routeArrowIcon),
        map.loadImage(routeStartIcon),
      ]);
      // SDF icons, tinted with the route color and outlined with the halo
      map.addImage('arrow-image', arrowImage.data, { sdf: true });
      map.addImage('start-image', startImage.data, { sdf: true });
      const routeFilter: FilterSpecification = [
        'all',
        ['==', ['geometry-type'], 'LineString'],
        ['==', ['get', 'hidden'], false],
        ['>', ['zoom'], 12],
      ];
      const routeIconPaint = {
        'icon-color': ['case', ['has', 'color'], ['get', 'color'], lineColor],
        'icon-halo-color': '#ffffff',
        'icon-halo-width': 1.5,
      } satisfies SymbolLayerSpecification['paint'];
      map.addLayer({
        id: 'line-arrow-symbol',
        type: 'symbol',
        source: 'drawings',
        filter: routeFilter,
        layout: {
          'icon-image': 'arrow-image',
          'icon-allow-overlap': true,
          'symbol-placement': 'line',
          'symbol-spacing': 80,
        },
        paint: routeIconPaint,
      });
      map.addLayer({
        id: 'line-start-symbol',
        type: 'symbol',
        source: 'drawings',
        filter: routeFilter,
        layout: {
          'icon-image': 'start-image',
          'icon-size': 1.4,
          'icon-allow-overlap': true,
          'symbol-placement': 'point',
          'symbol-z-order': 'source',
        },
        paint: routeIconPaint,
      });
    } catch (e) {
      console.error(e);
    }

    mapSource = map.getSource('drawings') as GeoJSONSource;
  }

  function deactivate() {
    mapSource = undefined;
    map.removeLayer('line-start-symbol');
    map.removeLayer('line-arrow-symbol');
    map.removeImage('start-image');
    map.removeImage('arrow-image');
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
