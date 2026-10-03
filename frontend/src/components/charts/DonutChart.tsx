import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryCount } from '../../types/dashboard';
import { formatNumber, shareOf } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { ChartTooltip } from './ChartTooltip';

interface DonutChartProps {
  data: CategoryCount[];
  colorFor: (label: string, index: number) => string;
  centerLabel: string;
}

export function DonutChart({ data, colorFor, centerLabel }: DonutChartProps) {
  if (!data.length) return <EmptyState compact title="No data for the selected filters." />;
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
      <div className="relative mx-auto h-[200px] w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="label" innerRadius="64%" outerRadius="100%" paddingAngle={1} stroke="#ffffff" strokeWidth={2} animationDuration={300}>
              {data.map((d, i) =>
              <Cell key={d.label} fill={colorFor(d.label, i)} />
              )}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-fg">{formatNumber(total)}</span>
          <span className="text-xs text-muted">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-2">
        {data.map((d, i) =>
        <li key={d.label} className="flex items-center gap-3 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colorFor(d.label, i) }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-fg">{d.label}</span>
            <span className="tabular-nums font-medium text-fg">{formatNumber(d.count)}</span>
            <span className="w-12 text-right tabular-nums text-muted">{shareOf(d.count, total)}</span>
          </li>
        )}
      </ul>
    </div>);

}