import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MultiSeries } from '../../types/analytics';
import { paletteColor } from '../../utils/colors';
import { CHART_COLORS } from '../../utils/constants';
import { formatMonth, formatMonthShort } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { ChartTooltip } from './ChartTooltip';

interface MultiSeriesTrendChartProps {
  series: MultiSeries;
  stacked?: boolean;
  colorFor?: (key: string, index: number) => string;
  height?: number;
}

export function MultiSeriesTrendChart({ series, stacked = false, colorFor = (_, i) => paletteColor(i), height = 300 }: MultiSeriesTrendChartProps) {
  const rows = useMemo(() => series.points.map((p) => ({ period: p.period, ...p.values })), [series]);
  if (!rows.length || !series.keys.length) return <EmptyState compact title="No trend data for the selected filters." />;

  const axes =
  <>
      <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
      <XAxis dataKey="period" tickFormatter={formatMonthShort} tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} minTickGap={20} />
      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART_COLORS.axis }} axisLine={false} tickLine={false} width={44} />
      <Tooltip content={<ChartTooltip formatLabel={formatMonth} />} />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
    </>;


  return (
    <ResponsiveContainer width="100%" height={height}>
      {stacked ?
      <AreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          {axes}
          {series.keys.map((key, i) =>
        <Area key={key} type="monotone" dataKey={key} name={key} stackId="1" stroke={colorFor(key, i)} fill={colorFor(key, i)} fillOpacity={0.55} animationDuration={300} />
        )}
        </AreaChart> :

      <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          {axes}
          {series.keys.map((key, i) =>
        <Line key={key} type="monotone" dataKey={key} name={key} stroke={colorFor(key, i)} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls animationDuration={300} />
        )}
        </LineChart>
      }
    </ResponsiveContainer>);

}