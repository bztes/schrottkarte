<!--
  Based on https://github.com/laurentpayot/minidenticons/blob/main/minidenticons.js
-->

<script lang="ts">
  interface Props {
    seed: string;
    saturation?: number;
    lightness?: number;
    colorsNbr?: number;
  }

  let { seed, saturation = 95, lightness = 45, colorsNbr = 9 }: Props = $props();

  let hash = $derived(simpleHash(seed));
  let hue = $derived((hash % colorsNbr) * (360 / colorsNbr));

  function simpleHash(str: string, magicNbr = 5) {
    return (
      str.split('').reduce((hash, char) => (hash ^ char.charCodeAt(0)) * -magicNbr, magicNbr) >>> 2
    );
  }
</script>

<svg
  viewBox="-1 -1 7 7"
  xmlns="http://www.w3.org/2000/svg"
  fill={`hsl(${hue} ${saturation}% ${lightness}%)`}
  width="1em"
>
  {#each { length: 25 } as _, i}
    {#if hash & (1 << i % 15)}
      <rect x={i > 14 ? 7 - ~~(i / 5) : ~~(i / 5)} y={i % 5} width="1" height="1" />
    {/if}
  {/each}
</svg>

<style>
  svg {
    aspect-ratio: 1/1;
  }
</style>
