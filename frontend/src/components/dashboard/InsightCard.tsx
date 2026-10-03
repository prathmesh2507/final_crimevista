import React from "react";
import { ClockIcon, LightbulbIcon, MapPinIcon, ShieldAlertIcon, TagIcon, TrendingDownIcon, TrendingUpIcon, BoxIcon } from "lucide-react";
import { Insight, InsightKind } from "../../types/dashboard";
import { cn } from "../../utils/cn";
const KIND_STYLES: Record<InsightKind, {
  icon: BoxIcon;
  className: string;
}> = {
  increase: {
    icon: TrendingUpIcon,
    className: 'bg-alert-soft text-alert'
  },
  decrease: {
    icon: TrendingDownIcon,
    className: 'bg-analytics-soft text-analytics'
  },
  location: {
    icon: MapPinIcon,
    className: 'bg-analytics-soft text-analytics'
  },
  category: {
    icon: TagIcon,
    className: 'bg-canvas text-muted'
  },
  time: {
    icon: ClockIcon,
    className: 'bg-canvas text-muted'
  },
  severity: {
    icon: ShieldAlertIcon,
    className: 'bg-danger-soft text-danger'
  },
  info: {
    icon: LightbulbIcon,
    className: 'bg-canvas text-muted'
  }
};
export function InsightCard({
  insight


}: {insight: Insight;}) {
  const {
    icon: Icon,
    className
  } = KIND_STYLES[insight.kind];
  return <li className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', className)}>
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <p className="text-sm leading-relaxed text-fg">{insight.text}</p>
    </li>;
}