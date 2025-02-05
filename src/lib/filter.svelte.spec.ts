import { expect, it } from 'vitest';
import { applyFilterToArray, filtersToSearchQuery, searchQueryToFilters } from './filter.svelte';

it('should create search query from filter', () => {
  expect(
    filtersToSearchQuery([
      { field: 'tags', operator: 'contains', values: ['a', 'b'] },
      { field: 'name', operator: 'eq', values: ['c'] },
    ]),
  ).toBe('tags.contains(a,b);name.eq(c)');
});

it('should create filters from search query', () => {
  expect(searchQueryToFilters('tags.contains(a,b);name.eq(c)')).toEqual([
    { field: 'tags', operator: 'contains', values: ['a', 'b'] },
    { field: 'name', operator: 'eq', values: ['c'] },
  ]);
});

it.each<{ items: Record<string, unknown>[]; query: string }>([
  {
    items: [
      { name: 'test', match: true },
      { name: 'test2', match: false },
    ],
    query: 'name.eq(test)',
  },
  {
    items: [
      { tags: ['a', 'b'], match: true },
      { tags: ['b', 'c'], match: false },
    ],
    query: 'tags.contains(a,b)',
  },
  {
    items: [
      { tags: ['a', 'b'], match: false },
      { tags: ['b', 'c'], match: true },
    ],
    query: 'tags.overlaps(c)',
  },
])('should apply array filter for $query', ({ items, query }) => {
  const filters = searchQueryToFilters(query);
  const filteredItems = applyFilterToArray(items, ...filters);
  expect(filteredItems).toEqual(items.filter((i) => i.match));
});
