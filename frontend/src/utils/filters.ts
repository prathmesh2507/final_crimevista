import type { AdditionalFilter, CoreFilterDimension, CrimeFilters, FilterDimension } from '../types/api';
import { formatDate } from './formatters';

export const CORE_DIMENSION_LABELS: Record<CoreFilterDimension, string> = {
  crimeTypes: 'Crime type',
  areas: 'Area',
  severities: 'Severity',
  timePeriods: 'Time of day'
};

export interface FilterChip {
  id: string;
  dimension: FilterDimension;
  value?: string;
  group: string;
  label: string;
}

export function createEmptyFilters(): CrimeFilters {
  return { startDate: null, endDate: null, crimeTypes: [], areas: [], severities: [], timePeriods: [], extra: {} };
}

export function buildFilterChips(filters: CrimeFilters, additional: AdditionalFilter[] = []): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filters.startDate || filters.endDate) {
    chips.push({
      id: 'dateRange',
      dimension: 'dateRange',
      group: 'Date',
      label: `${filters.startDate ? formatDate(filters.startDate) : 'Any'} – ${filters.endDate ? formatDate(filters.endDate) : 'Any'}`
    });
  }
  (Object.keys(CORE_DIMENSION_LABELS) as CoreFilterDimension[]).forEach((dimension) => {
    filters[dimension].forEach((value) =>
    chips.push({ id: `${dimension}:${value}`, dimension, value, group: CORE_DIMENSION_LABELS[dimension], label: value })
    );
  });
  Object.entries(filters.extra).forEach(([key, values]) => {
    const group = additional.find((a) => a.key === key)?.label ?? key;
    values.forEach((value) => chips.push({ id: `extra:${key}:${value}`, dimension: `extra:${key}`, value, group, label: value }));
  });
  return chips;
}

export function countActiveFilters(filters: CrimeFilters): number {
  return buildFilterChips(filters).length;
}

export function removeFilterValue(filters: CrimeFilters, dimension: FilterDimension, value?: string): CrimeFilters {
  if (dimension === 'dateRange') return { ...filters, startDate: null, endDate: null };
  if (dimension.startsWith('extra:')) {
    const key = dimension.slice('extra:'.length);
    return { ...filters, extra: { ...filters.extra, [key]: (filters.extra[key] ?? []).filter((v) => v !== value) } };
  }
  const core = dimension as CoreFilterDimension;
  return { ...filters, [core]: filters[core].filter((v) => v !== value) };
}

function normalize(filters: CrimeFilters) {
  const extra = Object.fromEntries(
    Object.entries(filters.extra).
    filter(([, v]) => v.length).
    map(([k, v]) => [k, [...v].sort()]).
    sort(([a], [b]) => String(a).localeCompare(String(b)))
  );
  return {
    s: filters.startDate ?? '',
    e: filters.endDate ?? '',
    c: [...filters.crimeTypes].sort(),
    a: [...filters.areas].sort(),
    v: [...filters.severities].sort(),
    t: [...filters.timePeriods].sort(),
    extra
  };
}

export function filtersEqual(a: CrimeFilters, b: CrimeFilters): boolean {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}