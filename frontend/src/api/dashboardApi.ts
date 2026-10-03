import type { CrimeFilters, FilterOptions, SystemHealth } from '../types/api';
import type { DashboardOverview } from '../types/dashboard';
import { toCategoryCounts, toInsights, toKpis, toMeta, toRecordCount, toTimeSeries } from './adapters';
import { apiClient } from './client';
import type { RawDashboardOverview, RawFilterOptions, RawHealth } from './contracts';
import { ENDPOINTS } from './endpoints';
import { toQueryParams } from './params';

export const dashboardApi = {
  /**
   * GET /dashboard/overview — REQUIRES BACKEND IMPLEMENTATION.
   * Replaces: load_filtered_data, total_record_count, is_using_demo_data,
   * get_kpis, get_insights and the analytics.descriptive distributions.
   */
  async getOverview(filters: CrimeFilters, signal?: AbortSignal): Promise<DashboardOverview> {
    const { data } = await apiClient.get<RawDashboardOverview>(ENDPOINTS.dashboardOverview, {
      params: toQueryParams(filters),
      signal
    });
    return {
      recordCount: toRecordCount(data),
      meta: toMeta(data),
      kpis: toKpis(data.kpis),
      insights: toInsights(data.insights),
      charts: {
        crimeTypeDistribution: toCategoryCounts(data.charts?.crimeTypeDistribution, 'crime_type'),
        areaDistribution: toCategoryCounts(data.charts?.areaDistribution, 'area'),
        monthlyTrend: toTimeSeries(data.charts?.monthlyTrend, 'month_start'),
        severityDistribution: toCategoryCounts(data.charts?.severityDistribution, 'severity'),
        timeOfDayDistribution: toCategoryCounts(data.charts?.timeOfDayDistribution, 'time_period')
      }
    };
  },

  /** GET /filters/options — REQUIRES BACKEND IMPLEMENTATION. */
  async getFilterOptions(signal?: AbortSignal): Promise<FilterOptions> {
    const { data } = await apiClient.get<RawFilterOptions>(ENDPOINTS.filterOptions, { signal });
    return {
      crimeTypes: data.crimeTypes ?? [],
      areas: data.areas ?? [],
      severities: data.severities ?? [],
      timePeriods: data.timePeriods ?? [],
      dateRange: { min: data.dateRange?.min ?? null, max: data.dateRange?.max ?? null },
      additional: data.additional ?? []
    };
  },

  /** GET /health — REQUIRES BACKEND IMPLEMENTATION. */
  async getHealth(signal?: AbortSignal): Promise<SystemHealth> {
    const { data } = await apiClient.get<RawHealth>(ENDPOINTS.health, { signal });
    return {
      status: data.status,
      databaseReady: Boolean(data.databaseReady),
      demoMode: Boolean(data.demoMode),
      lastUpdated: data.lastUpdated ?? null,
      version: data.version ?? null
    };
  }
};