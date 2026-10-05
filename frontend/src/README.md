# CrimeVista — Frontend

Global Crime Intelligence & Urban Safety Analytics Platform. React + TypeScript + Tailwind + TanStack Query + Recharts + Google Maps JavaScript API.

```
EXISTING BACKEND → REST API → api/ (service layer) → hooks/ (React Query) → components/ → charts / map / tables
```

The backend owns filtering, analytics, KPIs, insights, map data, uploads and report generation. The frontend only requests, displays and visualises.

## Status — read first

The frontend connects directly to the CrimeVista FastAPI backend. API failures are displayed by the UI; there is no mock-data fallback.

## Run locally

```bash
npm install
cp .env.example .env     # set VITE_API_BASE_URL
npm run dev
```

(When exporting from Magic Patterns, place these files under `src/` in a standard Vite React-TS project — `index.tsx` is the entry, i.e. `main.tsx`.)

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Backend base URL |
| `VITE_API_TIMEOUT_MS` | `30000` | Request timeout |

## Connecting your backend

1. Start the FastAPI service in `../backend`.
2. Enable CORS for the frontend origin (e.g. `http://localhost:5173`).
3. Set `VITE_API_BASE_URL=http://localhost:8000/api` in the project-root `.env` file.
4. Open **Settings → Test connection** to verify `/health`.

## Filters → query parameters

| UI | Query param | Example |
| --- | --- | --- |
| startDate / endDate | `start_date`, `end_date` | `2026-01-01` |
| crimeTypes | `crime_type` | `Theft,Burglary` |
| areas | `area` | `Sitabuldi` |
| severities | `severity` | `High,Critical` |
| timePeriods | `time_period` | `Night` |
| additional (backend-defined) | its `key` | comma-separated |

## Endpoint contracts (full TS types in `api/contracts.ts`)

Envelope used by analytics endpoints: `{ recordCount: { filtered, total }, demoMode, lastUpdated }`.

| Method | Path | Replaces | Response |
| --- | --- | --- | --- |
| GET | `/health` | `ensure_database_ready`, `is_using_demo_data` | `{ status, databaseReady, demoMode, lastUpdated, version }` |
| GET | `/filters/options` | `components.filters` | `{ crimeTypes[], areas[], severities[], timePeriods[], dateRange:{min,max}, additional?[] }` |
| GET | `/dashboard/overview` | `load_filtered_data`, `total_record_count`, `get_kpis`, `get_insights`, descriptive charts | envelope + `kpis[]`, `insights[]`, `charts:{ crimeTypeDistribution[{crime_type,count}], areaDistribution[{area,count}], monthlyTrend[{month_start,count}], severityDistribution[{severity,count}], timeOfDayDistribution[{time_period,count}] }` |
| GET | `/crimes?page&page_size` | `load_filtered_data` | `{ items[{id,crime_type,area,severity,time_period,date,description,status,latitude,longitude}], page, pageSize, total }` |
| GET | `/analytics/trends` | `monthly_trend` + related | envelope + `monthlyTrend`, `crimeTypeTrend[{month_start,crime_type,count}]`, `severityTrend`, `areaTrend`, `timeOfDayDistribution`, `comparison | null` |
| GET | `/analytics/hotspots` | Hotspots page | envelope + `hotspots[{rank,area,incident_count,density_per_sq_km,share_pct,dominant_crime_type,high_severity_count,risk_level,latitude,longitude}]`, `crimeTypeBreakdown`, `severityBreakdown` |
| GET | `/analytics/areas/:area` | Area Explorer | envelope + `area, totalIncidents, kpis, crimeTypeDistribution, severityDistribution, timeOfDayDistribution, monthlyTrend, areaComparison[{area,count}], location | null` |
| GET | `/map/incidents` | Crime Map | envelope + `locationAvailable, missingLocationCount, incidents[{id,crime_type,severity,area,date,description,latitude,longitude}], boundaries?[{area, geometry(GeoJSON)}]` |
| GET | `/upload/config` | — | `{ acceptedExtensions[], maxFileSizeMb, requiredColumns[] }` |
| POST | `/upload` (multipart, field `file`) | Data Upload | `{ uploadId, fileName, stage, rowsReceived, rowsImported, rowsRejected, messages[], errors[] }` |
| GET | `/upload/:id/status` | Data Upload | same as above; polled until `stage` is `completed` or `failed` |
| POST | `/reports/generate` | Reports | body `{ title, format, sections[], filters:{...query params} }` → `{ reportId, title, format, status, createdAt, downloadUrl, preview:{summary[], recordCount, kpis[]} }` |
| GET | `/reports` | Reports | array of the report object above |

KPI shape: `{ id, label, value, unit?, context?, icon?, tone?, trend?: { direction: 'up'|'down'|'flat', value, is_positive } }`.
Insights: `string[]` (as returned by `analytics_service.insights()`) or `{ text, category }[]`.

## Errors

All requests go through `api/client.ts`; failures are normalised in `api/errors.ts` (400/401/403/404/422/5xx/network/timeout) into friendly messages. Raw server messages are shown only for 400/404/422 and never when they look like stack traces. For 422, FastAPI `detail[]` and `{ errors }` formats are listed.

## Structure

```
api/          client, config, endpoints, params, contracts, adapters, errors, *Api.ts, mock/ (dev only)
components/   layout, filters, dashboard, charts, map, hotspots, upload, reports, common
contexts/     FilterContext (applied filters, shared across pages)
hooks/        useDashboard, useCrimeData, useFilters, useHotspots, useTrends, useAreaProfile, useCrimeMap, useUpload, useReports …
pages/        Dashboard, CrimeMap, Hotspots, Trends, AreaExplorer, DataUpload, Reports, Settings
types/        api, dashboard, crime, analytics, operations
utils/        formatters, constants, colors, filters, files, cn
```
