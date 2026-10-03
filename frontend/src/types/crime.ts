import type { GeoJsonObject } from 'geojson';
import type { DataSourceMeta, RecordCount } from './api';

export interface CrimeRecord {
  id: string;
  crimeType: string;
  area: string;
  severity: string;
  timePeriod: string;
  occurredOn: string;
  description: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface MapIncident {
  id: string;
  crimeType: string;
  severity: string;
  area: string;
  occurredOn: string;
  description: string | null;
  latitude: number;
  longitude: number;
}

export interface AreaBoundary {
  area: string;
  geometry: GeoJsonObject;
}

export interface CrimeMapData {
  recordCount: RecordCount;
  meta: DataSourceMeta;
  incidents: MapIncident[];
  boundaries: AreaBoundary[];
  locationAvailable: boolean;
  missingLocationCount: number;
}