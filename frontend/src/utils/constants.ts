import type { UploadConfig } from "../types/operations";

/** Hex values mirror tailwind.config.js tokens (charts and maps need raw colors). */
export const CHART_COLORS = {
  analytics: "#2456d6",
  analyticsMuted: "#b4c6f2",
  alert: "#c2410c",
  grid: "#e8ecf2",
  axis: "#6b7688",
  ink: "#0d1527",
};

export const CHART_PALETTE = [
  "#2456d6",
  "#0e7490",
  "#c2410c",
  "#7c3aed",
  "#0f766e",
  "#be185d",
  "#a16207",
  "#475569",
];

export const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#7f1d1d",
  High: "#dc2626",
  Medium: "#f59e0b",
  Low: "#16a34a",
};

export const FALLBACK_SEVERITY_COLOR = "#64748b";

/** Map viewport only — never used as incident data. */
export const MAP_DEFAULT_CENTER: [number, number] = [20, 0];
export const MAP_DEFAULT_ZOOM = 2;
export const MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
export const MAP_DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const MAP_ATTRIBUTION = "&copy; OpenStreetMap contributors &copy; CARTO";

export const DEFAULT_PAGE_SIZE = 10;

/** Used only if GET /upload/config fails. */
export const FALLBACK_UPLOAD_CONFIG: UploadConfig = {
  acceptedExtensions: [".csv", ".xlsx"],
  maxFileSizeMb: 25,
  requiredColumns: [],
};

/** Confirm supported formats and section keys with the backend report generator. */
export const REPORT_FORMATS = [
  { value: "pdf", label: "PDF" },
  { value: "xlsx", label: "Excel" },
  { value: "csv", label: "CSV" },
] as const;

export const REPORT_SECTIONS = [
  { value: "executive_summary", label: "Executive summary" },
  { value: "kpis", label: "Key indicators" },
  { value: "charts", label: "Distribution charts" },
  { value: "hotspots", label: "Hotspot ranking" },
  { value: "records", label: "Record listing" },
];

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
