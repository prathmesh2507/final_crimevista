import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOffIcon } from 'lucide-react';
import { AreaBarChart } from '../components/charts/AreaBarChart';
import { ChartCard } from '../components/charts/ChartCard';
import { SeverityChart } from '../components/charts/SeverityChart';
import { DataBoundary } from '../components/common/DataBoundary';
import { DataTable, type Column } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { ToneBadge } from '../components/common/ToneBadge';
import { FilterPanel } from '../components/filters/FilterPanel';
import { HotspotCard } from '../components/hotspots/HotspotCard';
import { MapView, type MapPoint } from '../components/map/MapView';
import { useFilters } from '../hooks/useFilters';
import { useHotspots } from '../hooks/useHotspots';
import type { Hotspot } from '../types/analytics';
import { riskTone } from '../utils/colors';
import { CHART_COLORS } from '../utils/constants';
import { formatNumber, formatPercent } from '../utils/formatters';

const COLUMNS: Column<Hotspot>[] = [
{ key: 'rank', header: 'Rank', render: (h) => <span className="tabular-nums text-muted">{h.rank}</span> },
{ key: 'area', header: 'Area', render: (h) => <span className="font-medium">{h.area}</span> },
{ key: 'count', header: 'Incidents', align: 'right', render: (h) => formatNumber(h.incidentCount) },
{ key: 'share', header: 'Share', align: 'right', render: (h) => formatPercent(h.sharePct) },
{ key: 'density', header: 'Density / km²', align: 'right', render: (h) => h.densityPerSqKm !== null ? formatNumber(h.densityPerSqKm) : '—' },
{ key: 'high', header: 'High severity', align: 'right', render: (h) => formatNumber(h.highSeverityCount) },
{ key: 'type', header: 'Dominant type', render: (h) => h.dominantCrimeType ?? '—' },
{ key: 'risk', header: 'Risk', render: (h) => h.riskLevel ? <ToneBadge tone={riskTone(h.riskLevel)}>{h.riskLevel}</ToneBadge> : '—' }];


export function Hotspots() {
  const navigate = useNavigate();
  const { resetFilters } = useFilters();
  const { data, isLoading, isFetching, error, refetch } = useHotspots();
  const hotspots = data?.hotspots ?? [];

  const points = useMemo<MapPoint[]>(() => {
    const located = hotspots.filter((h) => h.latitude !== null && h.longitude !== null);
    const max = Math.max(1, ...located.map((h) => h.incidentCount));
    return located.map((h) => ({
      id: h.area,
      lat: h.latitude as number,
      lng: h.longitude as number,
      color: h.rank <= 3 ? CHART_COLORS.alert : CHART_COLORS.analytics,
      radius: 7 + 17 * Math.sqrt(h.incidentCount / max),
      label: `#${h.rank} ${h.area} · ${formatNumber(h.incidentCount)} incidents`
    }));
  }, [hotspots]);

  const openArea = (area: string) => navigate(`/areas?area=${encodeURIComponent(area)}`);

  return (
    <div className="space-y-5">
      <PageHeader title="Hotspots" description="Areas with the highest concentration of recorded incidents, ranked by the analytics service." />
      <FilterPanel isFetching={isFetching} />
      <DataBoundary
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        onRetry={() => refetch()}
        errorTitle="Unable to load hotspot data"
        skeleton={<LoadingSkeleton variant="page" />}
        recordCount={data?.recordCount}
        meta={data?.meta}
        onReset={resetFilters}>
        
        {data && (
        hotspots.length ?
        <>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section className="rounded-xl border border-line bg-surface p-3 shadow-card">
                  <h2 className="px-2 pb-3 pt-1 text-sm font-semibold text-fg">Incident concentration</h2>
                  {points.length ?
              <MapView
                ariaLabel="Hotspot map"
                points={points}
                hotspots={hotspots}
                onSelect={openArea}
                maxFitZoom={13}
                showExperienceControls
                className="h-[380px] lg:h-[480px]" /> :

              <EmptyState compact icon={MapPinOffIcon} title="Location data unavailable." description="The backend returned hotspots without coordinates." />
              }
                </section>
                <div className="space-y-3">
                  {hotspots.slice(0, 3).map((h, i) =>
              <HotspotCard key={h.area} hotspot={h} primary={i === 0} onOpen={openArea} />
              )}
                </div>
              </div>

              <section aria-labelledby="ranking-heading" className="space-y-3">
                <h2 id="ranking-heading" className="text-base font-semibold text-fg">
                  Area ranking
                </h2>
                <DataTable caption="Hotspot ranking" columns={COLUMNS} rows={hotspots} rowKey={(h) => h.area} onRowClick={(h) => openArea(h.area)} />
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <ChartCard title="Crime category breakdown" description="Across the filtered records">
                  <AreaBarChart data={data.crimeTypeBreakdown} limit={10} />
                </ChartCard>
                <ChartCard title="Severity breakdown">
                  <SeverityChart data={data.severityBreakdown} />
                </ChartCard>
              </div>
            </> :

        <EmptyState title="No hotspots returned for the selected filters." action={{ label: 'Reset filters', onClick: resetFilters }} />)
        }
      </DataBoundary>
    </div>);

}