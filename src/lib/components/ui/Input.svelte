<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props extends HTMLInputAttributes {
    /** optional leading icon */
    icon?: Snippet;
    /** remove surrounding whitespace when the field loses focus */
    trim?: boolean;
    /** take the free space in a flex row */
    grow?: boolean;
  }

  let {
    value = $bindable(),
    type = 'text',
    icon,
    trim = false,
    grow = false,
    class: className,
    onblur,
    ...rest
  }: Props = $props();

  function handleBlur(e: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    if (trim && typeof value === 'string') {
      value = value.trim();
    }
    onblur?.(e);
  }
</script>

<span class={['input-wrap', { 'with-icon': icon, grow }, className]}>
  {#if icon}<span class="icon">{@render icon()}</span>{/if}
  <input {type} class="input" bind:value {...rest} onblur={handleBlur} />
</span>

<style>
  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .grow {
    flex: 1;
  }

  .icon {
    position: absolute;
    left: 0.7rem;
    display: flex;
    color: var(--c-muted);
    pointer-events: none;
  }

  .input {
    flex: 1;
    min-width: 0;
    padding: 0.55rem 0.75rem;
    border: 1px solid var(--c-border);
    border-radius: 0.6rem;
    background-color: var(--c-base-100);
    font: inherit;
    font-weight: normal;
    color: inherit;
    outline: none;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .with-icon .input {
    padding-left: 2.2rem;
  }

  .input:focus {
    border-color: var(--c-primary);
    box-shadow: var(--focus-ring);
  }

  .input::placeholder {
    color: var(--c-base-590);
  }

  /* 16px keeps iOS from zooming into focused fields */
  @media (max-width: 720px) {
    .input {
      font-size: 16px;
    }
  }
</style>
