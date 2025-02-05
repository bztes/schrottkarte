<script lang="ts">
  import type { Drawing } from '../drawings.svelte';
  import { area, feature, length } from '@turf/turf';

  interface Props {
    drawing: Drawing;
  }

  let { drawing }: Props = $props();
</script>

<span>
  {#if drawing.geom.type === 'LineString'}
    {length(feature(drawing.geom)).toFixed(3)} km
  {:else if drawing.geom.type === 'Point'}
    {drawing.geom.coordinates[1].toFixed(3)}, {drawing.geom.coordinates[0].toFixed(3)}
  {:else if drawing.geom.type === 'Polygon'}
    {(area(drawing.geom) / 1000000).toFixed(3)} km²
  {/if}
</span>
