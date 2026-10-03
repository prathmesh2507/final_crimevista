import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPinnedIcon, MapPinOffIcon } from 'lucide-react';
import { AreaBarChart } from '../components/charts/AreaBarChart';
import { ChartCard } from '../components/charts/ChartCard';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { SeverityChart } from '../components/charts/SeverityChart';
import { TimeOfDayChart } from '../components/charts/TimeOfDayChart';
import { DataBoundary } from '../components/common/DataBoundary';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { FilterPanel } from '../components/filters/FilterPanel';
import { MapView, type MapPoint } from '../components/map/MapView';
import { useAreaProfile } from '../hooks/useAreaProfile';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { useFilters } from '../hooks/useFilters';
import { CHART_COLORS } from '../utils/constants';
import { formatNumber } from '../utils/formatters';

export function AreaExplorer() {
  const [params, setParams] = useSearchParams();
  const area = params.get('area') ?? '';
  const { resetFilters } = useFilters();
  const optionsQuery = useFilterOptions();
  const { data, isLoading, isFetching, error, refetch } = useAreaProfile(area || null);

  const selectArea = (value: string) => setParams(value ? { area: value } : {}, { replace: true });

  const locationPoints = useMemo<MapPoint[]>(
    () => data?.location ? [{ id: data.area, lat: data.location.latitude, lng: data.location.longitude, color: CHART_COLORS.alert, radius: 12, label: data.area }] : [],
    [data]
  );

  const picker =
  <div className="w-full sm:w-72">
      <label htmlFor="area-select" className="sr-only">
        Select area
      </label>
      <select
      id="area-select"
      value={area}
      onChange={(e) => selectArea(e.target.value)}
      disabled={optionsQuery.isLoading}
      className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg hover:border-subtle focus:border-analytics focus:outline-none focus-visible:ring-2 focus-visible:ring-analytics">
      
        <option value="">{optionsQuery.isLoading ? 'Loading areas…' : 'Select an area'}</option>
        {optionsQuery.data?.areas.map((a) =>
      <option key={a} value={a}>
            {a}
          </option>
      )}
      </select>
    </div>;


  return (
    <div className="space-y-5">
      <PageHeader title="Area explorer" description="Profile a single area and compare it with the rest of the city." actions={picker} />
      <FilterPanel isFetching={isFetching} hiddenDimensions={['areas']} />

      {optionsQuery.isError && !area && <ErrorState error={optionsQuery.error} title="Unable to load the list of areas" onRetry={() => optionsQuery.refetch()} />}

      {!area ?
      <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
          <MapPinnedIcon className="mx-auto h-6 w-6 text-subtle" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-fg">Select an area to explore</p>
          <p className="mt-1 text-sm text-muted">Choose from the list above, or pick one below.</p>
          {optionsQuery.data && optionsQuery.data.areas.length > 0 &&
        <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
              {optionsQuery.data.areas.map((a) =>
          <li key={a}>
                  <button
              type="button"
              onClick={() => selectArea(a)}
              className="h-9 rounded-lg border border-line px-3 text-sm text-fg transition-colors duration-150 hover:border-analytics hover:text-analytics">
              
                    {a}
                  </button>
                </li>
          )}
            </ul>
        }
        </div> :

      <DataBoundary
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={() => refetch()}
        errorTitle={`Unable to load the profile for ${area}`}
        skeleton={<LoadingSkeleton variant="dashboard" />}
        recordCount={data?.recordCount}
        meta={data?.meta}
        onReset={resetFilters}>
        
          {data &&
        <>
              <section className="flex flex-col gap-4 rounded-xl bg-ink-900 p-6 text-white sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-ink-300">Area profile</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-tight">{data.area}</h2>
                </div>
                <div className="sm:text-right">
                  <p className="text-5xl font-semibold tabular-nums tracking-tight">{formatNumber(data.totalIncidents)}</p>
                  <p className="text-sm text-ink-300">incidents in the selected period</p>
                </div>
              </section>

              {data.kpis.length > 0 && <KPIGrid kpis={data.kpis} highlightFirst={false} />}

              <div className="grid gap-5 xl:grid-cols-3">
                <ChartCard className="xl:col-span-2" title="Monthly trend" description={`Incidents per month in ${data.area}`}>
                  <MonthlyTrendChart data={data.monthly} />
                </ChartCard>
                <ChartCard title="Severity">
                  <SeverityChart data={data.severity} />
                </ChartCard>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <ChartCard title="Crime categories">
                  <AreaBarChart data={data.crimeTypes} limit={10} />
                </ChartCard>
                <ChartCard title="Time of day">
                  <TimeOfDayChart data={data.timeOfDay} />
                </ChartCard>
                <ChartCard title="Area comparison" description={`${data.area} highlighted against the city's leading areas`}>
                  <AreaBarChart data={data.comparison} limit={11} highlight={data.area} />
                </ChartCard>
                <ChartCard title="Location">
                  {locationPoints.length ?
              <MapView ariaLabel={`Location of ${data.area}`} points={locationPoints} maxFitZoom={13} className="h-[320px]" /> :

              <EmptyState compact icon={MapPinOffIcon} title="Location data unavailable." />
              }
                </ChartCard>
              </div>
            </>
        }
        </DataBoundary>
      }
    </div>);

}