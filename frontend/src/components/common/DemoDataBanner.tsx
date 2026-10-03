import React from 'react';
import { TriangleAlertIcon } from 'lucide-react';

/** Visibility is driven solely by the backend's demoMode flag. */
export function DemoDataBanner({ demoMode }: {demoMode: boolean;}) {
  if (!demoMode) return null;
  return (
    <div role="note" className="flex items-start gap-3 rounded-xl border border-caution/25 bg-caution-soft px-4 py-3">
      <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-caution" aria-hidden />
      <p className="text-sm text-fg">
        <span className="font-semibold">Demo data is currently being used.</span>{' '}
        <span className="text-muted">Figures come from the backend's demo dataset, not live police records.</span>
      </p>
    </div>);

}