import React from 'react';
import type { KPI } from '../../types/dashboard';
import { EmptyState } from '../common/EmptyState';
import { KPICard } from './KPICard';

interface KPIGridProps {
  kpis: KPI[];
  /** Emphasise the first KPI returned by the backend. */
  highlightFirst?: boolean;
}

export function KPIGrid({ kpis, highlightFirst = true }: KPIGridProps) {
  if (!kpis.length) return <EmptyState compact title="No indicators returned for this selection." />;
  return (
    <section aria-label="Key indicators" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {kpis.map((kpi, index) =>
      <KPICard key={kpi.id} kpi={kpi} primary={highlightFirst && index === 0} />
      )}
    </section>);

}