<script lang="ts">
  import type { HTMLSelectAttributes } from 'svelte/elements';

  let { value = $bindable(), class: className, children, ...rest }: HTMLSelectAttributes = $props();
</script>

<select class={['select', className]} bind:value {...rest}>
  {@render children?.()}
</select>

<style>
  .select {
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid var(--c-border);
    border-radius: 0.6rem;
    background-color: var(--c-base-100);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.6rem center;
    appearance: none;
    font: inherit;
    font-weight: normal;
    color: inherit;
    cursor: pointer;
    outline: none;
  }

  .select:focus {
    border-color: var(--c-primary);
    box-shadow: var(--focus-ring);
  }

  .select:disabled {
    background-image: none;
    border-color: transparent;
    background-color: transparent;
    cursor: default;
  }

  /* 16px keeps iOS from zooming into focused fields */
  @media (max-width: 720px) {
    .select {
      font-size: 16px;
    }
  }
</style>
