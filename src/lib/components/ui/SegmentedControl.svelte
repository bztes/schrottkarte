<script lang="ts" generics="T extends string">
  interface Props {
    options: { value: T; label: string }[];
    value: T;
    label: string;
  }

  let { options, value = $bindable(), label }: Props = $props();
</script>

<div class="segmented" role="radiogroup" aria-label={label}>
  {#each options as option (option.value)}
    <button
      type="button"
      role="radio"
      aria-checked={value === option.value}
      onclick={() => (value = option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .segmented {
    display: inline-flex;
    padding: 0.2rem;
    gap: 0.2rem;
    border-radius: 0.7rem;
    background-color: var(--c-base-300);
  }

  button {
    flex: 1;
    padding: 0.35rem 0.75rem;
    border: none;
    border-radius: 0.5rem;
    background: none;
    color: var(--c-muted);
    font: inherit;
    font-size: var(--fs-sm);
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }

  button:hover,
  button:active {
    background: none;
    color: var(--c-base-600);
  }

  button[aria-checked='true'],
  button[aria-checked='true']:hover {
    background-color: var(--c-base-100);
    color: var(--c-base-600);
    box-shadow: var(--shadow-sm);
  }
</style>
