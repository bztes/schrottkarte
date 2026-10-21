<script lang="ts" module>
  export type ListTab = 'shapes' | 'markers';
</script>

<script lang="ts">
  import DrawingIcon from '#lib/components/DrawingIcon.svelte';
  import DrawingSize from '#lib/components/DrawingSize.svelte';
  import TagInput from '#lib/components/ui/TagInput.svelte';
  import Tabs from '#lib/components/ui/Tabs.svelte';
  import Input from '#lib/components/ui/Input.svelte';
  import SegmentedControl from '#lib/components/ui/SegmentedControl.svelte';
  import IconButton from '#lib/components/ui/IconButton.svelte';
  import Button from '#lib/components/ui/Button.svelte';
  import Chip from '#lib/components/ui/Chip.svelte';
  import Badge from '#lib/components/ui/Badge.svelte';
  import ListButton from '#lib/components/ui/ListButton.svelte';
  import StatusDot from '#lib/components/ui/StatusDot.svelte';
  import type { Drawing } from '#lib/drawings.svelte.js';
  import type { Marker } from '#lib/markers.svelte.js';
  import { filtersToSearchQuery, type Filter, type FilterOperator } from '#lib/filter.svelte.js';
  import type { TagsService } from '#lib/tags.svelte.js';
  import { markerStates, type MarkerState } from '#lib/types.js';
  import { getFriendlyTime, stringifyLngLat, stringifyZoom } from '#lib/utils.js';
  import type { Map } from 'maplibre-gl';
  import { stateColors, stateNames } from '#lib/marker-states.js';
  import LucideSearch from '~icons/lucide/search';
  import LucideLink from '~icons/lucide/link';
  import LucidePrinter from '~icons/lucide/printer';
  import LucideMapPinPlus from '~icons/lucide/map-pin-plus';

  interface Props {
    map: Map | undefined;
    /** drawings matching the tag filter */
    drawings: Drawing[];
    drawingsTotal: number;
    markers: Marker[];
    isUnsynced: (id: string) => boolean;
    tagsService: TagsService;
    /** the tag filter, `filters` is derived from it by the parent */
    tags: string[];
    operator: FilterOperator;
    filters: Filter[];
    tab: ListTab;
    onselectdrawing: (drawing: Drawing) => void;
    onselectmarker: (marker: Marker) => void;
    onaddmarker: () => void;
  }

  let {
    map,
    drawings,
    drawingsTotal,
    markers,
    isUnsynced,
    tagsService,
    tags = $bindable(),
    operator = $bindable(),
    filters,
    tab = $bindable(),
    onselectdrawing,
    onselectmarker,
    onaddmarker,
  }: Props = $props();

  let search = $state('');
  let stateFilter = $state<MarkerState>();

  const query = $derived(search.trim().toLowerCase());

  function matches(...values: string[]) {
    return !query || values.some((v) => v.toLowerCase().includes(query));
  }

  const visibleDrawings = $derived(
    drawings
      .filter((d) => matches(d.name, d.description, ...d.tags))
      .sort((a, b) => (a.name || '￿').localeCompare(b.name || '￿')),
  );

  const visibleMarkers = $derived(
    markers
      .filter((m) => !stateFilter || m.state === stateFilter)
      .filter((m) => matches(m.name, m.description))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
  );

  function tagsProvider(value: string) {
    return tagsService.values.filter((t) => t.includes(value) && !tags.includes(t));
  }

  function handleCopyUrlClick() {
    const params = new URLSearchParams();
    if (filters.length > 0) {
      params.append('filter', filtersToSearchQuery(filters));
    }
    if (map) {
      params.append('center', stringifyLngLat(map.getCenter()));
      params.append('zoom', stringifyZoom(map.getZoom()));
    }
    window.navigator.clipboard.writeText(`${window.location.origin}/?${params.toString()}`);
  }

  function handlePrintClick() {
    const params = new URLSearchParams();
    if (filters.length > 0) {
      params.append('filter', filtersToSearchQuery(filters));
    }
    const query = params.size > 0 ? `?${params.toString()}` : '';
    window.open(`${window.location.origin}/print${query}`, '_blank');
  }
</script>

<div class="list">
  <Tabs
    bind:value={tab}
    items={[
      { value: 'shapes', label: 'Shapes', count: drawingsTotal },
      { value: 'markers', label: 'Markers', count: markers.length },
    ]}
  />

  <div class="filters">
    <div class="row">
      <Input grow placeholder="Search…" aria-label="Search" bind:value={search}>
        {#snippet icon()}<LucideSearch />{/snippet}
      </Input>
      {#if tab === 'markers'}
        <Button variant="primary" onclick={onaddmarker}><LucideMapPinPlus /> Add</Button>
      {/if}
    </div>

    {#if tab === 'shapes'}
      <TagInput bind:tags options={tagsProvider} placeholder="Filter by tags…" />
      <div class="row">
        <SegmentedControl
          label="Tag filter mode"
          bind:value={operator}
          options={[
            { value: 'contains', label: 'All tags' },
            { value: 'overlaps', label: 'Any tag' },
          ]}
        />
        <span class="spacer"></span>
        <IconButton label="Copy URL" onclick={handleCopyUrlClick}><LucideLink /></IconButton>
        <IconButton label="Print" onclick={handlePrintClick}><LucidePrinter /></IconButton>
      </div>
    {:else}
      <div class="chips">
        <Chip active={!stateFilter} onclick={() => (stateFilter = undefined)}>All</Chip>
        {#each markerStates as state (state)}
          <Chip
            active={stateFilter === state}
            color={stateColors[state]}
            onclick={() => (stateFilter = state)}
          >
            {stateNames[state]}
          </Chip>
        {/each}
      </div>
    {/if}
  </div>

  <ul>
    {#if tab === 'shapes'}
      {#each visibleDrawings as drawing (drawing.id)}
        <li>
          <ListButton title={drawing.name || 'Untitled'} onclick={() => onselectdrawing(drawing)}>
            {#snippet leading()}
              <span style:color={drawing.properties.color ?? 'var(--c-primary)'}>
                <DrawingIcon {drawing} />
              </span>
            {/snippet}
            {#snippet meta()}
              <DrawingSize {drawing} />
              {#each drawing.tags as tag (tag)}<Badge>{tag}</Badge>{/each}
            {/snippet}
          </ListButton>
        </li>
      {:else}
        <li class="empty">No shapes match.</li>
      {/each}
    {:else}
      {#each visibleMarkers as marker (marker.id)}
        <li>
          <ListButton title={marker.name || 'Untitled'} onclick={() => onselectmarker(marker)}>
            {#snippet leading()}
              <StatusDot size="md" color={stateColors[marker.state]} />
            {/snippet}
            {#snippet meta()}
              {stateNames[marker.state]} · {getFriendlyTime(marker.updatedAt)}
              {#if isUnsynced(marker.id)}<Badge tone="warning">not saved</Badge>{/if}
            {/snippet}
          </ListButton>
        </li>
      {:else}
        <li class="empty">No markers match.</li>
      {/each}
    {/if}
  </ul>
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .filters {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--c-border);
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .spacer {
    flex: 1;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0.4rem;
    overflow: auto;
    flex: 1;
    min-height: 0;
  }

  .empty {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--c-muted);
  }
</style>
