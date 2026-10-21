<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    tone?: 'info' | 'danger';
    onclick: () => void;
    children: Snippet;
  }

  let { tone = 'info', onclick, children }: Props = $props();
</script>

<!-- a pill floating at the top center of the screen -->
<button type="button" class={['toast', tone]} {onclick}>
  {@render children()}
</button>

<style>
  .toast {
    position: fixed;
    top: 1rem;
    left: 50%;
    z-index: 100;
    transform: translateX(-50%);
    display: inline-flex;
    align-items: center;
    gap: 0.45em;
    padding: 0.45rem 0.9rem;
    border: none;
    border-radius: 999px;
    font: inherit;
    font-weight: 500;
    box-shadow: var(--shadow-md);
    cursor: pointer;
  }

  .info,
  .info:active {
    background-color: var(--c-secondary);
    color: var(--c-secondary-text);
  }

  .info:hover {
    background-color: var(--c-secondary-active);
  }

  .danger,
  .danger:active {
    background-color: var(--c-accent);
    color: var(--c-accent-text);
  }

  .danger:hover {
    background-color: var(--c-accent-active);
  }
</style>
