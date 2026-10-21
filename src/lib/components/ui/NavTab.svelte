<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    href: string;
    label: string;
    active?: boolean;
    icon: Snippet;
  }

  let { href, label, active = false, icon }: Props = $props();
</script>

<a {href} class={['nav-tab', { active }]} title={label} aria-current={active ? 'page' : undefined}>
  {@render icon()}
  <span class="label">{label}</span>
</a>

<style>
  .nav-tab {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.8rem;
    border-radius: 0.6rem;
    color: var(--c-muted);
    font-weight: 500;
    white-space: nowrap;
    transition:
      background-color 0.15s,
      color 0.15s;
  }

  .nav-tab :global(svg) {
    font-size: 1.2em;
  }

  .nav-tab:hover {
    background-color: var(--c-base-300);
    color: var(--c-base-600);
  }

  .nav-tab.active {
    background-color: var(--c-primary-soft);
    color: var(--c-primary);
  }

  @media (max-width: 720px) {
    .label {
      display: none;
    }
  }
</style>
