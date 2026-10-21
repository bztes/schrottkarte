<script lang="ts">
  import UserMenu from '#lib/components/UserMenu.svelte';
  import MapLayers from '#lib/layers/MapLayers.svelte';
  import DrawingsViewLayer from '#lib/layers/drawings/DrawingsViewLayer.svelte';
  import MapView from '#lib/components/MapView.svelte';
  import { createLayersService } from '#lib/layers.svelte.js';
  import MarkersLayer from '#lib/layers/markers/MarkersLayer.svelte';
  import {
    getDialogsService,
    getDrawingsService,
    getMarkersService,
  } from '#lib/components/AppServices.svelte';
  import { createMapViewStorage } from '#lib/storage.svelte.js';
  import type { Map } from 'maplibre-gl';
  import { hasRole, markerPermissions } from '#lib/types.js';

  const { getValue: getMapProps, setValue: setMapProps } = createMapViewStorage();

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

<UserMenu user={pageData.user} />

<MapView
  {layersService}
  center={pageData.center ?? mapProps.center}
  zoom={pageData.zoom ?? mapProps.zoom}
  onmoveend={handleMoveEnd}
>
  <MapLayers />
  <DrawingsViewLayer {drawingsService} filters={pageData.filters} />
  <MarkersLayer
    {markersService}
    {dialogsService}
    canUpdate={hasRole(pageData.user, markerPermissions.update)}
    canDelete={hasRole(pageData.user, markerPermissions.delete)}
    canInsert={hasRole(pageData.user, markerPermissions.insert)}
    canMove={hasRole(pageData.user, markerPermissions.move)}
  />
</MapView>
