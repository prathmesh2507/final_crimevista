import React from 'react';
import type { TooltipProps } from 'recharts';
import { formatNumber } from '../../utils/formatters';

type ChartTooltipProps = TooltipProps<number, string> & {formatLabel?: (label: string) => string;};

export function ChartTooltip({ active, payload, label, formatLabel }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const heading = label !== undefined && label !== null && label !== '' ? formatLabel ? formatLabel(String(label)) : String(label) : null;
  return (
    <div className="min-w-[140px] rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      {heading && <p className="mb-1.5 font-semibold text-fg">{heading}</p>}
      <ul className="space-y-1">
        {payload.map((entry) => {
          const fill = (entry.payload as {fill?: string;} | undefined)?.fill;
          return (
            <li key={`${entry.name}-${entry.dataKey}`} className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color ?? fill }} aria-hidden />
              <span className="text-muted">{entry.name}</span>
              <span className="ml-auto pl-3 font-semibold tabular-nums text-fg">{formatNumber(Number(entry.value))}</span>
            </li>);

        })}
      </ul>
    </div>);

}