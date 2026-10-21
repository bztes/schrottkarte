<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    leading: Snippet;
    meta?: Snippet;
    active?: boolean;
    onclick: () => void;
  }

  let { title, leading, meta, active = false, onclick }: Props = $props();
</script>

<button type="button" class={['list-button', { active }]} {onclick}>
  <span class="leading">{@render leading()}</span>
  <span class="text">
    <span class="title">{title}</span>
    {#if meta}<span class="meta">{@render meta()}</span>{/if}
  </span>
</button>

<style>
  .list-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
    padding: 0.55rem 0.65rem;
    border: none;
    border-radius: 0.6rem;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .list-button:hover,
  .list-button:active {
    background-color: var(--c-base-300);
    color: inherit;
  }

  .list-button.active {
    background-color: var(--c-primary-soft);
  }

  .leading {
    display: grid;
    place-items: center;
    flex: none;
    width: 1.6rem;
    font-size: 1.25rem;
  }

  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .title {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.3rem;
    color: var(--c-muted);
    font-size: var(--fs-sm);
  }
</style>
