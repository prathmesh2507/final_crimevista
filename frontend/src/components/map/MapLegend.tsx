import React from 'react';
import { severityColor } from '../../utils/colors';
import { formatNumber } from '../../utils/formatters';

interface MapLegendProps {
  severities: string[];
  shownCount: number;
  missingLocationCount: number;
  hasBoundaries: boolean;
}

export function MapLegend({ severities, shownCount, missingLocationCount, hasBoundaries }: MapLegendProps) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <h2 className="text-sm font-semibold text-fg">Legend</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {severities.map((s) =>
        <li key={s} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white shadow" style={{ backgroundColor: severityColor(s) }} aria-hidden />
            {s}
          </li>
        )}
        <li className="col-span-2 flex items-center gap-2 text-muted">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-analytics text-[9px] font-semibold text-white" aria-hidden>
            n
          </span>
          Grouped incidents
        </li>
      </ul>
      <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Plotted incidents</dt>
          <dd className="font-medium tabular-nums text-fg">{formatNumber(shownCount)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Without coordinates</dt>
          <dd className="font-medium tabular-nums text-fg">{formatNumber(missingLocationCount)}</dd>
        </div>
      </dl>
      {!hasBoundaries && <p className="mt-3 text-xs text-subtle">Area boundaries were not provided by the backend.</p>}
    </section>);

}