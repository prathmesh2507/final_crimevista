import type { DataSourceMeta, RecordCount } from '../types/api';
import type { MultiSeries } from '../types/analytics';
import type { CategoryCount, Insight, InsightKind, KPI, TimeSeriesPoint } from '../types/dashboard';
import { inferInsightKind } from '../utils/formatters';
import type { RawEnvelope, RawInsight, RawKpi } from './contracts';

type Row = Record<string, unknown>;

const INSIGHT_KINDS: InsightKind[] = ['increase', 'decrease', 'location', 'category', 'time', 'severity', 'info'];

export function toMeta(raw: RawEnvelope): DataSourceMeta {
  return { demoMode: Boolean(raw.demoMode), lastUpdated: raw.lastUpdated ?? null };
}

export function toRecordCount(raw: RawEnvelope): RecordCount {
  return { filtered: Number(raw.recordCount?.filtered ?? 0), total: Number(raw.recordCount?.total ?? 0) };
}

export function toCategoryCounts<T extends object>(rows: T[] | null | undefined, labelKey: keyof T): CategoryCount[] {
  return (rows ?? []).map((r) => {
    const row = r as Row;
    return { label: String(row[labelKey as string] ?? 'Unknown'), count: Number(row.count ?? 0) };
  });
}

export function toTimeSeries<T extends object>(rows: T[] | null | undefined, dateKey: keyof T): TimeSeriesPoint[] {
  return (rows ?? []).map((r) => {
    const row = r as Row;
    return { date: String(row[dateKey as string]), count: Number(row.count ?? 0) };
  });
}

/** Reshapes long-format rows (period, series, count) into chart-ready series. No aggregation. */
export function toMultiSeries<T extends object>(
rows: T[] | null | undefined,
dateKey: keyof T,
seriesKey: keyof T)
: MultiSeries {
  const keys: string[] = [];
  const buckets = new Map<string, Record<string, number>>();
  (rows ?? []).forEach((r) => {
    const row = r as Row;
    const period = String(row[dateKey as string]);
    const series = String(row[seriesKey as string]);
    if (!keys.includes(series)) keys.push(series);
    const bucket = buckets.get(period) ?? {};
    bucket[series] = Number(row.count ?? 0);
    buckets.set(period, bucket);
  });
  const points = [...buckets.entries()].
  sort(([a], [b]) => a.localeCompare(b)).
  map(([period, values]) => ({ period, values }));
  return { keys, points };
}

export function toKpis(raw: RawKpi[] | null | undefined): KPI[] {
  return (raw ?? []).map((k) => ({
    id: k.id,
    label: k.label,
    value: k.value,
    unit: k.unit ?? null,
    context: k.context ?? null,
    icon: k.icon ?? null,
    tone: k.tone ?? 'neutral',
    trend: k.trend ? { direction: k.trend.direction, value: k.trend.value, isPositive: k.trend.is_positive ?? null } : null
  }));
}

export function toInsights(raw: RawInsight[] | null | undefined): Insight[] {
  return (raw ?? []).map((item, index) => {
    const text = typeof item === 'string' ? item : item.text;
    const category = typeof item === 'string' ? null : item.category ?? null;
    const kind = category && INSIGHT_KINDS.includes(category as InsightKind) ? category as InsightKind : inferInsightKind(text);
    return { id: `insight-${index}`, text, kind };
  });
}