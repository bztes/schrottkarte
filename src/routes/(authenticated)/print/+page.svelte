<script lang="ts">
  import OsmLayer from '$lib/layers/OsmLayer.svelte';
  import StreetLightsLayer from '$lib/layers/StreetLightsLayer.svelte';
  import DrawingsViewLayer from '$lib/layers/drawings/DrawingsViewLayer.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import { createLayersService } from '$lib/layers.svelte';
  import { getDrawingsService } from '../+layout.svelte';
  import { applyFilterToArray, type Filter } from '$lib/filter.svelte';
  import type { Drawing } from '$lib/drawings.svelte';
  import { bbox, feature, featureCollection } from '@turf/turf';
  import type { Map as MapLibre } from 'maplibre-gl';

  interface Route {
    name: string;
    dataUrl: string;
    selected: boolean;
  }

  let { data: pageData } = $props();

  const layersService = createLayersService();
  const drawingsService = getDrawingsService();

  let routes = $state<Route[]>([]);
  let renderStatus = $state('Loading');
  let filters = $state<Filter[]>([]);
  let map = $state<MapLibre>();
  let title = $state('');

  async function handleMapLoaded(mapLibre: MapLibre) {
    map = mapLibre;
  }

  $effect(() => {
    if (map) {
      loadPages(map);
    }
  });

  async function loadPages(map: MapLibre) {
    renderStatus = 'Loading';
    routes = [];

    const drawings = applyFilterToArray(drawingsService.all, ...pageData.filters).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    renderStatus = `Loading Overview`;
    const dataUrl = await generateImageFromFilter(map, drawings, pageData.filters);
    routes.push({ name: 'Übersicht', dataUrl, selected: true });

    for (let i = 0; i < drawings.length; i++) {
      renderStatus = `Loading ${i + 1} of ${drawings.length}`;
      const drawing = drawings[i];
      const dataUrl = await generateImageFromDrawing(map, drawing);
      routes.push({ name: drawing.name || 'Unbenannt', dataUrl, selected: true });
    }

    renderStatus = `${drawings.length + 1} pages ready to print`;
  }

  function generateImageFromFilter(
    map: MapLibre,
    drawings: Drawing[],
    myFilters: Filter[],
  ): Promise<string> {
    return new Promise((resolve) => {
      map.once('idle', () => {
        const canvas = map.getCanvas();
        const dataURL = canvas.toDataURL('image/png');
        setTimeout(() => resolve(dataURL), 500);
      });

      filters = myFilters;

      const features = drawings.map((d) => feature(d.geom));
      const bounds = bbox(featureCollection(features));
      map.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        { padding: 50, animate: false, maxZoom: 16 },
      );
    });
  }

  function generateImageFromDrawing(map: MapLibre, drawing: Drawing): Promise<string> {
    return new Promise((resolve) => {
      map.once('idle', () => {
        const canvas = map.getCanvas();
        const dataURL = canvas.toDataURL('image/png');
        setTimeout(() => resolve(dataURL), 500);
      });

      filters = [{ field: 'id', operator: 'eq', values: [drawing.id] }];

      const bounds = bbox(drawing.geom);
      map.fitBounds(
        [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]],
        ],
        { padding: 100, animate: false, maxZoom: 16 },
      );
    });
  }
</script>

<div class="pages">
  <label class="noprint">
    Ortsteil
    <input type="text" bind:value={title} />
  </label>
  <section class="map">
    <div class="render-status">
      {renderStatus}
    </div>
    <MapView {layersService} onloaded={handleMapLoaded}>
      <OsmLayer />
      <StreetLightsLayer />
      <DrawingsViewLayer {drawingsService} {filters} showFiltered={1} />
    </MapView>
  </section>
  {#each routes as route}
    <section class:collapsed={!route.selected}>
      <h2>
        <span>{title}</span>
        {route.name}
      </h2>
      <input class="page-selection noprint" type="checkbox" bind:checked={route.selected} />
      <img src={route.dataUrl} alt="Map" />
    </section>
  {/each}
</div>

<style>
  .pages {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    align-items: center;
  }

  section {
    width: 297mm;
    height: 210mm;
    position: relative;
    overflow: hidden;
  }

  .render-status {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    background-color: #ffffffcc;
    z-index: 100;
  }

  h2 {
    position: absolute;
    top: 0.5cm;
    left: 0.5cm;
    background-color: white;
    z-index: 100;
    padding: 0.5rem 1rem;
    border-radius: 1rem;

    span {
      display: block;
      font-size: 0.8em;
      font-weight: bold;
    }
  }

  input.page-selection {
    position: absolute;
    top: 0.5cm;
    right: 0.5cm;
    z-index: 101;
    width: 1.5rem;
    height: 1.5rem;
  }

  section.collapsed {
    height: 5rem;
    opacity: 0.5;
  }

  section :global(.maplibregl-control-container) {
    display: none;
  }

  @media print {
    @page {
      size: landscape;
    }

    .pages {
      gap: 0;
    }

    section.map,
    section.collapsed,
    .noprint {
      display: none;
    }

    section {
      page-break-after: always;
    }
  }
</style>
