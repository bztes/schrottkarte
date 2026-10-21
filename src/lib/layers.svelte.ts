import { SvelteMap } from 'svelte/reactivity';

export interface Layer {
  id: string;
  activate: () => void;
  deactivate: () => void;
}

export type LayersService = ReturnType<typeof createLayersService>;

export function createLayersService() {
  const layersMap = new SvelteMap<string, Layer>();
  const allLayers = $derived(Array.from(layersMap.values()));
  const activatedLayersMap = new SvelteMap<string, Layer>();
  const activatedLayers = $derived(Array.from(activatedLayersMap.values()));

  function addLayer(layer: Layer, activate = true) {
    layersMap.set(layer.id, layer);
    if (activate) {
      activateLayer(layer.id);
    }
  }

  function activateLayer(id: string) {
    const layer = layersMap.get(id);
    if (!layer) {
      return;
    }

    if (!activatedLayersMap.has(id)) {
      activatedLayersMap.set(id, layer);
      layer.activate();
    }
  }

  function deactivateLayer(id: string) {
    const layer = activatedLayersMap.get(id);
    if (!layer) {
      return;
    }

    layer.deactivate();
    activatedLayersMap.delete(id);
  }

  function removeLayer(id: string) {
    deactivateLayer(id);
    layersMap.delete(id);
  }

  return {
    addLayer,
    removeLayer,
    activateLayer,
    deactivateLayer,
    get all() {
      return allLayers;
    },
    get activated() {
      return activatedLayers;
    },
  };
}
