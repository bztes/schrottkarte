<script lang="ts">
  import UserPopup from '$lib/components/UserPopup.svelte';
  import OsmLayer from '$lib/layers/OsmLayer.svelte';
  import StreetLightsLayer from '$lib/layers/StreetLightsLayer.svelte';
  import DrawingsViewLayer from '$lib/layers/drawings/DrawingsViewLayer.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import { createLayersService } from '$lib/layers.svelte';
  import MarkersLayer from '$lib/layers/markers/MarkersLayer.svelte';
  import { getDialogsService, getDrawingsService, getMarkersService } from '../+layout.svelte';
  import { z } from 'zod';
  import { createStorage } from '$lib/storage.svelte';
  import type { Map } from 'maplibre-gl';

  const { getValue: getMapProps, setValue: setMapProps } = createStorage(
    'map',
    z.object({
      center: z
        .object({
          lat: z.number().default(52.516246),
          lng: z.number().default(13.37721),
        })
        .default({}),
      zoom: z.number().default(14),
    }),
  );

  let { data: pageData } = $props();
  const mapProps = getMapProps();

  const layersService = createLayersService();
  const markersService = getMarkersService();
  const drawingsService = getDrawingsService();
  const dialogsService = getDialogsService();

  function handleMoveEnd(map: Map) {
    setMapProps({
      center: map.getCenter(),
      zoom: map.getZoom(),
    });
  }
</script>

<UserPopup user={pageData.user} />

<MapView
  {layersService}
  center={pageData.center ?? mapProps.center}
  zoom={pageData.zoom ?? mapProps.zoom}
  onmoveend={handleMoveEnd}
>
  <OsmLayer />
  <StreetLightsLayer />
  <DrawingsViewLayer {drawingsService} filters={pageData.filters} />
  <MarkersLayer
    {markersService}
    {dialogsService}
    canUpdate={pageData.user?.userRole === 'editor' ||
      pageData.user?.userRole === 'street' ||
      pageData.user?.userRole === 'spotter'}
    canDelete={pageData.user?.userRole === 'editor'}
    canInsert={pageData.user?.userRole === 'editor' || pageData.user?.userRole === 'street'}
    canMove={pageData.user?.userRole === 'editor'}
  />
</MapView>
