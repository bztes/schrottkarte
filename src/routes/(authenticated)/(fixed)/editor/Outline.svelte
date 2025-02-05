<script lang="ts">
  import SelectionOutline from './SelectionOutline.svelte';
  import type { LayersService, Outline } from '$lib/layers.svelte';
  import IcRoundEdit from '~icons/ic/round-edit';
  import { SvelteSet } from 'svelte/reactivity';

  interface Props {
    layersService: LayersService;
  }

  let { layersService }: Props = $props();

  const selectionOutline: Outline = {
    id: 'selection',
    snippet: selectionOutlineSnippet,
    icon: IcRoundEdit,
  };

  const outlines = $derived([...layersService.outlineSnippets, selectionOutline]);
  const visibleOutlineIds = new SvelteSet<string>();
  const visibleOutlines = $derived(outlines.filter((o) => visibleOutlineIds.has(o.id)));

  function handleOutlineButtonClick(outline: Outline) {
    if (visibleOutlineIds.has(outline.id)) {
      visibleOutlineIds.delete(outline.id);
    } else {
      visibleOutlineIds.add(outline.id);
    }
  }
</script>

<div class="sidebar">
  <nav>
    <ul>
      {#each outlines as outline}
        <li>
          <button
            class="button-round"
            class:button-primary={visibleOutlineIds.has(outline.id)}
            onclick={() => handleOutlineButtonClick(outline)}
          >
            <outline.icon />
          </button>
        </li>
      {/each}
    </ul>
  </nav>
  <div class="outlines">
    {#each visibleOutlines as outline}
      <div class="outline">
        {@render outline.snippet()}
      </div>
    {/each}
  </div>
</div>

{#snippet selectionOutlineSnippet()}
  <SelectionOutline snippets={layersService.selectionSnippets} />
{/snippet}

<style>
  .sidebar {
    overflow: hidden;
    display: flex;
    height: 100%;
  }

  nav {
    overflow: hidden;
    height: 100%;
    border-right: 1px solid var(--c-base-300);

    ul {
      list-style: none;
      margin: 0;
      padding: 0.5rem;
      font-size: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  .outlines {
    height: 100%;
    overflow: hidden;
    max-width: 50vw;
    display: flex;
  }

  .outline {
    height: 100%;
    overflow: hidden;
    width: 20vw;
    border-right: 1px solid var(--c-base-300);
  }
</style>
