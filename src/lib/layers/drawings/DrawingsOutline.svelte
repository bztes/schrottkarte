<script lang="ts">
  import DrawingIcon from '$lib/components/DrawingIcon.svelte';
  import DrawingSize from '$lib/components/DrawingSize.svelte';
  import TagsInput from '$lib/components/TagsInput.svelte';
  import type { Drawing, DrawingsService } from '$lib/drawings.svelte';
  import {
    applyFilterToArray,
    filtersToSearchQuery,
    type Filter,
    type FilterOperator,
  } from '$lib/filter.svelte';
  import type { TagsService } from '$lib/tags.svelte';
  import { stringifyLngLat, stringifyZoom } from '$lib/utils';
  import { bbox } from '@turf/turf';
  import type { Map } from 'maplibre-gl';

  interface Props {
    map: Map | undefined;
    drawingsService: DrawingsService;
    tagsService: TagsService;
    filters: Filter[];
  }

  let { map, drawingsService, tagsService, filters = $bindable() }: Props = $props();
  let tags = $state<string[]>([]);
  let operator = $state<FilterOperator>('contains');
  const filteredDrawings = $derived(
    applyFilterToArray(drawingsService.all, ...filters).sort((a, b) =>
      (a.name || 'zzz').localeCompare(b.name || 'zzz'),
    ),
  );

  $effect(() => {
    filters = tags.length > 0 ? [{ field: 'tags', operator: operator, values: tags }] : [];
  });

  function tagsProvider(value: string) {
    return tagsService.values.filter((t) => t.includes(value) && !tags.includes(t));
  }

  function handleShowClick(drawing: Drawing) {
    if (!map) {
      return;
    }

    const bounds = bbox(drawing.geom);
    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: 100 },
    );
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

    if (params.size === 0) {
      window.navigator.clipboard.writeText(window.location.origin);
    } else {
      window.navigator.clipboard.writeText(`${window.location.origin}?${params.toString()}`);
    }
  }

  function handleCopyDrawingURL(drawing: Drawing) {
    const params = new URLSearchParams();

    const filter: Filter = { field: 'id', operator: 'eq', values: [drawing.id] };
    params.append('filter', filtersToSearchQuery([filter]));

    if (map) {
      params.append('center', stringifyLngLat(map.getCenter()));
      params.append('zoom', stringifyZoom(map.getZoom()));
    }

    if (params.size === 0) {
      window.navigator.clipboard.writeText(window.location.origin);
    } else {
      window.navigator.clipboard.writeText(`${window.location.origin}?${params.toString()}`);
    }
  }

  function handlePrintClick() {
    const params = new URLSearchParams();
    if (filters.length > 0) {
      params.append('filter', filtersToSearchQuery(filters));
    }

    let url = `${window.location.origin}/print`;
    if (params.size > 0) {
      url += `?${params.toString()}`;
    }

    window.open(url, '_blank');
  }
</script>

<div class="content">
  <section class="filter">
    <TagsInput {tags} options={tagsProvider} />
    <div class="radio-input">
      {#each ['contains', 'overlaps'] as option (option)}
        <label>
          {option}
          <input type="radio" name="operator" value={option} bind:group={operator} />
        </label>
      {/each}
    </div>
    <div>
      <button onclick={handleCopyUrlClick}>Copy URL</button>
      <button onclick={handlePrintClick}>Print</button>
    </div>
    <span>{filteredDrawings.length} / {drawingsService.all.length}</span>
  </section>

  {#if filteredDrawings.length === 0 && drawingsService.all.length > 0}
    Keine Einträge entsprechen den Filterkriterien.
  {/if}

  <ul>
    {#each filteredDrawings as drawing}
      <li>
        <h3 class="name">
          <DrawingIcon {drawing} />
          {drawing.name || 'Unbenannt'}
        </h3>
        <div class="date">
          {drawing.updated_at.toLocaleString()}
        </div>
        <div class="size">
          <DrawingSize {drawing} />
        </div>
        <div class="description">
          {drawing.description}
        </div>
        <div class="tags">
          {#each drawing.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
        <div class="buttons">
          <button class="button-secondary" onclick={() => handleShowClick(drawing)}>FlyTo</button>
          <button class="button-secondary" onclick={() => handleCopyDrawingURL(drawing)}>URL</button
          >
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  .content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  section.filter {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 0.5rem;
    border-bottom: 1px solid var(--c-base-300);
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow: auto;
    font-size: 0.9rem;
    flex: 1fr;
  }

  li {
    padding: 0.5rem;
    border-bottom: 1px solid var(--c-base-300);
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: 'name name' 'date size' 'description description' 'tags buttons';
    align-items: start;
    gap: 0.25em;
    align-items: center;
  }

  li:hover {
    background-color: var(--c-base-200);
  }

  .buttons {
    grid-area: buttons;
    justify-self: end;
  }

  .date {
    grid-area: date;
    font-size: 0.9em;
  }

  .description {
    grid-area: description;
  }

  .size {
    grid-area: size;
    font-size: 0.9em;
    justify-self: end;
  }

  .tags {
    grid-area: tags;
  }
</style>
