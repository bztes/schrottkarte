<script lang="ts">
  import type { Drawing } from '../drawings.svelte';
  import LucideFootprints from '~icons/lucide/footprints';
  import LucideCircleDot from '~icons/lucide/circle-dot';
  import LucidePentagon from '~icons/lucide/pentagon';
  import LucideCircleHelp from '~icons/lucide/circle-help';

  interface Props {
    drawing: Drawing;
  }

  let { drawing }: Props = $props();
</script>

{#if drawing.geom.type === 'LineString'}
  <LucideFootprints />
{:else if drawing.geom.type === 'Point'}
  <LucideCircleDot />
{:else if drawing.geom.type === 'Polygon'}
  <LucidePentagon />
{:else}
  <LucideCircleHelp />
{/if}
