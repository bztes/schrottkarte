<script lang="ts">
  import type { Snippet } from 'svelte';
  import IcRoundClose from '~icons/ic/round-close';
  import IcRoundOpenInFull from '~icons/ic/round-open-in-full';
  import IcRoundCloseFullscreen from '~icons/ic/round-close-fullscreen';

  interface Props {
    children: Snippet;
    header?: Snippet;
    title: string;
    subtitle?: string;
    expanded?: boolean;
    onclose: () => void;
  }

  let {
    children,
    header,
    title,
    subtitle = '',
    expanded = $bindable(false),
    onclose,
  }: Props = $props();
  let elem = $state<HTMLElement>();

  function toggleExpand() {
    expanded = !expanded;
  }
</script>

<div class="details" class:expanded bind:this={elem}>
  <div class="drag-indicator"></div>
  <div class="header">
    <div class="header-title">
      <h2>{title}</h2>
      <button class="button-round" onclick={toggleExpand}>
        {#if expanded}
          <IcRoundCloseFullscreen />
        {:else}
          <IcRoundOpenInFull />
        {/if}
      </button>
      <button class="button-round" onclick={onclose}>
        <IcRoundClose />
      </button>
    </div>
    {#if subtitle}
      <span class="header-subtitle">{subtitle}</span>
    {/if}
    {#if header}
      <div class="header-content">
        {@render header?.()}
      </div>
    {/if}
  </div>
  {#if expanded}
    <div class="content">
      {@render children?.()}
    </div>
  {/if}
</div>

<style>
  .details {
    position: absolute;
    bottom: 0;
    z-index: 100;
    box-sizing: border-box;
    width: 100%;
    box-sizing: border-box;
    background-color: white;
    border-radius: 1rem 1rem 0 0;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 10px #00000011;
    border-top: 1px solid #ccc;
    gap: 0.5rem;
  }

  .details.expanded {
    height: 95%;
  }

  .drag-indicator {
    position: absolute;
    top: 5px;
    left: 0;
    right: 0;
    background-color: var(--c-base-400);
    width: 30px;
    height: 4px;
    margin: 0 auto;
    border-radius: 999px;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  h2 {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    flex: 1;
  }

  .header-title {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .header-subtitle {
    font-size: 0.95rem;
    color: var(--c-base-590);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .content {
    overflow-x: none;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 1rem;
    flex: 1;
    padding-top: 1rem;
  }
</style>
