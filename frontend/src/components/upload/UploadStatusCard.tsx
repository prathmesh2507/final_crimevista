import React from "react";
import {
  ArrowRightIcon,
  CircleCheckIcon,
  CircleXIcon,
  DatabaseIcon,
  FileSpreadsheetIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { isApiError } from "../../api/errors";
import type { UploadPhase } from "../../hooks/useUpload";
import type { UploadStatus } from "../../types/operations";
import { cn } from "../../utils/cn";
import { formatFileSize, formatNumber } from "../../utils/formatters";
import { ErrorState } from "../common/ErrorState";

interface UploadStatusCardProps {
  file: File | null;
  phase: UploadPhase;
  progress: number;
  status: UploadStatus | null;
  requestError: unknown;
  onStart: () => void;
  onReset: () => void;
}

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "processing", label: "Validate & replace" },
  { key: "completed", label: "Ready" },
];

function stepIndex(
  phase: UploadPhase,
  status: UploadStatus | null,
  progress: number,
): number {
  if (phase === "uploading") return progress >= 100 ? 1 : 0;
  if (phase === "ready" || phase === "idle") return 0;
  if (phase === "completed") return 2;
  if (status?.stage === "processing") return 1;
  return 1;
}

export function UploadStatusCard({
  file,
  phase,
  progress,
  status,
  requestError,
  onStart,
  onReset,
}: UploadStatusCardProps) {
  if (!file && !status) return null;
  const current = stepIndex(phase, status, progress);
  const failed = phase === "failed";
  const busy = phase === "uploading" || phase === "processing";
  const serverProcessing =
    phase === "processing" || (phase === "uploading" && progress >= 100);
  const hasRejectedRows =
    phase === "completed" && (status?.rowsRejected ?? 0) > 0;
  const reportedErrors = status?.errors.slice(0, 3) ?? [];

  return (
    <section
      aria-live="polite"
      className="rounded-xl border border-line bg-surface p-5 shadow-card"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted">
          <FileSpreadsheetIcon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-fg">
            {file?.name ?? status?.fileName}
          </p>
          {file && (
            <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
          )}
        </div>
        {phase === "ready" && (
          <div className="ml-auto flex max-w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="h-9 rounded-lg border border-line px-3 text-sm font-medium text-fg transition-colors duration-150 hover:bg-canvas"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={onStart}
                className="h-9 rounded-lg bg-analytics px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-analytics-strong"
              >
                Upload
              </button>
            </div>
          </div>
        )}
      </div>

      {phase !== "ready" && (
        <ol
          className="mt-5 grid grid-cols-3 gap-2"
          aria-label="Upload progress"
        >
          {STEPS.map((step, i) => {
            const done =
              i < current || (i === current && phase === "completed");
            const active = i === current && !done;
            const indeterminate = active && serverProcessing;
            return (
              <li key={step.key} className="min-w-0">
                <div className="h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-500 ease-out",
                      failed && active ? "bg-danger" : "bg-analytics",
                      indeterminate && "upload-stage-active",
                    )}
                    style={{
                      width: done
                        ? "100%"
                        : active
                          ? indeterminate
                            ? "100%"
                            : `${progress}%`
                          : "0%",
                    }}
                  />
                </div>
                <p
                  className={cn(
                    "mt-1.5 truncate text-xs",
                    done || active ? "font-medium text-fg" : "text-subtle",
                  )}
                >
                  {step.label}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {busy && (
        <div className="mt-4 rounded-lg border border-line bg-canvas px-4 py-3">
          <div
            className="flex items-center gap-3"
            role="img"
            aria-label="Data moving from uploaded file to the database"
          >
            <span className="upload-flow-file">
              <FileSpreadsheetIcon className="h-4 w-4" aria-hidden />
            </span>
            <span className="upload-flow-track" aria-hidden>
              <span className="upload-flow-packet" />
              <span className="upload-flow-packet upload-flow-packet-delay-one" />
              <span className="upload-flow-packet upload-flow-packet-delay-two" />
            </span>
            <span className="upload-flow-database">
              <DatabaseIcon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <div className="mt-3 flex items-start gap-2.5">
            <LoaderCircleIcon
              className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-analytics"
              aria-hidden
            />
            <div>
              <p className="text-sm font-medium text-fg">
                {phase === "uploading"
                  ? serverProcessing
                    ? "Validating and replacing records…"
                    : `Uploading file… ${progress}%`
                  : `Backend is ${status?.stage ?? "processing"} the file…`}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {serverProcessing
                  ? "Checking columns, validating rows, and updating the active dataset"
                  : "Securely sending the selected dataset"}
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === "completed" && status && (
        <div
          className={cn(
            "mt-5 rounded-lg border p-4",
            hasRejectedRows
              ? "border-danger/20 bg-danger-soft"
              : "border-positive/20 bg-positive-soft",
          )}
        >
          <p
            className={cn(
              "inline-flex items-center gap-2 text-sm font-semibold",
              hasRejectedRows ? "text-danger" : "text-positive",
            )}
          >
            {hasRejectedRows ? (
              <CircleXIcon className="h-4 w-4" aria-hidden />
            ) : (
              <CircleCheckIcon className="h-4 w-4" aria-hidden />
            )}
            {hasRejectedRows
              ? "Upload completed with rejected rows"
              : "Processing complete"}
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
            {(
              [
                ["Received", status.rowsReceived],
                ["Valid", status.validRecords ?? status.rowsImported],
                ["Imported", status.rowsImported],
                ["Rejected", status.rowsRejected],
                ["Analysis", status.analysisStatus ?? "completed"],
              ] as Array<[string, number | string | null]>
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-lg font-semibold tabular-nums text-fg">
                  {typeof value === "number" ? formatNumber(value) : value}
                </dd>
              </div>
            ))}
          </dl>
          {status.messages.map((m) => (
            <p key={m} className="mt-2 text-xs text-muted">
              {m}
            </p>
          ))}
          {status.areas?.length ? (
            <div className="mt-4 border-t border-positive/20 pt-3">
              <p className="text-xs text-muted">Detected area</p>
              <p className="mt-1 break-words text-sm font-medium text-fg">
                {status.detectedArea ?? status.areas.join(", ")}
              </p>
              <p className="mt-2 text-xs text-muted">
                Analysis status:{" "}
                <span className="font-medium text-fg">
                  {status.analysisStatus ?? "completed"}
                </span>
              </p>
              <Link
                to="/dashboard"
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-analytics px-3.5 text-sm font-medium text-white transition-colors hover:bg-analytics-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics"
              >
                View analysis
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {status?.errors.length ? (
        <div className="mt-5 rounded-lg border border-danger/20 bg-danger-soft p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-danger">
            <CircleXIcon className="h-4 w-4" aria-hidden />
            {status.validRecords === 0
              ? "No records passed validation"
              : status.rowsImported === 0
                ? "No new records were imported"
                : "Some records were rejected"}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-fg">
            {reportedErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          {status.errors.length > reportedErrors.length && (
            <p className="mt-2 text-xs text-muted">
              Showing the first {reportedErrors.length} reported validation
              errors.
            </p>
          )}
        </div>
      ) : null}

      {failed && requestError ? (
        <div className="mt-5">
          {isApiError(requestError) && requestError.status === 401 ? (
            <div className="rounded-lg border border-danger/20 bg-danger-soft p-4">
              <p className="text-sm font-semibold text-danger">Authentication required</p>
              <p className="mt-1 text-sm text-fg">
                Sign in as an administrator in Settings to upload a dataset.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/settings"
                  className="inline-flex h-9 items-center rounded-lg bg-analytics px-3 text-sm font-medium text-white transition-colors hover:bg-analytics-strong"
                >
                  Go to Settings to sign in
                </Link>
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex h-9 items-center rounded-lg border border-line px-3 text-sm font-medium text-fg transition-colors hover:bg-canvas"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <ErrorState
              compact
              error={requestError}
              title="Upload failed"
              onRetry={onStart}
            />
          )}
        </div>
      ) : null}

      {(phase === "completed" || failed) && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 h-9 rounded-lg border border-line px-3.5 text-sm font-medium text-fg transition-colors duration-150 hover:bg-canvas"
        >
          Upload another file
        </button>
      )}
    </section>
  );
}
