import React, { createContext, useMemo, useState, type ReactNode } from 'react';
import type { CrimeFilters, FilterDimension } from '../types/api';
import { countActiveFilters, createEmptyFilters, removeFilterValue } from '../utils/filters';

export interface FilterContextValue {
  /** Applied filters — these drive every API query. */
  filters: CrimeFilters;
  applyFilters: (next: CrimeFilters) => void;
  resetFilters: () => void;
  removeFilterValue: (dimension: FilterDimension, value?: string) => void;
  activeCount: number;
}

export const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: {children: ReactNode;}) {
  const [filters, setFilters] = useState<CrimeFilters>(createEmptyFilters);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      applyFilters: (next) => setFilters(next),
      resetFilters: () => setFilters(createEmptyFilters()),
      removeFilterValue: (dimension, v) => setFilters((current) => removeFilterValue(current, dimension, v)),
      activeCount: countActiveFilters(filters)
    }),
    [filters]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}