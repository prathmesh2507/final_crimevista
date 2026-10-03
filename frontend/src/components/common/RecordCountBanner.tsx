import React from 'react';
import { LoaderCircleIcon, SearchXIcon } from 'lucide-react';
import type { RecordCount } from '../../types/api';
import { formatNumber } from '../../utils/formatters';

interface RecordCountBannerProps {
  recordCount: RecordCount;
  onReset: () => void;
  isFetching?: boolean;
}

export function RecordCountBanner({ recordCount, onReset, isFetching = false }: RecordCountBannerProps) {
  const { filtered, total } = recordCount;

  if (filtered === 0) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-xl border border-line bg-surface px-5 py-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-subtle">
            <SearchXIcon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-fg">No records match the current filters.</p>
            <p className="mt-0.5 text-sm text-muted">
              {formatNumber(total)} records exist in total. Broaden or reset the filters to see results.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 shrink-0 items-center rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics focus-visible:ring-offset-2">
          
          Reset filters
        </button>
      </div>);

  }

  const share = total ? Math.min(100, filtered / total * 100) : 0;
  return (
    <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
      <p>
        Showing <strong className="font-semibold tabular-nums text-fg">{formatNumber(filtered)}</strong> filtered records out of{' '}
        <strong className="font-semibold tabular-nums text-fg">{formatNumber(total)}</strong> total records
      </p>
      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-line" aria-hidden>
        <div className="h-full rounded-full bg-analytics" style={{ width: `${share}%` }} />
      </div>
      {isFetching &&
      <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Updating…
        </span>
      }
    </div>);

}