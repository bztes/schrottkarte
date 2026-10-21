<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  interface Props extends HTMLTextareaAttributes {
    /** monospace font, for code like JSON */
    mono?: boolean;
  }

  let { value = $bindable(), rows = 3, mono = false, class: className, ...rest }: Props = $props();
</script>

<textarea class={['textarea', { mono }, className]} {rows} bind:value {...rest}></textarea>

<style>
  .textarea {
    padding: 0.55rem 0.75rem;
    border: 1px solid var(--c-border);
    border-radius: 0.6rem;
    background-color: var(--c-base-100);
    font: inherit;
    font-weight: normal;
    color: inherit;
    outline: none;
    resize: vertical;
    transition:
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .textarea:focus {
    border-color: var(--c-primary);
    box-shadow: var(--focus-ring);
  }

  .mono {
    font-family: var(--ff-mono);
    font-size: var(--fs-sm);
  }

  /* 16px keeps iOS from zooming into focused fields */
  @media (max-width: 720px) {
    .textarea {
      font-size: 16px;
    }
  }
</style>
