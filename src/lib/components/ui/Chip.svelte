<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    active?: boolean;
    /** optional colored dot in front of the label */
    color?: string;
    onclick: () => void;
    children: Snippet;
  }

  let { active = false, color, onclick, children }: Props = $props();
</script>

<button type="button" class={['chip', { active }]} aria-pressed={active} {onclick}>
  {#if color}<span class="dot" style:background-color={color}></span>{/if}
  {@render children()}
</button>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.65rem;
    border: 1px solid var(--c-border);
    border-radius: 999px;
    background-color: var(--c-base-100);
    color: var(--c-base-600);
    font: inherit;
    font-size: var(--fs-sm);
    cursor: pointer;
  }

  .chip:hover,
  .chip:active {
    background-color: var(--c-base-200);
    color: var(--c-base-600);
  }

  .chip.active,
  .chip.active:hover {
    border-color: var(--c-primary);
    background-color: var(--c-primary-soft);
    color: var(--c-primary-active);
  }

  .dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 999px;
  }
</style>
