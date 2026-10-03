import React from 'react';
import { cn } from '../../utils/cn';

type Variant = 'kpi' | 'chart' | 'table' | 'map' | 'dashboard' | 'page';

interface LoadingSkeletonProps {
  variant: Variant;
  rows?: number;
  className?: string;
}

function Bar({ className }: {className?: string;}) {
  return <div className={cn('animate-pulse rounded-md bg-line/80', className)} />;
}

function ChartBlock({ className }: {className?: string;}) {
  return (
    <div className={cn('rounded-xl border border-line bg-surface p-5 shadow-card', className)}>
      <Bar className="h-4 w-40" />
      <Bar className="mt-2 h-3 w-24" />
      <Bar className="mt-6 h-[240px] w-full" />
    </div>);

}

function KpiBlock() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <div className="h-[148px] animate-pulse rounded-xl bg-ink-800/90 sm:col-span-2" />
      {[0, 1, 2, 3].map((i) =>
      <div key={i} className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <Bar className="h-3 w-24" />
          <Bar className="mt-5 h-7 w-20" />
          <Bar className="mt-4 h-3 w-28" />
        </div>
      )}
    </div>);

}

function TableBlock({ rows }: {rows: number;}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="border-b border-line bg-canvas px-4 py-3">
        <Bar className="h-3 w-1/3" />
      </div>
      {Array.from({ length: rows }).map((_, i) =>
      <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-0">
          <Bar className="h-3 w-24" />
          <Bar className="h-3 flex-1" />
          <Bar className="h-3 w-16" />
        </div>
      )}
    </div>);

}

export function LoadingSkeleton({ variant, rows = 6, className }: LoadingSkeletonProps) {
  return (
    <div className={className} role="status" aria-live="polite" aria-label="Loading">
      {variant === 'kpi' && <KpiBlock />}
      {variant === 'chart' && <ChartBlock />}
      {variant === 'table' && <TableBlock rows={rows} />}
      {variant === 'map' &&
      <div className="flex h-[520px] animate-pulse items-center justify-center rounded-xl border border-line bg-line/50">
          <span className="text-sm text-muted">Loading map data…</span>
        </div>
      }
      {variant === 'dashboard' &&
      <div className="space-y-5">
          <Bar className="h-4 w-80" />
          <KpiBlock />
          <div className="grid gap-5 xl:grid-cols-3">
            <ChartBlock className="xl:col-span-2" />
            <ChartBlock />
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartBlock />
            <ChartBlock />
          </div>
        </div>
      }
      {variant === 'page' &&
      <div className="space-y-5">
          <Bar className="h-4 w-80" />
          <ChartBlock />
          <div className="grid gap-5 lg:grid-cols-2">
            <ChartBlock />
            <ChartBlock />
          </div>
        </div>
      }
      <span className="sr-only">Loading…</span>
    </div>);

}