<script lang="ts">
  import { getLayersService, getMabLibre } from '$lib/components/MapView.svelte';

  const map = getMabLibre();
  const layersService = getLayersService();
  layersService.addLayer({ id: 'street-lights-berlin', activate, deactivate, snippets: {} });

  function activate() {
    map.addSource('street-lights', {
      type: 'vector',
      url: 'https://tiles.nc.bztes.dev/data/beleuchtung-berlin.json',
      attribution:
        '&copy; <a href="https://www.berlin.de/sen/sbw/stadtdaten/geoportal/">Geoportal Berlin / Öffentliche Beleuchtung</a> <a href="https://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
    });

    map.addLayer({
      id: 'street-lights',
      type: 'circle',
      source: 'street-lights',
      'source-layer': 'beleuchtung',
      paint: {
        'circle-color': 'red',
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 0, 15, 3.5],
        'circle-opacity': 0.5,
      },
    });
  }

  function deactivate() {
    map.removeLayer('street-lights');
    map.removeSource('street-lights');
  }
</script>
