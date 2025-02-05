<script lang="ts">
  import UserPopup from '$lib/components/UserPopup.svelte';
  import OsmLayer from '$lib/layers/OsmLayer.svelte';
  import StreetLightsLayer from '$lib/layers/StreetLightsLayer.svelte';
  import DrawingsViewLayer from '$lib/layers/drawings/DrawingsViewLayer.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import { createLayersService } from '$lib/layers.svelte';
  import MarkersLayer from '$lib/layers/markers/MarkersLayer.svelte';
  import { getDialogsService, getDrawingsService, getMarkersService } from '../+layout.svelte';

  let { data: pageData } = $props();

  const layersService = createLayersService();
  const markersService = getMarkersService();
  const drawingsService = getDrawingsService();
  const dialogsService = getDialogsService();
</script>

<UserPopup user={pageData.user} />

<MapView {layersService} center={pageData.center} zoom={pageData.zoom}>
  <OsmLayer />
  <StreetLightsLayer />
  <DrawingsViewLayer {drawingsService} filters={pageData.filters} />
  <MarkersLayer
    {markersService}
    {dialogsService}
    canUpdate={pageData.user?.userRole === 'editor' ||
      pageData.user?.userRole === 'street' ||
      pageData.user?.userRole === 'spotter'}
    canInsert={pageData.user?.userRole === 'editor' || pageData.user?.userRole === 'street'}
  />
</MapView>
