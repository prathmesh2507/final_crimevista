import type { GeneratedReport, ReportRequest } from "../types/operations";
import { toKpis } from "./adapters";
import { apiClient } from "./client";
import { API_BASE_URL } from "./config";
import type { RawReport, RawReportRequest } from "./contracts";
import { ENDPOINTS } from "./endpoints";
import { toQueryParams } from "./params";

function toReport(raw: RawReport): GeneratedReport {
  return {
    reportId: raw.reportId,
    title: raw.title,
    format: raw.format,
    status: raw.status,
    createdAt: raw.createdAt,
    downloadUrl: raw.downloadUrl,
    preview: raw.preview
      ? {
          summary: (raw.preview.summary ?? []).map((item) =>
            typeof item === "string" ? item : item.text,
          ),
          recordCount: raw.preview.recordCount,
          kpis: toKpis(raw.preview.kpis),
        }
      : null,
  };
}

export const reportsApi = {
  /** POST /reports/generate — REQUIRES BACKEND IMPLEMENTATION. Generation happens on the backend. */
  async generateReport(request: ReportRequest): Promise<GeneratedReport> {
    const body: RawReportRequest = {
      title: request.title,
      format: request.format,
      sections: request.sections,
      filters: toQueryParams(request.filters),
    };
    const { data } = await apiClient.post<RawReport>(
      ENDPOINTS.generateReport,
      body,
    );
    return toReport(data);
  },

  /** GET /reports — REQUIRES BACKEND IMPLEMENTATION. */
  async listReports(signal?: AbortSignal): Promise<GeneratedReport[]> {
    const { data } = await apiClient.get<RawReport[]>(ENDPOINTS.reports, {
      signal,
    });
    return (data ?? []).map(toReport);
  },

  /** Resolves relative download URLs returned by the backend against the API origin. */
  resolveDownloadUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    return new URL(url, `${API_BASE_URL}/`).toString();
  },
};
