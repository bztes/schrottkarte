<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import IconButton from '#lib/components/ui/IconButton.svelte';
  import Badge from '#lib/components/ui/Badge.svelte';
  import LucideArrowLeft from '~icons/lucide/arrow-left';
  import LucideScanSearch from '~icons/lucide/scan-search';
  import LucideSave from '~icons/lucide/save';
  import LucideTrash2 from '~icons/lucide/trash-2';

  interface Props {
    title: string;
    subtitle: string;
    dirty: boolean;
    saving?: boolean;
    /** a new item can be saved without changes */
    isNew?: boolean;
    icon: Snippet;
    children: Snippet;
    onclose: () => void;
    onzoom: () => void;
    onsave: () => void;
    ondelete?: () => void;
  }

  let {
    title,
    subtitle,
    dirty,
    saving = false,
    isNew = false,
    icon,
    children,
    onclose,
    onzoom,
    onsave,
    ondelete,
  }: Props = $props();
</script>

<div class="panel">
  <header>
    <IconButton label="Back to list" onclick={onclose}><LucideArrowLeft /></IconButton>
    <span class="icon">{@render icon()}</span>
    <div class="heading">
      <h2>{title}</h2>
      <span class="subtitle">
        {subtitle}
        {#if dirty}<Badge tone="warning">unsaved</Badge>{/if}
      </span>
    </div>
    <IconButton label="Show on map" onclick={onzoom}><LucideScanSearch /></IconButton>
  </header>

  <div class="body">
    {@render children()}
  </div>

  <footer>
    <Button variant="primary" block onclick={onsave} disabled={(!dirty && !isNew) || saving}>
      <LucideSave />
      {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
    </Button>
    {#if ondelete}
      <Button variant="danger" onclick={ondelete} disabled={saving}>
        <LucideTrash2 /> Delete
      </Button>
    {/if}
  </footer>
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem;
    border-bottom: 1px solid var(--c-border);
  }

  .icon {
    display: flex;
    font-size: 1.3rem;
  }

  .heading {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  h2 {
    font-size: var(--fs-md);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .subtitle {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--c-muted);
    font-size: var(--fs-sm);
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 0.9rem 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  footer {
    display: flex;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    border-top: 1px solid var(--c-border);
    background-color: var(--c-base-100);
  }
</style>
