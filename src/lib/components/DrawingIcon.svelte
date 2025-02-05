<script lang="ts">
  import type { Drawing } from '../drawings.svelte';
  import IcRoundDirectionsWalk from '~icons/ic/round-directions-walk';
  import IcRoundAdjust from '~icons/ic/round-adjust';
  import IcRoundBorderAll from '~icons/ic/round-border-all';
  import IcRoundQuestionMark from '~icons/ic/round-question-mark';

  interface Props {
    drawing: Drawing;
  }

  let { drawing }: Props = $props();
</script>

{#if drawing.geom.type === 'LineString'}
  <IcRoundDirectionsWalk />
{:else if drawing.geom.type === 'Point'}
  <IcRoundAdjust />
{:else if drawing.geom.type === 'Polygon'}
  <IcRoundBorderAll />
{:else}
  <IcRoundQuestionMark />
{/if}
