<script lang="ts" module>
  import { createContext } from '$lib/utils';

  export const { get: getMabLibre, set: setMapLibre } = createContext<MapLibre>('map');
  export const { get: getLayersService, set: setLayersService } =
    createContext<LayersService>('map-layers');
</script>

<script lang="ts">
  import 'maplibre-gl/dist/maplibre-gl.css';
  import {
    AttributionControl,
    GeolocateControl,
    LngLat,
    LngLatBounds,
    Map as MapLibre,
    NavigationControl,
    type LngLatLike,
  } from 'maplibre-gl';
  import { onMount, type Snippet } from 'svelte';
  import type { LayersService } from '$lib/layers.svelte';

  interface Props {
    layersService: LayersService;
    center?: LngLatLike;
    zoom?: number;
    children: Snippet;
    onloaded?: (map: MapLibre) => void;
  }

  let { layersService, center, zoom, children, onloaded }: Props = $props();
  let mapContainer = $state<HTMLElement>();
  let map = $state<MapLibre>();
  setLayersService(layersService);

  let initialized = $state(false);
  let locating = $state(false);

  onMount(() => {
    if (!mapContainer) {
      return;
    }

    const bounds =
      center || zoom
        ? undefined
        : new LngLatBounds(
            new LngLat(13.308447932983597, 52.36749637746331),
            new LngLat(13.439288815794157, 52.51437170724549),
          );

    map = new MapLibre({
      container: mapContainer,
      style: {
        version: 8,
        sources: {},
        layers: [],
      },
      center: center ?? [13.3656, 52.4626],
      zoom: zoom ?? 14,
      bounds,
      attributionControl: false,
    });

    setMapLibre(map);

    map.addControl(new NavigationControl(), 'top-left');

    const geoControl = new GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
    });
    const orgTrigger = geoControl.trigger.bind(geoControl);
    geoControl.trigger = () => {
      locating = true;
      return orgTrigger();
    };
    geoControl.on('geolocate', () => (locating = false));
    geoControl.on('error', () => (locating = false));
    map.addControl(geoControl, 'top-left');

    map.addControl(new AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      initialized = true;
      if (map && onloaded) {
        onloaded(map);
      }
    });

    return () => map?.remove();
  });
</script>

<div class="map-wrapper">
  <div bind:this={mapContainer} class="map-container" class:locating></div>
  {#if initialized}
    {@render children()}
  {/if}
</div>

<style>
  .map-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .map-container {
    width: 100%;
    height: 100%;
    position: absolute;
  }

  .map-container.locating :global(.maplibregl-ctrl button.maplibregl-ctrl-geolocate) {
    pointer-events: none;
  }

  .map-container.locating
    :global(.maplibregl-ctrl button.maplibregl-ctrl-geolocate .maplibregl-ctrl-icon) {
    animation: spin 2s linear infinite;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='%235f6368'%3E%3Cpath d='M0 0h24v24H0V0z' fill='none'/%3E%3Cpath d='M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z'/%3E%3C/svg%3E");
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-180deg);
    }
    50% {
      transform: rotate(-180deg);
    }
    75% {
      transform: rotate(-360deg);
    }
    100% {
      transform: rotate(-360deg);
    }
  }
</style>
