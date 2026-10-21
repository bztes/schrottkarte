<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    icon: Snippet;
    /** renders a link when set, otherwise a button */
    href?: string;
    type?: 'button' | 'submit';
    tone?: 'default' | 'danger';
    onclick?: () => void;
  }

  let { label, icon, href, type = 'button', tone = 'default', onclick }: Props = $props();
</script>

{#if href}
  <a {href} class={['menu-item', tone]} {onclick}>
    <span class="icon">{@render icon()}</span>
    {label}
  </a>
{:else}
  <button {type} class={['menu-item', tone]} {onclick}>
    <span class="icon">{@render icon()}</span>
    {label}
  </button>
{/if}

<style>
  .menu-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.7rem;
    padding: 0.55rem 0.65rem;
    border: none;
    border-radius: 0.6rem;
    background: none;
    color: var(--c-base-600);
    font: inherit;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    box-sizing: border-box;
  }

  .menu-item:hover,
  .menu-item:active {
    background-color: var(--c-base-300);
    color: var(--c-base-600);
  }

  .icon {
    display: flex;
    font-size: 1.15rem;
    color: var(--c-muted);
  }

  .danger,
  .danger:hover,
  .danger:active,
  .danger .icon {
    color: var(--c-accent);
  }

  .danger:hover {
    background-color: #fdecec;
  }
</style>
