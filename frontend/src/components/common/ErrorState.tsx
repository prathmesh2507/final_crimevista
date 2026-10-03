import React from 'react';
import { CircleAlertIcon, RotateCwIcon } from 'lucide-react';
import { normalizeApiError } from '../../api/errors';
import { cn } from '../../utils/cn';

interface ErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ error, title = 'Unable to load data', onRetry, compact = false }: ErrorStateProps) {
  const apiError = normalizeApiError(error);
  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-xl border border-danger/20 bg-danger-soft text-left',
        compact ? 'items-center px-4 py-3' : 'flex-col items-start px-6 py-6 sm:flex-row'
      )}>
      
      <CircleAlertIcon className={cn('shrink-0 text-danger', compact ? 'h-4 w-4' : 'h-5 w-5')} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{apiError.message}</p>
        {!compact && apiError.details.length > 0 &&
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-muted">
            {apiError.details.map((d) =>
          <li key={d}>{d}</li>
          )}
          </ul>
        }
        {!compact && apiError.status && <p className="mt-2 font-mono text-xs text-subtle">HTTP {apiError.status}</p>}
      </div>
      {onRetry &&
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-line bg-surface px-3.5 text-sm font-medium text-fg transition-colors duration-150 hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics">
        
          <RotateCwIcon className="h-4 w-4" aria-hidden />
          Retry
        </button>
      }
    </div>);

}