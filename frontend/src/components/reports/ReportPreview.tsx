import React from 'react';
import { DownloadIcon, FileTextIcon, LoaderCircleIcon } from 'lucide-react';
import { reportsApi } from '../../api/reportsApi';
import type { GeneratedReport } from '../../types/operations';
import { formatDateTime, formatNumber, formatValue } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';

interface ReportPreviewProps {
  report: GeneratedReport | null;
  isGenerating: boolean;
  error: unknown;
  onRetry: () => void;
}

export function ReportPreview({ report, isGenerating, error, onRetry }: ReportPreviewProps) {
  if (isGenerating) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-line bg-surface p-6 text-center shadow-card">
        <LoaderCircleIcon className="h-6 w-6 animate-spin text-analytics" aria-hidden />
        <p className="mt-3 text-sm font-medium text-fg">The backend is compiling your report…</p>
      </div>);

  }
  if (error) return <ErrorState error={error} title="Unable to generate the report" onRetry={onRetry} />;
  if (!report) {
    return (
      <EmptyState
        icon={FileTextIcon}
        title="No report generated yet"
        description="Set the parameters and generate a report. A preview and download link from the backend will appear here."
        className="min-h-[420px]" />);


  }

  return (
    <article className="rounded-xl border border-line bg-surface shadow-card">
      <header className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted">
            {report.format.toUpperCase()} · {formatDateTime(report.createdAt)}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-fg">{report.title}</h2>
        </div>
        {report.downloadUrl ?
        <a
          href={reportsApi.resolveDownloadUrl(report.downloadUrl)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-ink-900 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-ink-700">
          
            <DownloadIcon className="h-4 w-4" aria-hidden />
            Download
          </a> :

        <p className="max-w-[220px] text-xs text-muted">
            {report.status === 'processing' ? 'The file is still being prepared.' : 'The backend did not return a download URL.'}
          </p>
        }
      </header>

      {report.preview ?
      <div className="space-y-5 p-5">
          <p className="text-sm text-muted">
            Covers <strong className="font-semibold text-fg">{formatNumber(report.preview.recordCount)}</strong> records
          </p>
          {report.preview.kpis.length > 0 &&
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
              {report.preview.kpis.map((k) =>
          <div key={k.id} className="min-w-0">
                  <dt className="truncate text-xs text-muted">{k.label}</dt>
                  <dd className="mt-0.5 truncate text-xl font-semibold tabular-nums text-fg">{formatValue(k.value)}</dd>
                </div>
          )}
            </dl>
        }
          {report.preview.summary.length > 0 &&
        <div>
              <h3 className="text-sm font-semibold text-fg">Summary</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-fg">
                {report.preview.summary.map((s) =>
            <li key={s}>{s}</li>
            )}
              </ul>
            </div>
        }
        </div> :

      <p className="p-5 text-sm text-muted">No preview was returned for this report.</p>
      }
    </article>);

}