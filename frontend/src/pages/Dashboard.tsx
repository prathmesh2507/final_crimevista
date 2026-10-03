import React from 'react';
import { AreaBarChart } from '../components/charts/AreaBarChart';
import { ChartCard } from '../components/charts/ChartCard';
import { CrimeTypeChart } from '../components/charts/CrimeTypeChart';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { SeverityChart } from '../components/charts/SeverityChart';
import { TimeOfDayChart } from '../components/charts/TimeOfDayChart';
import { DataBoundary } from '../components/common/DataBoundary';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { FilteredRecordsTable } from '../components/dashboard/FilteredRecordsTable';
import { InsightsPanel } from '../components/dashboard/InsightsPanel';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { FilterPanel } from '../components/filters/FilterPanel';
import { useDashboard } from '../hooks/useDashboard';
import { useFilters } from '../hooks/useFilters';

export function Dashboard() {
  const { resetFilters } = useFilters();
  const { data, isLoading, isFetching, error, refetch } = useDashboard();

  return (
    <div className="space-y-5">
      <PageHeader title="Executive overview" description="City-wide incident intelligence for the selected filters." />
      <FilterPanel isFetching={isFetching} />
      <DataBoundary
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={() => refetch()}
        errorTitle="Unable to load crime data"
        skeleton={<LoadingSkeleton variant="dashboard" />}
        recordCount={data?.recordCount}
        meta={data?.meta}
        onReset={resetFilters}>
        
        {data &&
        <>
            <KPIGrid kpis={data.kpis} />
            <div className="grid gap-5 xl:grid-cols-3">
              <ChartCard className="xl:col-span-2" title="Monthly incident trend" description="Recorded incidents per month">
                <MonthlyTrendChart data={data.charts.monthlyTrend} height={300} />
              </ChartCard>
              <InsightsPanel insights={data.insights} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <ChartCard title="Crime type distribution" description="Top 8 crime types">
                <CrimeTypeChart data={data.charts.crimeTypeDistribution} />
              </ChartCard>
              <ChartCard title="Top 10 areas by recorded incidents">
                <AreaBarChart data={data.charts.areaDistribution} limit={10} />
              </ChartCard>
              <ChartCard title="Severity distribution">
                <SeverityChart data={data.charts.severityDistribution} />
              </ChartCard>
              <ChartCard title="Time-of-day distribution">
                <TimeOfDayChart data={data.charts.timeOfDayDistribution} />
              </ChartCard>
            </div>
            <FilteredRecordsTable />
          </>
        }
      </DataBoundary>
    </div>);

}