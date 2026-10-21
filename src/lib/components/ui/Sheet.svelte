<script lang="ts" module>
  export interface SheetInset {
    left: number;
    bottom: number;
  }
</script>

<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { MediaQuery } from 'svelte/reactivity';
  import LucideX from '~icons/lucide/x';
  import IconButton from './IconButton.svelte';

  interface Props {
    title: string;
    subtitle?: string;
    /** leading visual next to the title, e.g. a status dot */
    icon?: Snippet;
    /** extra content in the subtitle row, e.g. badges */
    meta?: Snippet;
    /** action buttons, stay visible while the content scrolls */
    footer?: Snippet;
    children?: Snippet;
    onclose?: () => void;
    /** called with the part of the map the sheet covers, side panel on desktop, bottom sheet on mobile */
    oninset?: (inset: SheetInset) => void;
  }

  let { title, subtitle, icon, meta, footer, children, onclose, oninset }: Props = $props();

  const mobile = new MediaQuery('max-width: 720px');
  let width = $state(0);
  let height = $state(0);
  // gap between the sheet and the map edge on desktop
  const gap = 12;

  const inset = $derived<SheetInset>(
    mobile.current ? { left: 0, bottom: height } : { left: width + gap, bottom: 0 },
  );

  $effect(() => {
    const current = inset;
    untrack(() => oninset?.(current));
  });
</script>

<section class="sheet" aria-label={title} bind:clientWidth={width} bind:clientHeight={height}>
  <div class="handle" aria-hidden="true"></div>
  <header>
    {#if icon}<span class="icon">{@render icon()}</span>{/if}
    <div class="heading">
      <h2>{title}</h2>
      {#if subtitle || meta}
        <div class="subtitle">
          {#if subtitle}<span class="subtitle-text">{subtitle}</span>{/if}
          {@render meta?.()}
        </div>
      {/if}
    </div>
    {#if onclose}
      <IconButton label="Close" onclick={onclose}><LucideX /></IconButton>
    {/if}
  </header>

  {#if children}
    <div class="body">
      {@render children()}
    </div>
  {/if}

  {#if footer}
    <footer>
      {@render footer()}
    </footer>
  {/if}
</section>

<style>
  .sheet {
    position: absolute;
    z-index: 100;
    left: 0.75rem;
    bottom: 0.75rem;
    width: 24rem;
    max-height: calc(100% - 9rem);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: var(--c-base-100);
    border: 1px solid var(--c-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  .handle {
    display: none;
  }

  header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 0.75rem 0.85rem 1rem;
  }

  .icon {
    display: flex;
    flex: none;
    font-size: 1.3rem;
    color: var(--c-muted);
  }

  .heading {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  h2 {
    font-size: var(--fs-lg);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .subtitle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
    color: var(--c-muted);
    font-size: var(--fs-sm);
  }

  .subtitle-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding: 0.25rem 1rem 1rem;
  }

  footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--c-border);
    background-color: var(--c-base-200);
  }

  /* mobile: bottom sheet over the full width */
  @media (max-width: 720px) {
    .sheet {
      left: 0;
      right: 0;
      bottom: 0;
      width: auto;
      max-height: 70%;
      border-width: 1px 0 0;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      padding-bottom: env(safe-area-inset-bottom);
    }

    .handle {
      display: block;
      width: 2.25rem;
      height: 0.25rem;
      margin: 0.5rem auto 0;
      border-radius: 999px;
      background-color: var(--c-base-400);
    }

    header {
      padding-top: 0.5rem;
    }

    footer {
      background-color: var(--c-base-100);
    }
  }
</style>
