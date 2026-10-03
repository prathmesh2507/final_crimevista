import React, { useEffect, useState } from 'react';
import { useCrimeData } from '../../hooks/useCrimeData';
import { useFilters } from '../../hooks/useFilters';
import type { CrimeRecord } from '../../types/crime';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { DataTable, type Column } from '../common/DataTable';
import { ErrorState } from '../common/ErrorState';
import { SeverityBadge } from '../common/SeverityBadge';

const COLUMNS: Column<CrimeRecord>[] = [
{ key: 'id', header: 'Record', render: (r) => <span className="font-mono text-xs text-muted">{r.id}</span> },
{ key: 'date', header: 'Date', render: (r) => <span className="whitespace-nowrap">{formatDate(r.occurredOn)}</span> },
{ key: 'type', header: 'Crime type', render: (r) => <span className="font-medium">{r.crimeType}</span> },
{ key: 'area', header: 'Area', render: (r) => r.area },
{ key: 'severity', header: 'Severity', render: (r) => <SeverityBadge severity={r.severity} /> },
{ key: 'time', header: 'Time of day', render: (r) => r.timePeriod },
{ key: 'status', header: 'Status', render: (r) => <span className="text-muted">{r.status ?? '—'}</span> }];


export function FilteredRecordsTable() {
  const { filters, resetFilters } = useFilters();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useCrimeData(page, DEFAULT_PAGE_SIZE);

  useEffect(() => setPage(1), [filters]);

  return (
    <section aria-labelledby="records-heading" className="space-y-3">
      <div>
        <h2 id="records-heading" className="text-base font-semibold text-fg">
          Filtered records
        </h2>
        <p className="text-xs text-muted">Individual incidents matching the current filters</p>
      </div>
      {error && !data ?
      <ErrorState error={error} title="Unable to load crime records" onRetry={() => refetch()} /> :

      <DataTable
        caption="Filtered crime records"
        columns={COLUMNS}
        rows={data?.items ?? []}
        rowKey={(r) => r.id}
        loading={isLoading}
        emptyTitle="No crime records found for the selected filters."
        emptyAction={{ label: 'Reset filters', onClick: resetFilters }}
        pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total, onPageChange: setPage } : undefined} />

      }
    </section>);

}