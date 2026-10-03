import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TimeSeriesPoint } from '../../types/dashboard';
import { CHART_COLORS } from '../../utils/constants';
import { formatMonth, formatMonthShort } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { ChartTooltip } from './ChartTooltip';

export function MonthlyTrendChart({ data, height = 280 }: {data: TimeSeriesPoint[];height?: number;}) {
  if (!data.length) return <EmptyState compact title="No monthly data for the selected filters." />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis dataKey="date" tickFormatter={formatMonthShort} tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} minTickGap={20} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} width={44} />
        <Tooltip content={<ChartTooltip formatLabel={formatMonth} />} />
        <Area
          type="monotone"
          dataKey="count"
          name="Incidents"
          stroke={CHART_COLORS.analytics}
          strokeWidth={2}
          fill={CHART_COLORS.analytics}
          fillOpacity={0.08}
          dot={false}
          activeDot={{ r: 4 }}
          animationDuration={300} />
        
      </AreaChart>
    </ResponsiveContainer>);

}