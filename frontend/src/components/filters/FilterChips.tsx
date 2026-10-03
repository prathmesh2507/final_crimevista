import React from 'react';
import { XIcon } from 'lucide-react';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { useFilters } from '../../hooks/useFilters';
import { buildFilterChips } from '../../utils/filters';

export function FilterChips() {
  const { filters, removeFilterValue } = useFilters();
  const { data: options } = useFilterOptions();
  const chips = buildFilterChips(filters, options?.additional);

  if (!chips.length) return <p className="text-sm text-muted">No filters applied — showing all records.</p>;

  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Active filters">
      {chips.map((chip) =>
      <li key={chip.id}>
          <span className="inline-flex h-7 items-center gap-1 rounded-md border border-analytics/20 bg-analytics-soft pl-2.5 pr-1 text-xs text-analytics-strong">
            <span className="text-analytics-strong/70">{chip.group}:</span>
            <span className="font-medium">{chip.label}</span>
            <button
            type="button"
            onClick={() => removeFilterValue(chip.dimension, chip.value)}
            aria-label={`Remove ${chip.group} filter ${chip.label}`}
            className="ml-0.5 flex h-5 w-5 items-center justify-center rounded text-analytics-strong/70 transition-colors duration-150 hover:bg-analytics/10 hover:text-analytics-strong">
            
              <XIcon className="h-3.5 w-3.5" />
            </button>
          </span>
        </li>
      )}
    </ul>);

}