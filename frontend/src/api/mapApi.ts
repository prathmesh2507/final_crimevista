import type { CrimeFilters } from '../types/api';
import type { CrimeMapData, MapIncident } from '../types/crime';
import { toMeta, toRecordCount } from './adapters';
import { apiClient } from './client';
import type { RawCrimeMap } from './contracts';
import { ENDPOINTS } from './endpoints';
import { toQueryParams } from './params';

export const mapApi = {
  /**
   * GET /map/incidents — REQUIRES BACKEND IMPLEMENTATION.
   * Coordinates always come from the backend. Incidents without coordinates are
   * counted, never placed.
   */
  async getCrimeMap(filters: CrimeFilters, signal?: AbortSignal): Promise<CrimeMapData> {
    const { data } = await apiClient.get<RawCrimeMap>(ENDPOINTS.crimeMap, { params: toQueryParams(filters), signal });
    const incidents: MapIncident[] = [];
    let skipped = 0;
    (data.incidents ?? []).forEach((i) => {
      if (typeof i.latitude !== 'number' || typeof i.longitude !== 'number') {
        skipped += 1;
        return;
      }
      incidents.push({
        id: String(i.id),
        crimeType: i.crime_type,
        severity: i.severity,
        area: i.area,
        occurredOn: i.date,
        description: i.description ?? null,
        latitude: i.latitude,
        longitude: i.longitude
      });
    });
    return {
      recordCount: toRecordCount(data),
      meta: toMeta(data),
      incidents,
      boundaries: data.boundaries ?? [],
      locationAvailable: Boolean(data.locationAvailable) && incidents.length > 0,
      missingLocationCount: Number(data.missingLocationCount ?? 0) + skipped
    };
  }
};