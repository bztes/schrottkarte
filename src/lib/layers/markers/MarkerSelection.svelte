<script lang="ts" module>
  export type MarkerSelectionMode = 'view' | 'edit' | 'move' | 'create';
</script>

<script lang="ts">
  import Sheet, { type SheetInset } from '#lib/components/ui/Sheet.svelte';
  import CenterPin from '#lib/components/ui/CenterPin.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import IconButton from '#lib/components/ui/IconButton.svelte';
  import Field from '#lib/components/ui/Field.svelte';
  import Input from '#lib/components/ui/Input.svelte';
  import Textarea from '#lib/components/ui/Textarea.svelte';
  import SegmentedControl from '#lib/components/ui/SegmentedControl.svelte';
  import StatTile from '#lib/components/ui/StatTile.svelte';
  import StatusDot from '#lib/components/ui/StatusDot.svelte';
  import Badge from '#lib/components/ui/Badge.svelte';
  import { stateColors, stateNames, stateOptions } from '#lib/marker-states.js';
  import { debounce, getFriendlyTime, reverseGeocoding, noop, watch } from '#lib/utils.js';
  import type { Map } from 'maplibre-gl';
  import { onDestroy, untrack } from 'svelte';
  import LucideMapPinPlus from '~icons/lucide/map-pin-plus';
  import LucidePencil from '~icons/lucide/pencil';
  import LucideMove from '~icons/lucide/move';
  import LucideTrash2 from '~icons/lucide/trash-2';
  import LucideCheck from '~icons/lucide/check';
  import LucideChevronDown from '~icons/lucide/chevron-down';
  import LucideChevronUp from '~icons/lucide/chevron-up';
  import type { Marker } from '../../markers.svelte';

  interface Props {
    map: Map;
    marker: Marker;
    onClose?: () => void;
    onSave?: () => void;
    onDelete?: () => void;
    hasChanged?: boolean;
    mode?: MarkerSelectionMode;
    canUpdate?: boolean;
    canDelete?: boolean;
    canMove?: boolean;
  }

  let {
    map,
    marker = $bindable(),
    onClose = noop,
    onSave = noop,
    onDelete = noop,
    hasChanged = $bindable(false),
    mode = $bindable('view'),
    canUpdate = false,
    canDelete = false,
    canMove = false,
  }: Props = $props();

  // Track marker has changed

  let orgMarker = $state.raw<Marker>($state.snapshot(marker));

  $effect(() => {
    watch(marker);
    orgMarker = untrack(() => $state.snapshot(marker));
  });

  $effect(() => {
    hasChanged =
      orgMarker.name !== marker.name ||
      orgMarker.description !== marker.description ||
      orgMarker.state !== marker.state ||
      orgMarker.lat !== marker.lat ||
      orgMarker.lng !== marker.lng;
  });

  function updateOrgMarker() {
    orgMarker = $state.snapshot(marker);
    hasChanged = false;
  }

  // keep the marker visible next to the sheet by padding the map

  function handleInset(inset: SheetInset) {
    // while creating, the user positions the map, so only the padding changes
    const center = mode === 'create' ? undefined : { lng: marker.lng, lat: marker.lat };
    map.easeTo({ padding: { top: 0, right: 0, ...inset }, center, duration: 200 });
  }

  onDestroy(() => {
    map.easeTo({ padding: { top: 0, right: 0, bottom: 0, left: 0 }, duration: 200 });
  });

  // the pin follows the padding the map really uses, an interrupted easeTo (pan, drag)
  // can leave it anywhere between the old and the new inset
  // svelte-ignore state_referenced_locally
  let mapPadding = $state(map.getPadding());

  $effect(() => {
    // the pin is only shown while creating or moving
    if (mode !== 'create' && mode !== 'move') {
      return;
    }
    const update = () => {
      const padding = map.getPadding();
      if (padding.left !== mapPadding.left || padding.bottom !== mapPadding.bottom) {
        mapPadding = padding;
      }
    };
    untrack(update);
    map.on('move', update);
    return () => map.off('move', update);
  });

  // default marker name by center position

  let generatedMarkerName = $state<string>();

  $effect(() => {
    if (mode === 'create') {
      generatedMarkerName = undefined;
      updateDefaultMarkerName();
    }
  });

  $effect(() => {
    map.on('moveend', handleMoveEnd);
    return () => map.off('moveend', handleMoveEnd);
  });

  const updateDefaultMarkerName = debounce(async () => {
    const markerInfo = await reverseGeocoding(map.getCenter());
    generatedMarkerName = markerInfo.display_name;
  }, 1000);

  async function handleMoveEnd() {
    if (mode === 'create') {
      updateDefaultMarkerName();
    }
  }

  // event handler

  function updatePosition() {
    const center = map.getCenter();
    marker.lng = center.lng;
    marker.lat = center.lat;
  }

  function handleEditClick() {
    mode = 'edit';
  }

  function handleMoveClick() {
    map.panTo(marker);
    mode = 'move';
  }

  function handleSaveMoveClick() {
    updatePosition();
    updateOrgMarker();
    onSave();
    mode = 'view';
  }

  function handleSaveEditClick() {
    updateOrgMarker();
    onSave();
    mode = 'view';
  }

  function handleSaveCreateClick() {
    updatePosition();
    marker.name = marker.name.trim() || generatedMarkerName || '';
    updateOrgMarker();
    onSave();
    mode = 'view';
  }

  function handleCancelClick() {
    Object.assign(marker, orgMarker);
    mode = 'view';
  }

  function handleDeleteClick() {
    onDelete();
  }

  // ui component settings

  let showFacts = $state(false);

  let title = $derived(mode === 'create' ? 'New marker' : marker.name || 'Untitled');

  let subtitle = $derived.by(() => {
    switch (mode) {
      case 'create':
        return generatedMarkerName ?? 'Looking up address…';
      case 'move':
        return 'Drag the map to the new position';
      case 'edit':
        return 'Editing marker';
      default:
        return `${stateNames[marker.state]} · updated ${getFriendlyTime(marker.updatedAt)}`;
    }
  });
</script>

{#if mode === 'create' || mode === 'move'}
  <CenterPin left={mapPadding.left} bottom={mapPadding.bottom} />
{/if}

<Sheet {title} {subtitle} oninset={handleInset} onclose={mode === 'view' ? onClose : undefined}>
  {#snippet icon()}
    {#if mode === 'create'}
      <LucideMapPinPlus />
    {:else}
      <StatusDot size="md" color={stateColors[marker.state]} />
    {/if}
  {/snippet}

  {#snippet meta()}
    {#if (mode === 'edit' || mode === 'view') && hasChanged}
      <Badge tone="warning">unsaved</Badge>
    {/if}
  {/snippet}

  {#if mode === 'view'}
    {#if canUpdate}
      <!-- only changes the draft, saving needs a second tap in the footer -->
      <div class="state">
        <SegmentedControl label="State" bind:value={marker.state} options={stateOptions} />
      </div>
    {/if}
    {#if marker.description}
      <p class="description">{marker.description}</p>
    {/if}
    <div class="facts-toggle">
      <Button variant="ghost" size="sm" onclick={() => (showFacts = !showFacts)}>
        {#if showFacts}<LucideChevronUp />{:else}<LucideChevronDown />{/if}
        {showFacts ? 'Hide details' : 'Show details'}
      </Button>
    </div>
    {#if showFacts}
      <div class="facts">
        <StatTile label="Created">{marker.createdAt.toLocaleString()}</StatTile>
        <StatTile label="Updated">{marker.updatedAt.toLocaleString()}</StatTile>
        <StatTile label="Position">{marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}</StatTile>
        <StatTile label="Id"><span class="id">{marker.id}</span></StatTile>
      </div>
    {/if}
  {:else if mode === 'create'}
    <p class="hint">Move the map until the pin points at the right spot.</p>
    <Field label="Name" hint="(optional)">
      <Input bind:value={marker.name} placeholder={generatedMarkerName ?? 'Address'} />
    </Field>
    <Field label="Comment" hint="(optional)">
      <Textarea bind:value={marker.description} rows={2} />
    </Field>
  {:else if mode === 'edit'}
    <Field label="Name">
      <Input bind:value={marker.name} placeholder="Untitled" />
    </Field>
    <Field label="State" group>
      <SegmentedControl label="State" bind:value={marker.state} options={stateOptions} />
    </Field>
    <Field label="Comment">
      <Textarea bind:value={marker.description} />
    </Field>
  {/if}

  {#snippet footer()}
    {#if mode === 'view'}
      {#if hasChanged}
        <Button variant="primary" block onclick={handleSaveEditClick}>
          <LucideCheck /> Save as {stateNames[marker.state]}
        </Button>
        <Button onclick={handleCancelClick}>Cancel</Button>
      {:else if canUpdate}
        <Button variant="primary" block onclick={handleEditClick}>
          <LucidePencil /> Edit
        </Button>
        {#if canMove}
          <Button block onclick={handleMoveClick}><LucideMove /> Move</Button>
        {/if}
        {#if canDelete}
          <IconButton label="Delete marker" variant="danger" onclick={handleDeleteClick}>
            <LucideTrash2 />
          </IconButton>
        {/if}
      {:else}
        <span class="read-only">You can view this marker but not change it.</span>
      {/if}
    {:else if mode === 'create'}
      <Button variant="primary" block onclick={handleSaveCreateClick}>
        <LucideCheck /> Add marker
      </Button>
      <Button onclick={onClose}>Cancel</Button>
    {:else if mode === 'move'}
      <Button variant="primary" block onclick={handleSaveMoveClick}>
        <LucideCheck /> Move here
      </Button>
      <Button onclick={handleCancelClick}>Cancel</Button>
    {:else if mode === 'edit'}
      <Button variant="primary" block onclick={handleSaveEditClick} disabled={!hasChanged}>
        <LucideCheck /> Save
      </Button>
      <Button onclick={handleCancelClick}>Cancel</Button>
      {#if canDelete}
        <IconButton label="Delete marker" variant="danger" onclick={handleDeleteClick}>
          <LucideTrash2 />
        </IconButton>
      {/if}
    {/if}
  {/snippet}
</Sheet>

<style>
  p {
    margin: 0;
  }

  /* stretch the segmented control to the full width */
  .state {
    display: flex;
    flex-direction: column;
  }

  .description {
    white-space: pre-line;
    overflow-wrap: anywhere;
  }

  .hint,
  .read-only {
    color: var(--c-muted);
    font-size: var(--fs-sm);
  }

  .facts-toggle {
    margin-left: -0.65rem;
  }

  .facts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    font-size: var(--fs-sm);
  }

  .id {
    font-family: var(--ff-mono);
    font-size: 0.75rem;
  }
</style>
