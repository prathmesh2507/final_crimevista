/** Filter state owned by the UI. Converted to query params in api/params.ts. */
export interface CrimeFilters {
  startDate: string | null;
  endDate: string | null;
  crimeTypes: string[];
  areas: string[];
  severities: string[];
  timePeriods: string[];
  /** Additional backend-defined dimensions, keyed by query-parameter name. */
  extra: Record<string, string[]>;
}

export type CoreFilterDimension = 'crimeTypes' | 'areas' | 'severities' | 'timePeriods';
export type FilterDimension = 'dateRange' | CoreFilterDimension | `extra:${string}`;

export interface AdditionalFilter {
  key: string;
  label: string;
  options: string[];
}

export interface FilterOptions {
  crimeTypes: string[];
  areas: string[];
  severities: string[];
  timePeriods: string[];
  dateRange: {min: string | null;max: string | null;};
  additional: AdditionalFilter[];
}

export interface RecordCount {
  filtered: number;
  total: number;
}

export interface DataSourceMeta {
  demoMode: boolean;
  lastUpdated: string | null;
}

export type ApiErrorKind =
'bad_request' |
'unauthorized' |
'forbidden' |
'not_found' |
'validation' |
'server' |
'network' |
'timeout' |
'cancelled' |
'unknown';

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface SystemHealth {
  status: 'ok' | 'degraded' | 'down';
  databaseReady: boolean;
  demoMode: boolean;
  lastUpdated: string | null;
  version: string | null;
}