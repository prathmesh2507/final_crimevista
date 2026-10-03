/**
 * EXPECTED BACKEND RESPONSE CONTRACTS
 * -----------------------------------
 * These describe the JSON the frontend expects from the existing CrimeVista backend.
 * Envelope keys are camelCase; aggregated rows use the snake_case column names produced
 * by the existing pandas analytics (crime_type, area, month_start, severity, time_period).
 * Adapters in api/adapters.ts convert these into UI types, so UI components never
 * depend on backend field names.
 */
import type { GeoJsonObject } from "geojson";
import type { KPITone, TrendDirection } from "../types/dashboard";
import type { ReportFormat, UploadStage } from "../types/operations";
import type { QueryParams } from "./params";

export interface RawEnvelope {
  recordCount: { filtered: number; total: number };
  demoMode: boolean;
  lastUpdated?: string | null;
}

export interface RawKpi {
  id: string;
  label: string;
  value: string | number;
  unit?: string | null;
  context?: string | null;
  icon?: string | null;
  tone?: KPITone | null;
  trend?: {
    direction: TrendDirection;
    value: string;
    is_positive?: boolean | null;
  } | null;
}

export type RawInsight = string | { text: string; category?: string | null };

export interface RawCrimeTypeRow {
  crime_type: string;
  count: number;
}
export interface RawAreaRow {
  area: string;
  count: number;
}
export interface RawMonthRow {
  month_start: string;
  count: number;
}
export interface RawSeverityRow {
  severity: string;
  count: number;
}
export interface RawTimePeriodRow {
  time_period: string;
  count: number;
}
export interface RawCrimeTypeTrendRow {
  month_start: string;
  crime_type: string;
  count: number;
}
export interface RawSeverityTrendRow {
  month_start: string;
  severity: string;
  count: number;
}
export interface RawAreaTrendRow {
  month_start: string;
  area: string;
  count: number;
}

/** GET /filters/options */
export interface RawFilterOptions {
  crimeTypes: string[];
  areas: string[];
  severities: string[];
  timePeriods: string[];
  dateRange: { min: string | null; max: string | null };
  additional?: Array<{ key: string; label: string; options: string[] }>;
}

/** GET /health */
export interface RawHealth {
  status: "ok" | "degraded" | "down";
  databaseReady: boolean;
  demoMode: boolean;
  lastUpdated?: string | null;
  version?: string | null;
}

/** GET /dashboard/overview */
export interface RawDashboardOverview extends RawEnvelope {
  kpis: RawKpi[];
  insights: RawInsight[];
  charts: {
    crimeTypeDistribution: RawCrimeTypeRow[];
    areaDistribution: RawAreaRow[];
    monthlyTrend: RawMonthRow[];
    severityDistribution: RawSeverityRow[];
    timeOfDayDistribution: RawTimePeriodRow[];
  };
}

export interface RawCrimeRecord {
  id: string | number;
  crime_type: string;
  area: string;
  severity: string;
  time_period: string;
  date: string;
  description?: string | null;
  status?: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** GET /crimes?page=&page_size= */
export interface RawCrimeRecordsPage {
  items: RawCrimeRecord[];
  page: number;
  pageSize: number;
  total: number;
}

/** GET /analytics/trends */
export interface RawTrends extends RawEnvelope {
  monthlyTrend: RawMonthRow[];
  crimeTypeTrend: RawCrimeTypeTrendRow[];
  severityTrend: RawSeverityTrendRow[];
  areaTrend: RawAreaTrendRow[];
  timeOfDayDistribution: RawTimePeriodRow[];
  comparison: {
    current_label: string;
    previous_label: string;
    current_count: number;
    previous_count: number;
    change_pct: number | null;
  } | null;
}

export interface RawHotspotRow {
  rank: number;
  area: string;
  incident_count: number;
  density_per_sq_km: number | null;
  share_pct: number | null;
  dominant_crime_type: string | null;
  high_severity_count: number | null;
  risk_level: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** GET /analytics/hotspots */
export interface RawHotspots extends RawEnvelope {
  hotspots: RawHotspotRow[];
  crimeTypeBreakdown: RawCrimeTypeRow[];
  severityBreakdown: RawSeverityRow[];
}

/** GET /analytics/areas/:area */
export interface RawAreaProfile extends RawEnvelope {
  area: string;
  totalIncidents: number;
  kpis: RawKpi[];
  crimeTypeDistribution: RawCrimeTypeRow[];
  severityDistribution: RawSeverityRow[];
  timeOfDayDistribution: RawTimePeriodRow[];
  monthlyTrend: RawMonthRow[];
  areaComparison: RawAreaRow[];
  location: { latitude: number; longitude: number } | null;
}

export interface RawMapIncident {
  id: string | number;
  crime_type: string;
  severity: string;
  area: string;
  date: string;
  description?: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** GET /map/incidents */
export interface RawCrimeMap extends RawEnvelope {
  locationAvailable: boolean;
  missingLocationCount: number;
  incidents: RawMapIncident[];
  boundaries?: Array<{ area: string; geometry: GeoJsonObject }>;
}

/** GET /upload/config */
export interface RawUploadConfig {
  acceptedExtensions: string[];
  maxFileSizeMb: number;
  requiredColumns: string[];
}

/** POST /upload and GET /upload/:id/status */
export interface RawUploadStatus {
  uploadId: string;
  fileName: string;
  stage: UploadStage;
  areas?: string[];
  detectedArea?: string | null;
  validRecords?: number | null;
  rowsReceived: number | null;
  rowsImported: number | null;
  rowsRejected: number | null;
  analysisStatus?: "pending" | "completed" | "failed";
  messages: string[];
  errors: string[];
}

/** POST /reports/generate request body */
export interface RawReportRequest {
  title: string;
  format: ReportFormat;
  sections: string[];
  filters: QueryParams;
}

/** POST /reports/generate and GET /reports items */
export interface RawReport {
  reportId: string;
  title: string;
  format: ReportFormat;
  status: "ready" | "processing" | "failed";
  createdAt: string;
  downloadUrl: string | null;
  preview: {
    summary: RawInsight[];
    recordCount: number;
    kpis: RawKpi[];
  } | null;
}
