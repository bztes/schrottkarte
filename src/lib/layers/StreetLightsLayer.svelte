<script lang="ts">
  import { getLayersService, getMabLibre } from '$lib/components/MapView.svelte';

  const map = getMabLibre();
  const layersService = getLayersService();
  layersService.addLayer({ id: 'street-lights-berlin', activate, deactivate, snippets: {} });

  function activate() {
    map.addSource('street-lights', {
      type: 'vector',
      url: 'https://tiles.app.bztes.dev/data/beleuchtung-berlin.json',
      attribution:
        '&copy; <a href="https://www.berlin.de/sen/sbw/stadtdaten/geoportal/">Geoportal Berlin / Öffentliche Beleuchtung</a> <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    });

    map.addLayer({
      id: 'street-lights-marker',
      type: 'circle',
      source: 'street-lights',
      'source-layer': 'beleuchtung',
      paint: {
        'circle-color': 'red',
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 0, 15, 3.5],
        'circle-opacity': 0.5,
      },
    });

    map.addLayer({
      id: 'street-lights-label',
      type: 'symbol',
      source: 'street-lights',
      'source-layer': 'beleuchtung',
      minzoom: 17,
      layout: {
        'text-field': ['get', 'kurznummer'],
        'text-size': 12,
        'text-offset': [0, 0.5],
        'text-anchor': 'top',
        'text-allow-overlap': false,
        'text-font': ['Open Sans Regular'],
      },
      paint: {
        'text-color': '#000000',
      },
    });
  }

  function deactivate() {
    map.removeLayer('street-lights-label');
    map.removeLayer('street-lights-marker');
    map.removeSource('street-lights');
  }
</script>
