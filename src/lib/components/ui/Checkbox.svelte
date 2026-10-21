<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    children: Snippet;
  }

  let { checked = $bindable(), children, ...rest }: Props = $props();
</script>

<label class="checkbox">
  <input type="checkbox" bind:checked {...rest} />
  <span>{@render children()}</span>
</label>

<style>
  .checkbox {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    cursor: pointer;
  }

  input {
    width: 1.05rem;
    height: 1.05rem;
    margin: 0;
    accent-color: var(--c-primary);
  }
</style>
