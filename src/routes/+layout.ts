import type { LayoutLoad } from './$types';
import { searchQueryToFilters } from '#lib/filter.svelte.js';
import { parserLngLat, parserZoom } from '#lib/utils.js';

export const load: LayoutLoad = async ({ url }) => {
  const filters = searchQueryToFilters(url.searchParams.get('filter') ?? '');
  const center = parserLngLat(url.searchParams.get('center') ?? '');
  const zoom = parserZoom(url.searchParams.get('zoom') ?? '');

  return {
    filters,
    center,
    zoom,
  };
};
