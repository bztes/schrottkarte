<script lang="ts" module>
  const prefix = 'config:';

  /** Id of the map source of a configured layer, its style layers are `<source id>:<style layer id>` */
  export function configSourceId(layerId: string) {
    return prefix + layerId;
  }

  /** The configured layer a style layer belongs to, if any */
  export function configLayerIdOf(styleLayerId: string): string | undefined {
    return styleLayerId.startsWith(prefix)
      ? styleLayerId.slice(prefix.length).split(':')[0]
      : undefined;
  }
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { LayerSpecification, SourceSpecification } from 'maplibre-gl';
  import { getLayersService, getMabLibre } from '#lib/components/MapView.svelte';
  import type { MapLayer } from '#lib/types.js';

  interface Props {
    layer: MapLayer;
    /** the style layer to insert below, keeps the configured order */
    getBeforeId: () => string | undefined;
  }

  // the parent recreates this component when the layer changes
  let { layer, getBeforeId }: Props = $props();

  const map = getMabLibre();
  const layersService = getLayersService();
  // svelte-ignore state_referenced_locally
  const sourceId = configSourceId(layer.id);
  // svelte-ignore state_referenced_locally
  const styleLayerIds = layer.layers.map((l) => `${sourceId}:${l.id}`);

  layersService.addLayer({ id: sourceId, activate, deactivate });
  onDestroy(() => layersService.removeLayer(sourceId));

  function activate() {
    try {
      map.addSource(sourceId, layer.source as SourceSpecification);
      const beforeId = getBeforeId();
      layer.layers.forEach((style, i) => {
        map.addLayer(
          { ...style, id: styleLayerIds[i], source: sourceId } as LayerSpecification,
          beforeId,
        );
      });
    } catch (e) {
      // a broken layer must not break the whole map
      console.error(`Failed to add map layer "${layer.name}"`, e);
      deactivate();
    }
  }

  function deactivate() {
    for (const id of styleLayerIds) {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  }
</script>
