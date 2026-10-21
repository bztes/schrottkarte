<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<code>{@render children()}</code>

<style>
  code {
    padding: 0.1rem 0.35rem;
    border-radius: 0.35rem;
    background-color: var(--c-base-300);
    font-family: var(--ff-mono);
    font-size: 0.9em;
  }
</style>
