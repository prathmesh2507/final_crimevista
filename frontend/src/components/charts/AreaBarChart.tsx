import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoryCount } from '../../types/dashboard';
import { CHART_COLORS } from '../../utils/constants';
import { EmptyState } from '../common/EmptyState';
import { ChartTooltip } from './ChartTooltip';

interface AreaBarChartProps {
  data: CategoryCount[];
  limit?: number;
  highlight?: string;
  seriesName?: string;
}

/** Horizontal ranked bars — used for areas and any other ranked category list. */
export function AreaBarChart({ data, limit = 10, highlight, seriesName = 'Incidents' }: AreaBarChartProps) {
  if (!data.length) return <EmptyState compact title="No data for the selected filters." />;
  const rows = data.slice(0, limit).map((d) => ({ ...d, name: seriesName }));
  const height = Math.max(200, rows.length * 32 + 16);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 44, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" width={112} tick={{ fontSize: 12, fill: CHART_COLORS.ink }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: '#f1f4f9' }} content={<ChartTooltip />} />
        <Bar dataKey="count" name={seriesName} radius={[0, 4, 4, 0]} barSize={16} animationDuration={300}>
          {rows.map((r) =>
          <Cell key={r.label} fill={highlight ? r.label === highlight ? CHART_COLORS.alert : CHART_COLORS.analyticsMuted : CHART_COLORS.analytics} />
          )}
          <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: CHART_COLORS.axis }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>);

}