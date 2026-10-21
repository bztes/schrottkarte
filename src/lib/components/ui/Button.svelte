<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    /** stretch to the full width */
    block?: boolean;
    children: Snippet;
  }

  let {
    variant = 'secondary',
    size = 'md',
    block = false,
    type = 'button',
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<button {type} class={['btn', variant, size, { block }, className]} {...rest}>
  {@render children()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45em;
    border: 1px solid transparent;
    border-radius: 0.6rem;
    font: inherit;
    font-weight: 500;
    line-height: 1.2;
    cursor: pointer;
    white-space: nowrap;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .btn :global(svg) {
    font-size: 1.15em;
    flex: none;
  }

  .btn:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .btn:disabled {
    opacity: 0.45;
    pointer-events: none;
  }

  .sm {
    padding: 0.35rem 0.65rem;
    font-size: var(--fs-sm);
  }

  .md {
    padding: 0.55rem 0.95rem;
  }

  .lg {
    padding: 0.75rem 1.1rem;
  }

  .block {
    width: 100%;
  }

  .primary,
  .primary:active {
    background-color: var(--c-primary);
    color: var(--c-primary-text);
  }

  .primary:hover {
    background-color: var(--c-primary-active);
  }

  .secondary,
  .secondary:active {
    background-color: var(--c-base-100);
    border-color: var(--c-border);
    color: var(--c-base-600);
    box-shadow: var(--shadow-sm);
  }

  .secondary:hover {
    background-color: var(--c-base-200);
  }

  .ghost,
  .ghost:active {
    background-color: transparent;
    color: var(--c-base-600);
  }

  .ghost:hover {
    background-color: var(--c-base-300);
  }

  .danger,
  .danger:active {
    background-color: transparent;
    color: var(--c-accent);
  }

  .danger:hover {
    background-color: #fdecec;
  }
</style>
