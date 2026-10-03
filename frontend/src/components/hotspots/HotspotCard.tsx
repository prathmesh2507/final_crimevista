import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import type { Hotspot } from '../../types/analytics';
import { cn } from '../../utils/cn';
import { riskTone } from '../../utils/colors';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { ToneBadge } from '../common/ToneBadge';

interface HotspotCardProps {
  hotspot: Hotspot;
  primary?: boolean;
  onOpen: (area: string) => void;
}

export function HotspotCard({ hotspot, primary = false, onOpen }: HotspotCardProps) {
  const stats: Array<[string, string]> = [
  ['Share of incidents', formatPercent(hotspot.sharePct)],
  ['Density / km²', hotspot.densityPerSqKm !== null ? formatNumber(hotspot.densityPerSqKm) : '—'],
  ['High severity', formatNumber(hotspot.highSeverityCount)],
  ['Dominant type', hotspot.dominantCrimeType ?? '—']];


  return (
    <button
      type="button"
      onClick={() => onOpen(hotspot.area)}
      className={cn(
        'group w-full rounded-xl border text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics',
        primary ? 'border-ink-900 bg-ink-900 p-5 text-white hover:bg-ink-800' : 'border-line bg-surface p-4 shadow-card hover:border-subtle'
      )}>
      
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('text-xs font-medium', primary ? 'text-ink-300' : 'text-muted')}>Rank {hotspot.rank}</p>
          <h3 className={cn('mt-0.5 truncate font-semibold', primary ? 'text-xl' : 'text-base text-fg')}>{hotspot.area}</h3>
        </div>
        {hotspot.riskLevel && <ToneBadge tone={riskTone(hotspot.riskLevel)}>{hotspot.riskLevel}</ToneBadge>}
      </div>

      <p className={cn('mt-3 font-semibold tabular-nums tracking-tight', primary ? 'text-4xl' : 'text-2xl text-fg')}>
        {formatNumber(hotspot.incidentCount)}
        <span className={cn('ml-1.5 text-sm font-normal', primary ? 'text-ink-300' : 'text-muted')}>incidents</span>
      </p>

      {primary &&
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-ink-700 pt-4 text-sm">
          {stats.map(([label, value]) =>
        <div key={label} className="min-w-0">
              <dt className="text-xs text-ink-300">{label}</dt>
              <dd className="mt-0.5 truncate font-medium">{value}</dd>
            </div>
        )}
        </dl>
      }
      {!primary &&
      <p className="mt-1 truncate text-xs text-muted">
          {formatPercent(hotspot.sharePct)} of incidents · mostly {hotspot.dominantCrimeType ?? '—'}
        </p>
      }

      <span className={cn('mt-4 inline-flex items-center gap-1 text-sm font-medium', primary ? 'text-white' : 'text-analytics')}>
        Explore area
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
      </span>
    </button>);

}