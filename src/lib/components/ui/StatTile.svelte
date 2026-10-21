<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    children: Snippet;
  }

  let { label, children }: Props = $props();
</script>

<div class="stat">
  <span class="label">{label}</span>
  <span class="value">{@render children()}</span>
</div>

<style>
  .stat {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--c-border);
    border-radius: 0.7rem;
    background-color: var(--c-base-200);
    overflow-wrap: anywhere;
  }

  .label {
    color: var(--c-muted);
    font-size: 0.75rem;
  }

  .value {
    font-weight: 500;
  }
</style>
