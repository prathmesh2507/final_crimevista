import type { DataSourceMeta, RecordCount } from './api';
import type { CategoryCount, KPI, TimeSeriesPoint } from './dashboard';

export interface MultiSeries {
  keys: string[];
  points: Array<{period: string;values: Record<string, number>;}>;
}

export interface PeriodComparison {
  currentLabel: string;
  previousLabel: string;
  current: number;
  previous: number;
  changePct: number | null;
}

export interface TrendsData {
  recordCount: RecordCount;
  meta: DataSourceMeta;
  monthly: TimeSeriesPoint[];
  byCrimeType: MultiSeries;
  bySeverity: MultiSeries;
  byArea: MultiSeries;
  timeOfDay: CategoryCount[];
  comparison: PeriodComparison | null;
}

export interface Hotspot {
  rank: number;
  area: string;
  incidentCount: number;
  densityPerSqKm: number | null;
  sharePct: number | null;
  dominantCrimeType: string | null;
  highSeverityCount: number | null;
  riskLevel: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface HotspotsData {
  recordCount: RecordCount;
  meta: DataSourceMeta;
  hotspots: Hotspot[];
  crimeTypeBreakdown: CategoryCount[];
  severityBreakdown: CategoryCount[];
}

export interface AreaProfile {
  area: string;
  recordCount: RecordCount;
  meta: DataSourceMeta;
  totalIncidents: number;
  kpis: KPI[];
  crimeTypes: CategoryCount[];
  severity: CategoryCount[];
  timeOfDay: CategoryCount[];
  monthly: TimeSeriesPoint[];
  comparison: CategoryCount[];
  location: {latitude: number;longitude: number;} | null;
}