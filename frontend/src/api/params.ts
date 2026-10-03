import type { CrimeFilters } from '../types/api';

export type QueryParams = Record<string, string | number>;

/**
 * Converts UI filter state into backend query parameters.
 * Multi-value filters are comma-separated, e.g. crime_type=Theft,Burglary
 */
export function toQueryParams(filters: CrimeFilters, extra: QueryParams = {}): QueryParams {
  const params: QueryParams = {};
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;
  if (filters.crimeTypes.length) params.crime_type = filters.crimeTypes.join(',');
  if (filters.areas.length) params.area = filters.areas.join(',');
  if (filters.severities.length) params.severity = filters.severities.join(',');
  if (filters.timePeriods.length) params.time_period = filters.timePeriods.join(',');
  Object.entries(filters.extra).forEach(([key, values]) => {
    if (values.length) params[key] = values.join(',');
  });
  return { ...params, ...extra };
}