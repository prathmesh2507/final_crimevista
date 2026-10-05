import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useHotspots } from '../hooks/useHotspots';
import { severityColor } from '../utils/colors';
import { formatNumber } from '../utils/formatters';

export function CrimeMap() {
  const navigate = useNavigate();
  const { resetFilters } = useFilters();
  const { data: options } = useFilterOptions();
  const { data, isLoading, isFetching, error, refetch } = useCrimeMap();
  const { data: hotspotData, error: hotspotError, refetch: refetchHotspots } = useHotspots();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
                  <span className="text-xs text-muted">Choose a 3D city view or heat intelligence layers on the map</span>
                </div>
                {hotspotError && (
                  <div role="alert" className="mx-2 mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-fg">
                    Area hotspot counts are unavailable, so 3D area columns may be missing.
                    <button type="button" onClick={() => refetchHotspots()} className="font-semibold text-analytics hover:underline">
                      Retry hotspot data
                    </button>
                  </div>
                )}
                <MapView
              ariaLabel="Crime incident map"
              points={points}
              boundaries={data.boundaries}
              hotspots={hotspotData?.hotspots}
              selectedId={selectedId}
              onSelect={(id, kind) => {
                if (kind === 'area') {
                  navigate(`/areas?area=${encodeURIComponent(id)}`);
                  return;
                }
                setSelectedId(id);
              }}
              showExperienceControls
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