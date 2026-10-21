<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** accessible name, shown next to the icon on desktop */
    label: string;
    onclick: () => void;
    icon: Snippet;
  }

  let { label, onclick, icon }: Props = $props();
</script>

<button type="button" class="fab" title={label} aria-label={label} {onclick}>
  {@render icon()}
  <span class="label">{label}</span>
</button>

<style>
  .fab {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.85rem 1.2rem 0.85rem 1rem;
    border: none;
    border-radius: 999px;
    background-color: var(--c-primary);
    color: var(--c-primary-text);
    font: inherit;
    font-weight: 600;
    box-shadow: var(--shadow-md);
    cursor: pointer;
    transition:
      background-color 0.15s,
      box-shadow 0.15s;
  }

  .fab :global(svg) {
    font-size: 1.5rem;
  }

  .fab:hover,
  .fab:active {
    background-color: var(--c-primary-active);
    color: var(--c-primary-text);
  }

  .fab:focus-visible {
    outline: none;
    box-shadow: var(--shadow-md), var(--focus-ring);
  }

  @media (max-width: 720px) {
    .fab {
      padding: 1rem;
    }

    .fab :global(svg) {
      font-size: 1.75rem;
    }

    .label {
      display: none;
    }
  }
</style>
