<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    snippets: Snippet[];
  }

  let { snippets }: Props = $props();
</script>

<div>
  {#if snippets.length === 0}
    No Selection
  {:else}
    {#each snippets as snippet}
      {@render snippet()}
    {/each}
  {/if}
</div>

<style>
  div {
    padding: 1rem;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    box-sizing: border-box;
  }
</style>
