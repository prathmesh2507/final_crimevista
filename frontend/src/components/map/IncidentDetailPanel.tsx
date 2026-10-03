import React from 'react';
import { MousePointerClickIcon, XIcon } from 'lucide-react';
import type { MapIncident } from '../../types/crime';
import { formatDate } from '../../utils/formatters';
import { SeverityBadge } from '../common/SeverityBadge';

interface IncidentDetailPanelProps {
  incident: MapIncident | null;
  onClose: () => void;
}

export function IncidentDetailPanel({ incident, onClose }: IncidentDetailPanelProps) {
  if (!incident) {
    return (
      <section className="rounded-xl border border-dashed border-line bg-surface p-5 text-center">
        <MousePointerClickIcon className="mx-auto h-5 w-5 text-subtle" aria-hidden />
        <p className="mt-2 text-sm font-medium text-fg">Select an incident</p>
        <p className="mt-0.5 text-xs text-muted">Click a marker to see its details. Click a cluster to zoom in.</p>
      </section>);

  }

  const rows: Array<[string, React.ReactNode]> = [
  ['Area', incident.area],
  ['Date', formatDate(incident.occurredOn)],
  ['Severity', <SeverityBadge key="s" severity={incident.severity} />],
  ['Coordinates', <span key="c" className="font-mono text-xs">{incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}</span>]];


  return (
    <section aria-live="polite" className="rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted">{incident.id}</p>
          <h2 className="mt-1 text-lg font-semibold text-fg">{incident.crimeType}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Clear selection" className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-canvas">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      <dl className="mt-4 divide-y divide-line text-sm">
        {rows.map(([label, value]) =>
        <div key={label} className="flex items-center justify-between gap-3 py-2.5">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right text-fg">{value}</dd>
          </div>
        )}
      </dl>
      {incident.description && <p className="mt-3 rounded-lg bg-canvas p-3 text-sm text-fg">{incident.description}</p>}
    </section>);

}