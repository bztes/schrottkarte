<script lang="ts">
  import UserPopup from '$lib/components/UserPopup.svelte';
  import {
    getDialogsService,
    getDrawingsService,
    getMarkersService,
    getTagsService,
  } from '../../+layout.svelte';
  import Outline from './Outline.svelte';
  import OsmLayer from '$lib/layers/OsmLayer.svelte';
  import StreetLightsLayer from '$lib/layers/StreetLightsLayer.svelte';
  import { createLayersService } from '$lib/layers.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import MarkersLayer from '$lib/layers/markers/MarkersLayer.svelte';
  import DrawingsEditorLayer from '$lib/layers/drawings/DrawingsEditorLayer.svelte';

  let { data: pageData } = $props();

  const layersService = createLayersService();
  const drawingsService = getDrawingsService();
  const markersService = getMarkersService();
  const tagsService = getTagsService();
  const dialogsService = getDialogsService();
</script>

<UserPopup user={pageData.user} />

<div class="split-view">
  <Outline {layersService} />
  <MapView {layersService}>
    <OsmLayer />
    <StreetLightsLayer />
    <DrawingsEditorLayer {drawingsService} {tagsService} />
    <MarkersLayer {markersService} {dialogsService} canDelete={true} canUpdate={true} />
  </MapView>
</div>

<style>
  .split-view {
    display: grid;
    grid-template-columns: auto 1fr;
    height: 100%;
  }
</style>
