<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    /** accessible name, also shown as tooltip */
    label: string;
    variant?: 'ghost' | 'danger' | 'surface' | 'active';
    size?: 'sm' | 'md' | 'lg';
    children: Snippet;
  }

  let {
    label,
    variant = 'ghost',
    size = 'md',
    type = 'button',
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<button
  {type}
  title={label}
  aria-label={label}
  class={['icon-btn', variant, size, className]}
  {...rest}
>
  {@render children()}
</button>

<style>
  .icon-btn {
    display: inline-grid;
    place-items: center;
    flex: none;
    border: 1px solid transparent;
    border-radius: 0.6rem;
    cursor: pointer;
    color: var(--c-muted);
    background-color: transparent;
    transition:
      background-color 0.15s,
      color 0.15s,
      box-shadow 0.15s;
  }

  .icon-btn:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .icon-btn:disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .sm {
    padding: 0.3rem;
    font-size: 1rem;
  }

  .md {
    padding: 0.45rem;
    font-size: 1.15rem;
  }

  .lg {
    padding: 0.6rem;
    font-size: 1.35rem;
  }

  .ghost:hover,
  .ghost:active {
    background-color: var(--c-base-300);
    color: var(--c-base-600);
  }

  .danger:hover,
  .danger:active {
    background-color: #fdecec;
    color: var(--c-accent);
  }

  .surface,
  .surface:active {
    background-color: var(--c-base-100);
    color: var(--c-base-600);
    border-color: var(--c-border);
    box-shadow: var(--shadow-md);
  }

  .surface:hover {
    background-color: var(--c-base-200);
  }

  .active,
  .active:hover,
  .active:active {
    background-color: var(--c-primary-soft);
    color: var(--c-primary);
  }
</style>
