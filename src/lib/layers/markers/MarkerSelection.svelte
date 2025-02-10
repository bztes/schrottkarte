<script lang="ts" module>
  const stateNames: Record<MarkerState, string> = {
    new: 'Neu',
    marked: 'Markiert',
    done: 'Erledigt',
  };

  export type MarkerSelectionMode = 'view' | 'edit' | 'move' | 'create';
</script>

<script lang="ts">
  import Details from '$lib/components/Details.svelte';
  import { debounce, reverseGeocoding, noop, watch } from '$lib/utils';
  import type { Map } from 'maplibre-gl';
  import { untrack } from 'svelte';
  import IcRoundLocationSearching from '~icons/ic/round-location-searching';
  import { markerStates, type Marker, type MarkerState } from '../../markers.svelte';

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

  // default marker name by center position

  let generatedMarkerName = $state<string>();
  let generatedMarkerHouseNumber = $state('');

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
    generatedMarkerHouseNumber = markerInfo.address?.house_number;
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
    map.panTo(marker);
    mode = 'edit';
    expanded = true;
  }

  function handleMoveClick() {
    map.panTo(marker);
    mode = 'move';
  }

  function handleCloseClick() {
    onClose();
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
    expanded = false;
  }

  function handleSaveCreateClick() {
    updatePosition();
    marker.name = marker.name.trim() || generatedMarkerName || '';
    updateOrgMarker();
    onSave();
    mode = 'view';
  }

  function handleCancelEditClick() {
    Object.assign(marker, orgMarker);
    mode = 'view';
    expanded = false;
  }

  function handleCancelMoveClick() {
    Object.assign(marker, orgMarker);
    mode = 'view';
  }

  function handleDeleteClick() {
    onDelete();
    mode = 'view';
  }

  // ui component settings

  let title = $derived(mode === 'create' ? 'Neue Markierung' : marker.name || 'Unbenannt');

  let subtitle = $derived.by(() => {
    switch (mode) {
      case 'edit':
        return 'Markierung bearbeiten';
      case 'view':
        return `Markierung - ${stateNames[marker.state]}`;
      case 'create':
        return generatedMarkerName ?? 'Adresse wird geladen...';
      default:
        return undefined;
    }
  });

  let expanded = $state(false);
</script>

{#if mode === 'move'}
  <div class="center-marker">
    <IcRoundLocationSearching />
  </div>
  <div class="move-marker-buttons">
    <button class="button-primary" onclick={handleSaveMoveClick}>Hierher verschieben</button>
    <button class="button-accent" onclick={handleCancelMoveClick}>Abbrechen</button>
  </div>
{:else}
  <Details {title} {subtitle} bind:expanded onclose={handleCloseClick}>
    {#snippet header()}
      {#if mode === 'view'}
        {#if canUpdate}
          <button class="button-primary" onclick={handleEditClick}>Bearbeiten</button>
          {#if canMove}
            <button class="button-primary" onclick={handleMoveClick}>Verschieben</button>
          {/if}
          {#if canDelete}
            <button class="button-accent" onclick={handleDeleteClick}>Löschen</button>
          {/if}
        {/if}
      {:else if mode === 'create'}
        <button class="button-primary" onclick={handleSaveCreateClick}>Hinzufügen</button>
        {#if !generatedMarkerHouseNumber}
          <span class="warn">Keine Hausnummer ermittelt</span>
        {/if}
      {:else if mode === 'edit'}
        <button class="button-primary" onclick={handleSaveEditClick} disabled={!hasChanged}>
          Speichern
        </button>
        <button class="button-accent" onclick={handleCancelEditClick}>Abbrechen</button>
      {/if}
    {/snippet}

    {#if mode === 'view'}
      <div><strong>Status:</strong> {stateNames[marker.state]}</div>
      <div><strong>Name:</strong> {marker.name}</div>
      <div><strong>Bemerkung:</strong> {marker.description}</div>
      <div><strong>Erstellt:</strong> {marker.created_at.toLocaleString()}</div>
      <div><strong>Bearbeitet:</strong> {marker.updated_at.toLocaleString()}</div>
      <div><strong>Position:</strong> {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</div>
      <div><strong>Id:</strong> {marker.id}</div>
    {:else if mode === 'create'}
      <label>
        Name
        <input type="text" bind:value={marker.name} placeholder={generatedMarkerName} />
      </label>
      <label>
        Kommentar
        <textarea bind:value={marker.description} placeholder="ohne Räder"></textarea>
      </label>
    {:else}
      <label>
        Name
        <input type="text" bind:value={marker.name} placeholder="Unbenannt" />
      </label>
      <div class="radio-input-label">
        Status
        <div class="radio-input">
          {#each markerStates as state}
            <label>
              {stateNames[state]}
              <input type="radio" name="state" value={state} bind:group={marker.state} />
            </label>
          {/each}
        </div>
      </div>
      <label>
        Kommentar
        <textarea bind:value={marker.description} placeholder="ohne Räder"></textarea>
      </label>
    {/if}
  </Details>
  {#if mode === 'create'}
    <div class="center-marker">
      <IcRoundLocationSearching />
    </div>
  {/if}
{/if}

<style>
  .center-marker {
    pointer-events: none;
    position: absolute;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    font-size: 3rem;
  }

  .move-marker-buttons {
    position: absolute;
    z-index: 10;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, 100%) translateY(3rem);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 1rem;
  }

  .warn {
    color: red;
  }
</style>
