import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoryCount } from '../../types/dashboard';
import { CHART_COLORS } from '../../utils/constants';
import { EmptyState } from '../common/EmptyState';
import { ChartTooltip } from './ChartTooltip';

export function TimeOfDayChart({ data, height = 260 }: {data: CategoryCount[];height?: number;}) {
  if (!data.length) return <EmptyState compact title="No time-of-day data for the selected filters." />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: CHART_COLORS.ink }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} width={44} />
        <Tooltip cursor={{ fill: '#f1f4f9' }} content={<ChartTooltip />} />
        <Bar dataKey="count" name="Incidents" fill={CHART_COLORS.analytics} radius={[4, 4, 0, 0]} maxBarSize={56} animationDuration={300} />
      </BarChart>
    </ResponsiveContainer>);

}