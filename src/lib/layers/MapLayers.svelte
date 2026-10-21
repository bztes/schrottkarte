<script lang="ts">
  import { getMabLibre } from '#lib/components/MapView.svelte';
  import { untrack } from 'svelte';
  import { getMapLayers } from '#lib/remote/layers.remote.js';
  import ConfiguredLayer, { configLayerIdOf } from './ConfiguredLayer.svelte';

  interface Props {
    /** called once the layers are on the map, or failed to load */
    onready?: () => void;
  }

  let { onready }: Props = $props();

  const map = getMabLibre();
  const mapLayers = getMapLayers();

  /**
   * Configured layers stay below everything else (drawings, markers), and the ones further up in
   * the list stay above the ones further down, regardless of the order they are added in.
   */
  function getBeforeId(index: number) {
    const above = new Set(mapLayers.current?.slice(index + 1).map((l) => l.id));
    return map.getStyle().layers.find((style) => {
      const id = configLayerIdOf(style.id);
      return id === undefined || above.has(id);
    })?.id;
  }

  // the map is still usable without base layers
  $effect(() => {
    if (mapLayers.error) {
      console.error('Failed to load the map layers', mapLayers.error);
    }
  });

  // the <ConfiguredLayer /> children add their layers while they are created, before this runs
  $effect(() => {
    if (mapLayers.current || mapLayers.error) {
      untrack(() => onready?.());
    }
  });
</script>

{#each mapLayers.current ?? [] as layer, index (`${layer.id}-${layer.updatedAt.getTime()}`)}
  <ConfiguredLayer {layer} getBeforeId={() => getBeforeId(index)} />
{/each}
