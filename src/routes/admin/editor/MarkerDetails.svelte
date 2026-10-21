<script lang="ts">
  import type { Marker } from '#lib/markers.svelte.js';
  import DetailsPanel from './DetailsPanel.svelte';
  import Field from '#lib/components/ui/Field.svelte';
  import Input from '#lib/components/ui/Input.svelte';
  import Textarea from '#lib/components/ui/Textarea.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import SegmentedControl from '#lib/components/ui/SegmentedControl.svelte';
  import StatTile from '#lib/components/ui/StatTile.svelte';
  import StatusDot from '#lib/components/ui/StatusDot.svelte';
  import Badge from '#lib/components/ui/Badge.svelte';
  import { stateColors, stateNames, stateOptions } from '#lib/marker-states.js';
  import { getFriendlyTime } from '#lib/utils.js';
  import LucideCrosshair from '~icons/lucide/crosshair';

  interface Props {
    draft: Marker;
    isNew: boolean;
    unsynced: boolean;
    dirty: boolean;
    /** while true, the next click on the map sets the position */
    picking: boolean;
    onclose: () => void;
    onzoom: () => void;
    onsave: () => void;
    ondelete: () => void;
  }

  let {
    draft = $bindable(),
    isNew,
    unsynced,
    dirty,
    picking = $bindable(),
    onclose,
    onzoom,
    onsave,
    ondelete,
  }: Props = $props();
</script>

<DetailsPanel
  title={draft.name || (isNew ? 'New marker' : 'Untitled')}
  subtitle={isNew ? 'New marker' : `Marker · ${stateNames[draft.state]}`}
  {dirty}
  {isNew}
  {onclose}
  {onzoom}
  {onsave}
  ondelete={isNew ? undefined : ondelete}
>
  {#snippet icon()}
    <StatusDot size="md" color={stateColors[draft.state]} />
  {/snippet}

  {#if unsynced}
    <Badge tone="warning">Waiting to be saved on the server</Badge>
  {/if}

  <Field label="Name">
    <Input bind:value={draft.name} placeholder="Untitled" />
  </Field>
  <Field label="State" group>
    <SegmentedControl label="State" bind:value={draft.state} options={stateOptions} />
  </Field>
  <Field label="Comment">
    <Textarea bind:value={draft.description} />
  </Field>
  <Field label="Position" group>
    <div class="position">
      <span class="coords">{draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}</span>
      <Button
        size="sm"
        variant={picking ? 'primary' : 'secondary'}
        onclick={() => (picking = !picking)}
      >
        <LucideCrosshair />
        {picking ? 'Click on the map…' : 'Pick on map'}
      </Button>
    </div>
  </Field>

  {#if !isNew}
    <div class="facts">
      <StatTile label="Updated">{getFriendlyTime(draft.updatedAt)}</StatTile>
      <StatTile label="Created">{draft.createdAt.toLocaleDateString()}</StatTile>
    </div>
  {/if}
</DetailsPanel>

<style>
  .position {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .coords {
    font-variant-numeric: tabular-nums;
    color: var(--c-muted);
  }

  .facts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    font-size: var(--fs-sm);
  }
</style>
