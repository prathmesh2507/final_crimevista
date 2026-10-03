import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, LoaderCircleIcon, SlidersHorizontalIcon } from 'lucide-react';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { useFilters } from '../../hooks/useFilters';
import type { CoreFilterDimension, CrimeFilters } from '../../types/api';
import { cn } from '../../utils/cn';
import { CORE_DIMENSION_LABELS, filtersEqual } from '../../utils/filters';
import { DateField } from './DateField';
import { FilterChips } from './FilterChips';
import { MultiSelect } from './MultiSelect';

interface FilterPanelProps {
  isFetching?: boolean;
  hiddenDimensions?: CoreFilterDimension[];
}

export function FilterPanel({ isFetching = false, hiddenDimensions = [] }: FilterPanelProps) {
  const { filters, applyFilters, resetFilters, activeCount } = useFilters();
  const optionsQuery = useFilterOptions();
  const options = optionsQuery.data;
  const [draft, setDraft] = useState<CrimeFilters>(filters);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setDraft(filters), [filters]);

  const dateError = draft.startDate && draft.endDate && draft.startDate > draft.endDate ? 'Start date must be on or before the end date.' : null;
  const dirty = !filtersEqual(draft, filters);

  const dimensions = (Object.keys(CORE_DIMENSION_LABELS) as CoreFilterDimension[]).filter((d) => !hiddenDimensions.includes(d));
  const optionsFor: Record<CoreFilterDimension, string[]> = {
    crimeTypes: options?.crimeTypes ?? [],
    areas: options?.areas ?? [],
    severities: options?.severities ?? [],
    timePeriods: options?.timePeriods ?? []
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError) return;
    applyFilters(draft);
    setMobileOpen(false);
  };

  return (
    <section aria-label="Filters" className="rounded-xl border border-line bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-fg md:hidden">
        
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontalIcon className="h-4 w-4 text-muted" aria-hidden />
          Filters
          {activeCount > 0 && <span className="rounded-md bg-analytics px-1.5 text-xs font-semibold text-white">{activeCount}</span>}
        </span>
        <ChevronDownIcon className={cn('h-4 w-4 text-subtle transition-transform duration-150', mobileOpen && 'rotate-180')} aria-hidden />
      </button>

      <form onSubmit={submit} className={cn('border-t border-line p-4 md:block md:border-t-0', mobileOpen ? 'block' : 'hidden')}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          <DateField
            id="filter-start"
            label="From"
            value={draft.startDate}
            min={options?.dateRange.min}
            max={options?.dateRange.max}
            invalid={Boolean(dateError)}
            onChange={(v) => setDraft((d) => ({ ...d, startDate: v }))} />
          
          <DateField
            id="filter-end"
            label="To"
            value={draft.endDate}
            min={options?.dateRange.min}
            max={options?.dateRange.max}
            invalid={Boolean(dateError)}
            onChange={(v) => setDraft((d) => ({ ...d, endDate: v }))} />
          
          {dimensions.map((dimension) =>
          <MultiSelect
            key={dimension}
            id={`filter-${dimension}`}
            label={CORE_DIMENSION_LABELS[dimension]}
            options={optionsFor[dimension]}
            value={draft[dimension]}
            loading={optionsQuery.isLoading}
            onChange={(v) => setDraft((d) => ({ ...d, [dimension]: v }))} />

          )}
          {options?.additional.map((filter) =>
          <MultiSelect
            key={filter.key}
            id={`filter-extra-${filter.key}`}
            label={filter.label}
            options={filter.options}
            value={draft.extra[filter.key] ?? []}
            onChange={(v) => setDraft((d) => ({ ...d, extra: { ...d.extra, [filter.key]: v } }))} />

          )}
        </div>

        {dateError &&
        <p role="alert" className="mt-2 text-xs font-medium text-danger">
            {dateError}
          </p>
        }
        {optionsQuery.isError &&
        <p role="alert" className="mt-2 text-xs text-danger">
            Filter options couldn't be loaded.{' '}
            <button type="button" onClick={() => optionsQuery.refetch()} className="font-semibold underline underline-offset-2">
              Retry
            </button>
          </p>
        }

        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <FilterChips />
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={resetFilters}
              disabled={activeCount === 0 && !dirty}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm font-medium text-fg transition-colors duration-150 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none">
              
              Reset filters
            </button>
            <button
              type="submit"
              disabled={!dirty || Boolean(dateError)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-analytics px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-analytics-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none">
              
              {isFetching && <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />}
              Apply filters
            </button>
          </div>
        </div>
      </form>
    </section>);

}