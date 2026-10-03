import React from "react";
import { ActivityIcon, ArrowDownRightIcon, ArrowUpRightIcon, ClockIcon, MapPinIcon, MinusIcon, ShieldAlertIcon, TagIcon, TrendingDownIcon, TrendingUpIcon, TriangleAlertIcon, BoxIcon } from "lucide-react";
import { KPI } from "../../types/dashboard";
import { cn } from "../../utils/cn";
import { formatValue } from "../../utils/formatters";
const ICONS: Record<string, BoxIcon> = {
  activity: ActivityIcon,
  'shield-alert': ShieldAlertIcon,
  'map-pin': MapPinIcon,
  tag: TagIcon,
  'trending-up': TrendingUpIcon,
  'trending-down': TrendingDownIcon,
  clock: ClockIcon,
  alert: TriangleAlertIcon
};
const TONE_ICON: Record<KPI['tone'], string> = {
  neutral: 'bg-canvas text-muted',
  alert: 'bg-alert-soft text-alert',
  analytics: 'bg-analytics-soft text-analytics',
  positive: 'bg-positive-soft text-positive'
};
export function KPICard({
  kpi,
  primary = false



}: {kpi: KPI;primary?: boolean;}) {
  const Icon = kpi.icon && ICONS[kpi.icon] || ActivityIcon;
  const isText = typeof kpi.value === 'string';
  const trend = kpi.trend;
  const TrendIcon = trend?.direction === 'up' ? ArrowUpRightIcon : trend?.direction === 'down' ? ArrowDownRightIcon : MinusIcon;
  const trendColor = trend?.isPositive === true ? primary ? 'text-emerald-300' : 'text-positive' : trend?.isPositive === false ? primary ? 'text-red-300' : 'text-danger' : primary ? 'text-ink-300' : 'text-muted';
  return <article className={cn('flex min-w-0 flex-col rounded-xl p-5', primary ? 'bg-ink-900 text-white sm:col-span-2' : 'border border-line bg-surface shadow-card')}>
      <div className="flex items-start justify-between gap-3">
        <h3 className={cn('text-sm font-medium', primary ? 'text-ink-300' : 'text-muted')}>{kpi.label}</h3>
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', primary ? 'bg-ink-700 text-white' : TONE_ICON[kpi.tone])}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      </div>
      <p title={isText ? String(kpi.value) : undefined} className={cn('mt-3 truncate font-semibold tabular-nums tracking-tight', primary ? 'text-5xl' : isText ? 'text-2xl' : 'text-3xl')}>
        {formatValue(kpi.value)}
        {kpi.unit && <span className={cn('ml-1 text-base font-medium', primary ? 'text-ink-300' : 'text-muted')}>{kpi.unit}</span>}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs">
        {trend && <span className={cn('inline-flex items-center gap-1 font-medium', trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" aria-hidden />
            {trend.value}
          </span>}
        {kpi.context && <span className={cn('truncate', primary ? 'text-ink-300' : 'text-muted')}>{kpi.context}</span>}
      </div>
    </article>;
}