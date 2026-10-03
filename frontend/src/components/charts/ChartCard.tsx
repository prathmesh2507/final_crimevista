import React, { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ChartCard({ title, description, action, className, children }: ChartCardProps) {
  return (
    <section className={cn('flex min-w-0 flex-col rounded-xl border border-line bg-surface p-5 shadow-card', className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        {action}
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </section>);

}