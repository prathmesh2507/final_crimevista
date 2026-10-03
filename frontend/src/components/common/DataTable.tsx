import React, { type ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatNumber } from '../../utils/formatters';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {label: string;onClick: () => void;};
  pagination?: {page: number;pageSize: number;total: number;onPageChange: (page: number) => void;};
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  loading = false,
  onRowClick,
  emptyTitle = 'No records found for the selected filters.',
  emptyDescription,
  emptyAction,
  pagination
}: DataTableProps<T>) {
  if (loading) return <LoadingSkeleton variant="table" rows={pagination?.pageSize ?? 6} />;
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;

  const pages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
  const from = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
  const to = pagination ? Math.min(pagination.total, pagination.page * pagination.pageSize) : rows.length;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line bg-canvas">
              {columns.map((col) =>
              <th
                key={col.key}
                scope="col"
                className={cn('whitespace-nowrap px-4 py-2.5 text-xs font-medium text-muted', col.align === 'right' ? 'text-right' : 'text-left')}>
                
                  {col.header}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) =>
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={cn(
                'border-b border-line last:border-0',
                onRowClick && 'cursor-pointer transition-colors duration-150 hover:bg-canvas focus-visible:bg-analytics-soft focus-visible:outline-none'
              )}>
              
                {columns.map((col) =>
              <td key={col.key} className={cn('px-4 py-3 text-fg', col.align === 'right' && 'text-right tabular-nums', col.className)}>
                    {col.render(row)}
                  </td>
              )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination &&
      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted">
          <p className="tabular-nums">
            {formatNumber(from)}–{formatNumber(to)} of {formatNumber(pagination.total)}
          </p>
          <div className="flex items-center gap-1">
            <button
            type="button"
            aria-label="Previous page"
            disabled={pagination.page <= 1}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-fg transition-colors duration-150 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40">
            
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="px-2 tabular-nums">
              {pagination.page} / {pages}
            </span>
            <button
            type="button"
            aria-label="Next page"
            disabled={pagination.page >= pages}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-fg transition-colors duration-150 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40">
            
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
    </div>);

}