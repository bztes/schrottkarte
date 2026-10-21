<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    /** shown muted after the label, e.g. "(optional)" */
    hint?: string;
    /** render as a plain group instead of a <label>, for controls that are not form inputs */
    group?: boolean;
    children: Snippet;
  }

  let { label, hint, group = false, children }: Props = $props();
</script>

<svelte:element this={group ? 'div' : 'label'} class="field">
  <span class="label">
    {label}
    {#if hint}<span class="hint">{hint}</span>{/if}
  </span>
  {@render children()}
</svelte:element>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .label {
    font-size: var(--fs-sm);
    font-weight: 500;
  }

  .hint {
    color: var(--c-muted);
    font-weight: normal;
  }
</style>
