import React, { type ReactNode } from 'react';
import type { DataSourceMeta, RecordCount } from '../../types/api';
import { DemoDataBanner } from './DemoDataBanner';
import { ErrorState } from './ErrorState';
import { RecordCountBanner } from './RecordCountBanner';

interface DataBoundaryProps {
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  errorTitle: string;
  skeleton: ReactNode;
  onReset: () => void;
  recordCount?: RecordCount;
  meta?: DataSourceMeta;
  isFetching?: boolean;
  children: ReactNode;
}

/**
 * Standard page-level state handling: skeleton → error → demo banner + record count →
 * content. Content is withheld when the filtered dataset is empty.
 */
export function DataBoundary({
  isLoading,
  error,
  onRetry,
  errorTitle,
  skeleton,
  onReset,
  recordCount,
  meta,
  isFetching,
  children
}: DataBoundaryProps) {
  if (isLoading) return <>{skeleton}</>;
  if (error && !recordCount) return <ErrorState error={error} title={errorTitle} onRetry={onRetry} />;

  return (
    <div className="space-y-5">
      {meta && <DemoDataBanner demoMode={meta.demoMode} />}
      {error && <ErrorState compact error={error} title={errorTitle} onRetry={onRetry} />}
      {recordCount && <RecordCountBanner recordCount={recordCount} onReset={onReset} isFetching={isFetching} />}
      {(!recordCount || recordCount.filtered > 0) && children}
    </div>);

}