/**
 * Single source of truth for every backend endpoint the frontend calls.
 * All paths are relative to API_BASE_URL.
 */
export const ENDPOINTS = {
  authLogin: "/auth/login",
  authLogout: "/auth/logout",
  authSession: "/auth/session",
  health: "/health",
  filterOptions: "/filters/options",
  dashboardOverview: "/dashboard/overview",
  crimes: "/crimes",
  trends: "/analytics/trends",
  hotspots: "/analytics/hotspots",
  areaProfile: (area: string) => `/analytics/areas/${encodeURIComponent(area)}`,
  crimeMap: "/map/incidents",
  uploadConfig: "/upload/config",
  upload: "/upload",
  uploadStatus: (uploadId: string) =>
    `/upload/${encodeURIComponent(uploadId)}/status`,
  reports: "/reports",
  generateReport: "/reports/generate",
} as const;

export interface EndpointSpec {
  method: "GET" | "POST";
  path: string;
  purpose: string;
  replaces: string;
  /** None of these are confirmed to exist on the backend yet. */
  status: "implemented";
}

export const ENDPOINT_REGISTRY: EndpointSpec[] = [
  {
    method: "POST",
    path: "/auth/login",
    purpose: "Create the administrator's secure browser session",
    replaces: "Administrator sign-in",
    status: "implemented",
  },
  {
    method: "POST",
    path: "/auth/logout",
    purpose: "End the administrator's browser session",
    replaces: "Administrator sign-out",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/auth/session",
    purpose: "Check the current administrator session",
    replaces: "Administrator session status",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/health",
    purpose: "Backend status and data source",
    replaces: "System health",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/filters/options",
    purpose: "Values available to the filter panel",
    replaces: "Filter options",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/dashboard/overview",
    purpose: "Record count, KPIs, insights and overview charts",
    replaces: "Dashboard analytics",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/crimes",
    purpose: "Paginated filtered crime records",
    replaces: "Crime records",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/analytics/trends",
    purpose: "Monthly, category, severity, area and time-of-day trends",
    replaces: "Trends analytics",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/analytics/hotspots",
    purpose: "Ranked high-incident areas with breakdowns",
    replaces: "Hotspots analytics",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/analytics/areas/:area",
    purpose: "Single-area profile and comparison",
    replaces: "Area Explorer analytics",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/map/incidents",
    purpose: "Geocoded incidents and optional area boundaries",
    replaces: "Crime Map data",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/upload/config",
    purpose: "Accepted file types, size limit, required columns",
    replaces: "Upload configuration",
    status: "implemented",
  },
  {
    method: "POST",
    path: "/upload",
    purpose: "CSV import",
    replaces: "Dataset upload",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/upload/:id/status",
    purpose: "CSV import status",
    replaces: "Dataset upload",
    status: "implemented",
  },
  {
    method: "POST",
    path: "/reports/generate",
    purpose: "Generate a report and return its download URL",
    replaces: "Report generation",
    status: "implemented",
  },
  {
    method: "GET",
    path: "/reports",
    purpose: "Previously generated reports",
    replaces: "Report history",
    status: "implemented",
  },
];
