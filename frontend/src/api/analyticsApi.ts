import type { CrimeFilters } from '../types/api';
import type { AreaProfile, HotspotsData, TrendsData } from '../types/analytics';
import { toCategoryCounts, toKpis, toMeta, toMultiSeries, toRecordCount, toTimeSeries } from './adapters';
import { apiClient } from './client';
import type { RawAreaProfile, RawHotspots, RawTrends } from './contracts';
import { ENDPOINTS } from './endpoints';
import { toQueryParams } from './params';

export const analyticsApi = {
  /** GET /analytics/trends — REQUIRES BACKEND IMPLEMENTATION. */
  async getTrends(filters: CrimeFilters, signal?: AbortSignal): Promise<TrendsData> {
    const { data } = await apiClient.get<RawTrends>(ENDPOINTS.trends, { params: toQueryParams(filters), signal });
    return {
      recordCount: toRecordCount(data),
      meta: toMeta(data),
      monthly: toTimeSeries(data.monthlyTrend, 'month_start'),
      byCrimeType: toMultiSeries(data.crimeTypeTrend, 'month_start', 'crime_type'),
      bySeverity: toMultiSeries(data.severityTrend, 'month_start', 'severity'),
      byArea: toMultiSeries(data.areaTrend, 'month_start', 'area'),
      timeOfDay: toCategoryCounts(data.timeOfDayDistribution, 'time_period'),
      comparison: data.comparison ?
      {
        currentLabel: data.comparison.current_label,
        previousLabel: data.comparison.previous_label,
        current: data.comparison.current_count,
        previous: data.comparison.previous_count,
        changePct: data.comparison.change_pct
      } :
      null
    };
  },

  /** GET /analytics/hotspots — REQUIRES BACKEND IMPLEMENTATION. */
  async getHotspots(filters: CrimeFilters, signal?: AbortSignal): Promise<HotspotsData> {
    const { data } = await apiClient.get<RawHotspots>(ENDPOINTS.hotspots, { params: toQueryParams(filters), signal });
    return {
      recordCount: toRecordCount(data),
      meta: toMeta(data),
      hotspots: (data.hotspots ?? []).map((h) => ({
        rank: h.rank,
        area: h.area,
        incidentCount: h.incident_count,
        densityPerSqKm: h.density_per_sq_km,
        sharePct: h.share_pct,
        dominantCrimeType: h.dominant_crime_type,
        highSeverityCount: h.high_severity_count,
        riskLevel: h.risk_level,
        latitude: h.latitude,
        longitude: h.longitude
      })),
      crimeTypeBreakdown: toCategoryCounts(data.crimeTypeBreakdown, 'crime_type'),
      severityBreakdown: toCategoryCounts(data.severityBreakdown, 'severity')
    };
  },

  /** GET /analytics/areas/:area — REQUIRES BACKEND IMPLEMENTATION. The area filter is replaced by the path. */
  async getAreaProfile(area: string, filters: CrimeFilters, signal?: AbortSignal): Promise<AreaProfile> {
    const { data } = await apiClient.get<RawAreaProfile>(ENDPOINTS.areaProfile(area), {
      params: toQueryParams({ ...filters, areas: [] }),
      signal
    });
    return {
      area: data.area,
      recordCount: toRecordCount(data),
      meta: toMeta(data),
      totalIncidents: data.totalIncidents,
      kpis: toKpis(data.kpis),
      crimeTypes: toCategoryCounts(data.crimeTypeDistribution, 'crime_type'),
      severity: toCategoryCounts(data.severityDistribution, 'severity'),
      timeOfDay: toCategoryCounts(data.timeOfDayDistribution, 'time_period'),
      monthly: toTimeSeries(data.monthlyTrend, 'month_start'),
      comparison: toCategoryCounts(data.areaComparison, 'area'),
      location: data.location ?? null
    };
  }
};