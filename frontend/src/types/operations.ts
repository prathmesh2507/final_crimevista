import type { CrimeFilters } from "./api";
import type { KPI } from "./dashboard";

export type UploadStage =
  | "queued"
  | "validating"
  | "processing"
  | "completed"
  | "failed";

export interface UploadConfig {
  acceptedExtensions: string[];
  maxFileSizeMb: number;
  requiredColumns: string[];
}

export type UploadAnalysisStatus = "pending" | "completed" | "failed";

export interface UploadStatus {
  uploadId: string;
  fileName: string;
  stage: UploadStage;
  areas?: string[];
  detectedArea?: string | null;
  validRecords?: number | null;
  rowsReceived: number | null;
  rowsImported: number | null;
  rowsRejected: number | null;
  analysisStatus?: UploadAnalysisStatus;
  messages: string[];
  errors: string[];
}

export type ReportFormat = "pdf" | "csv" | "xlsx";

export interface ReportRequest {
  title: string;
  format: ReportFormat;
  sections: string[];
  filters: CrimeFilters;
}

export interface GeneratedReport {
  reportId: string;
  title: string;
  format: ReportFormat;
  status: "ready" | "processing" | "failed";
  createdAt: string;
  downloadUrl: string | null;
  preview: {
    summary: string[];
    recordCount: number;
    kpis: KPI[];
  } | null;
}
