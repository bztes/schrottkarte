import type { Component, Snippet } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

export interface LayerSnippets {
  selection?: Snippet;
  outline?: Outline;
}

export interface Outline {
  snippet: Snippet;
  icon: Component;
  id: string;
}

export interface Layer {
  id: string;
  activate: () => void;
  deactivate: () => void;
  snippets: LayerSnippets;
}

export type LayersService = ReturnType<typeof createLayersService>;

export function createLayersService() {
  const layersMap = new SvelteMap<string, Layer>();
  const allLayers = $derived(Array.from(layersMap.values()));
  const activatedLayersMap = new SvelteMap<string, Layer>();
  const activatedLayers = $derived(Array.from(activatedLayersMap.values()));
  const selectionSnippets = $derived(activatedLayers.flatMap((l) => l.snippets.selection ?? []));
  const outlineSnippets = $derived(activatedLayers.flatMap((l) => l.snippets.outline ?? []));

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

  return {
    addLayer,
    activateLayer,
    deactivateLayer,
    get all() {
      return allLayers;
    },
    get activated() {
      return activatedLayers;
    },
    get selectionSnippets() {
      return selectionSnippets;
    },
    get outlineSnippets() {
      return outlineSnippets;
    },
  };
}
