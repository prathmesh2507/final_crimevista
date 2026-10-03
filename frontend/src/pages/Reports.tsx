import React, { useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import { reportsApi } from '../api/reportsApi';
import { DataTable, type Column } from '../components/common/DataTable';
import { ErrorState } from '../components/common/ErrorState';
import { PageHeader } from '../components/common/PageHeader';
import { ReportGenerator } from '../components/reports/ReportGenerator';
import { ReportPreview } from '../components/reports/ReportPreview';
import { useGenerateReport, useReportHistory } from '../hooks/useReports';
import type { GeneratedReport, ReportRequest } from '../types/operations';
import { formatDateTime, formatNumber } from '../utils/formatters';

export function Reports() {
  const generate = useGenerateReport();
  const history = useReportHistory();
  const [lastRequest, setLastRequest] = useState<ReportRequest | null>(null);
  const [selected, setSelected] = useState<GeneratedReport | null>(null);

  const run = (request: ReportRequest) => {
    setLastRequest(request);
    setSelected(null);
    generate.mutate(request);
  };

  const shown = selected ?? generate.data ?? null;

  const columns: Column<GeneratedReport>[] = [
  { key: 'title', header: 'Report', render: (r) => <span className="font-medium">{r.title}</span> },
  { key: 'created', header: 'Created', render: (r) => <span className="whitespace-nowrap">{formatDateTime(r.createdAt)}</span> },
  { key: 'format', header: 'Format', render: (r) => r.format.toUpperCase() },
  { key: 'records', header: 'Records', align: 'right', render: (r) => formatNumber(r.preview?.recordCount ?? null) },
  { key: 'status', header: 'Status', render: (r) => <span className="capitalize text-muted">{r.status}</span> },
  {
    key: 'download',
    header: '',
    align: 'right',
    render: (r) =>
    r.downloadUrl ?
    <a
      href={reportsApi.resolveDownloadUrl(r.downloadUrl)}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-sm font-medium text-analytics hover:underline">
      
            <DownloadIcon className="h-4 w-4" aria-hidden />
            Download
          </a> :

    <span className="text-xs text-subtle">No file</span>

  }];


  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description="Generate backend-compiled reports for a date range, area and crime type." />

      <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <ReportGenerator onGenerate={run} isGenerating={generate.isPending} />
        <ReportPreview report={shown} isGenerating={generate.isPending} error={selected ? null : generate.error} onRetry={() => lastRequest && run(lastRequest)} />
      </div>

      <section aria-labelledby="history-heading" className="space-y-3">
        <h2 id="history-heading" className="text-base font-semibold text-fg">
          Report history
        </h2>
        {history.error && !history.data ?
        <ErrorState error={history.error} title="Unable to load report history" onRetry={() => history.refetch()} /> :

        <DataTable
          caption="Previously generated reports"
          columns={columns}
          rows={history.data ?? []}
          rowKey={(r) => r.reportId}
          loading={history.isLoading}
          onRowClick={setSelected}
          emptyTitle="No reports have been generated yet." />

        }
      </section>
    </div>);

}