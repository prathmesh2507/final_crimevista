import type { CrimeFilters, Paginated } from '../types/api';
import type { CrimeRecord } from '../types/crime';
import { apiClient } from './client';
import type { RawCrimeRecordsPage } from './contracts';
import { ENDPOINTS } from './endpoints';
import { toQueryParams } from './params';

export const crimeApi = {
  /** GET /crimes — REQUIRES BACKEND IMPLEMENTATION. Replaces load_filtered_data(filters). */
  async getRecords(filters: CrimeFilters, page: number, pageSize: number, signal?: AbortSignal): Promise<Paginated<CrimeRecord>> {
    const { data } = await apiClient.get<RawCrimeRecordsPage>(ENDPOINTS.crimes, {
      params: toQueryParams(filters, { page, page_size: pageSize }),
      signal
    });
    return {
      page: data.page,
      pageSize: data.pageSize,
      total: data.total,
      items: (data.items ?? []).map((r) => ({
        id: String(r.id),
        crimeType: r.crime_type,
        area: r.area,
        severity: r.severity,
        timePeriod: r.time_period,
        occurredOn: r.date,
        description: r.description ?? null,
        status: r.status ?? null,
        latitude: r.latitude ?? null,
        longitude: r.longitude ?? null
      }))
    };
  }
};