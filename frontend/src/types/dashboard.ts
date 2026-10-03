import type { DataSourceMeta, RecordCount } from './api';

export type TrendDirection = 'up' | 'down' | 'flat';
export type KPITone = 'neutral' | 'alert' | 'analytics' | 'positive';

export interface KPI {
  id: string;
  label: string;
  value: string | number;
  unit: string | null;
  context: string | null;
  icon: string | null;
  tone: KPITone;
  trend: {
    direction: TrendDirection;
    value: string;
    /** Backend decides whether the movement is favourable. null = neutral. */
    isPositive: boolean | null;
  } | null;
}

export type InsightKind = 'increase' | 'decrease' | 'location' | 'category' | 'time' | 'severity' | 'info';

export interface Insight {
  id: string;
  text: string;
  kind: InsightKind;
}

export interface CategoryCount {
  label: string;
  count: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface DashboardCharts {
  crimeTypeDistribution: CategoryCount[];
  areaDistribution: CategoryCount[];
  monthlyTrend: TimeSeriesPoint[];
  severityDistribution: CategoryCount[];
  timeOfDayDistribution: CategoryCount[];
}

export interface DashboardOverview {
  recordCount: RecordCount;
  meta: DataSourceMeta;
  kpis: KPI[];
  insights: Insight[];
  charts: DashboardCharts;
}