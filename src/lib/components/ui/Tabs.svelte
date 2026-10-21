<script lang="ts" generics="T extends string">
  interface Props {
    items: { value: T; label: string; count?: number }[];
    value: T;
  }

  let { items, value = $bindable() }: Props = $props();
</script>

<div class="tabs" role="tablist">
  {#each items as item (item.value)}
    <button
      type="button"
      role="tab"
      aria-selected={value === item.value}
      onclick={() => (value = item.value)}
    >
      {item.label}
      {#if item.count !== undefined}<span class="count">{item.count}</span>{/if}
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--c-border);
  }

  button {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.7rem 0.5rem;
    margin-bottom: -1px;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: none;
    color: var(--c-muted);
    font: inherit;
    font-weight: 500;
    cursor: pointer;
  }

  button:hover,
  button:active {
    background: none;
    color: var(--c-base-600);
  }

  button[aria-selected='true'] {
    color: var(--c-primary);
    border-bottom-color: var(--c-primary);
  }

  .count {
    padding: 0 0.45rem;
    border-radius: 999px;
    background-color: var(--c-base-300);
    color: var(--c-muted);
    font-size: 0.75rem;
  }

  button[aria-selected='true'] .count {
    background-color: var(--c-primary-soft);
    color: var(--c-primary);
  }
</style>
