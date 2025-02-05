export type FilterOperator = 'eq' | 'contains' | 'overlaps';

export interface Filter {
  field: string;
  operator: FilterOperator;
  values: string[];
}

const searchQueryRegEx = /([a-z]+).([a-z]+)\(([^)]+)\)/g;

export function filtersToSearchQuery(filters: Filter[]): string {
  const queryParts = filters.map((f) => {
    return `${f.field}.${f.operator}(${f.values.join(',')})`;
  });
  return queryParts.join(';');
}

export function searchQueryToFilters(query: string): Filter[] {
  const matches = query.matchAll(searchQueryRegEx);
  if (!matches) {
    return [];
  }

  const filters: Filter[] = [];
  for (const match of matches) {
    const values = match[3].split(',');
    filters.push({
      field: match[1],
      operator: match[2] as FilterOperator,
      values,
    });
  }

  return filters;
}

export function applyFilterToArray<T>(items: T[], ...filters: Filter[]): T[] {
  return items.filter((item) => {
    return filtersMatch(item, ...filters);
  });
}

export function filtersMatch<T>(item: T, ...filters: Filter[]): boolean {
  if (!item || typeof item !== 'object') {
    return false;
  }

  for (const filter of filters) {
    const fieldValue = item[filter.field as keyof T];
    if (fieldValue === undefined) {
      continue;
    } else if (filter.operator === 'eq') {
      if (fieldValue != filter.values[0]) {
        return false;
      }
    } else if (filter.operator === 'contains') {
      if (Array.isArray(fieldValue) && !filter.values.every((v) => fieldValue.includes(v))) {
        return false;
      }
    } else if (filter.operator === 'overlaps') {
      if (Array.isArray(fieldValue) && !filter.values.some((v) => fieldValue.includes(v))) {
        return false;
      }
    }
  }
  return true;
}
