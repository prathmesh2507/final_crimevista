import React, { useMemo, useState } from 'react';
import { MapPinOffIcon } from 'lucide-react';
import { DataBoundary } from '../components/common/DataBoundary';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { FilterPanel } from '../components/filters/FilterPanel';
import { IncidentDetailPanel } from '../components/map/IncidentDetailPanel';
import { MapLegend } from '../components/map/MapLegend';
import { MapView, type MapPoint } from '../components/map/MapView';
import { useCrimeMap } from '../hooks/useCrimeMap';
import { useFilterOptions } from '../hooks/useFilterOptions';
import { useFilters } from '../hooks/useFilters';
import { cn } from '../utils/cn';
import { severityColor } from '../utils/colors';
import { formatNumber } from '../utils/formatters';

export function CrimeMap() {
  const { resetFilters } = useFilters();
  const { data: options } = useFilterOptions();
  const { data, isLoading, isFetching, error, refetch } = useCrimeMap();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cluster, setCluster] = useState(true);

  const points = useMemo<MapPoint[]>(
    () =>
    (data?.incidents ?? []).map((i) => ({
      id: i.id,
      lat: i.latitude,
      lng: i.longitude,
      color: severityColor(i.severity),
      label: `${i.crimeType} · ${i.area}`
    })),
    [data]
  );
  const selected = data?.incidents.find((i) => i.id === selectedId) ?? null;
  const severities = options?.severities.length ? options.severities : Array.from(new Set(data?.incidents.map((i) => i.severity) ?? []));

  return (
    <div className="space-y-5">
      <PageHeader title="Crime map" description="Geocoded incidents supplied by the backend. Filter by type, severity and date." />
      <FilterPanel isFetching={isFetching} />
      <DataBoundary
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={() => refetch()}
        errorTitle="Unable to load map data"
        skeleton={<LoadingSkeleton variant="map" />}
        recordCount={data?.recordCount}
        meta={data?.meta}
        onReset={resetFilters}>
        
        {data && (
        data.locationAvailable ?
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-xl border border-line bg-surface p-3 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3 pt-1">
                  <h2 className="text-sm font-semibold text-fg">
                    {formatNumber(points.length)} incidents plotted
                  </h2>
                  <button
                type="button"
                role="switch"
                aria-checked={cluster}
                onClick={() => setCluster((c) => !c)}
                className="inline-flex items-center gap-2 text-sm text-muted">
                
                    <span className={cn('relative h-5 w-9 rounded-full transition-colors duration-150', cluster ? 'bg-analytics' : 'bg-line')}>
                      <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-150', cluster ? 'translate-x-[18px]' : 'translate-x-0.5')} />
                    </span>
                    Group nearby markers
                  </button>
                </div>
                <MapView
              ariaLabel="Crime incident map"
              points={points}
              boundaries={data.boundaries}
              cluster={cluster}
              selectedId={selectedId}
              onSelect={setSelectedId}
              className="h-[420px] sm:h-[520px] lg:h-[620px]" />
            
              </section>
              <aside className="space-y-5">
                <IncidentDetailPanel incident={selected} onClose={() => setSelectedId(null)} />
                <MapLegend
              severities={severities}
              shownCount={points.length}
              missingLocationCount={data.missingLocationCount}
              hasBoundaries={data.boundaries.length > 0} />
            
              </aside>
            </div> :

        <EmptyState
          icon={MapPinOffIcon}
          title="Location data unavailable."
          description="The backend did not return coordinates for the selected records, so they can't be placed on the map." />)

        }
      </DataBoundary>
    </div>);

}