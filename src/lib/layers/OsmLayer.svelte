<script lang="ts">
  import { getLayersService, getMabLibre } from '$lib/components/MapView.svelte';

  const map = getMabLibre();
  const layersService = getLayersService();
  layersService.addLayer({ id: 'osm', activate, deactivate, snippets: {} });

  function activate() {
    map.addSource('osm', {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    });
    map.addLayer({
      id: 'osm',
      type: 'raster',
      source: 'osm',
    });
  }

  function deactivate() {
    map.removeLayer('osm');
    map.removeSource('osm');
  }
</script>
