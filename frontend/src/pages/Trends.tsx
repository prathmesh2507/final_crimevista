import React from 'react';
import { ArrowDownRightIcon, ArrowUpRightIcon } from 'lucide-react';
import { ChartCard } from '../components/charts/ChartCard';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { MultiSeriesTrendChart } from '../components/charts/MultiSeriesTrendChart';
import { TimeOfDayChart } from '../components/charts/TimeOfDayChart';
import { DataBoundary } from '../components/common/DataBoundary';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { FilterPanel } from '../components/filters/FilterPanel';
import { useFilters } from '../hooks/useFilters';
import { useTrends } from '../hooks/useTrends';
import type { PeriodComparison } from '../types/analytics';
import { cn } from '../utils/cn';
import { severityColor } from '../utils/colors';
import { formatNumber, formatSignedPercent } from '../utils/formatters';

function ComparisonStrip({ comparison }: {comparison: PeriodComparison;}) {
  const up = (comparison.changePct ?? 0) > 0;
  return (
    <section aria-label="Period comparison" className="grid gap-px overflow-hidden rounded-xl border border-line bg-line shadow-card sm:grid-cols-3">
      <div className="bg-surface p-5">
        <p className="text-xs text-muted">Current period</p>
        <p className="mt-0.5 text-xs text-subtle">{comparison.currentLabel}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-fg">{formatNumber(comparison.current)}</p>
      </div>
      <div className="bg-surface p-5">
        <p className="text-xs text-muted">Previous period</p>
        <p className="mt-0.5 text-xs text-subtle">{comparison.previousLabel}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-muted">{formatNumber(comparison.previous)}</p>
      </div>
      <div className="bg-surface p-5">
        <p className="text-xs text-muted">Change</p>
        <p className={cn('mt-6 inline-flex items-center gap-1 text-3xl font-semibold tabular-nums', comparison.changePct === null ? 'text-muted' : up ? 'text-danger' : 'text-positive')}>
          {comparison.changePct !== null && (up ? <ArrowUpRightIcon className="h-6 w-6" aria-hidden /> : <ArrowDownRightIcon className="h-6 w-6" aria-hidden />)}
          {formatSignedPercent(comparison.changePct)}
        </p>
      </div>
    </section>);

}

export function Trends() {
  const { resetFilters } = useFilters();
  const { data, isLoading, isFetching, error, refetch } = useTrends();

  return (
    <div className="space-y-5">
      <PageHeader title="Trends" description="How incident patterns change over time for the selected filters." />
      <FilterPanel isFetching={isFetching} />
      <DataBoundary
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={() => refetch()}
        errorTitle="Unable to load trend data"
        skeleton={<LoadingSkeleton variant="page" />}
        recordCount={data?.recordCount}
        meta={data?.meta}
        onReset={resetFilters}>
        
        {data &&
        <>
            {data.comparison && <ComparisonStrip comparison={data.comparison} />}
            <ChartCard title="Monthly incident trend" description="Recorded incidents per month">
              <MonthlyTrendChart data={data.monthly} height={320} />
            </ChartCard>
            <div className="grid gap-5 lg:grid-cols-2">
              <ChartCard title="Crime type trends" description="Leading crime types by month">
                <MultiSeriesTrendChart series={data.byCrimeType} />
              </ChartCard>
              <ChartCard title="Severity trends" description="Monthly incidents stacked by severity">
                <MultiSeriesTrendChart series={data.bySeverity} stacked colorFor={(key) => severityColor(key)} />
              </ChartCard>
              <ChartCard title="Area trends" description="Leading areas by month">
                <MultiSeriesTrendChart series={data.byArea} />
              </ChartCard>
              <ChartCard title="Time-of-day distribution">
                <TimeOfDayChart data={data.timeOfDay} height={300} />
              </ChartCard>
            </div>
          </>
        }
      </DataBoundary>
    </div>);

}