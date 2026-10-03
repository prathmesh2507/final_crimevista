import React from "react";
import { InboxIcon, BoxIcon } from "lucide-react";
import { cn } from "../../utils/cn";
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: BoxIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
  className?: string;
}
export function EmptyState({
  title,
  description,
  icon: Icon = InboxIcon,
  action,
  compact = false,
  className
}: EmptyStateProps) {
  return <div className={cn('flex flex-col items-center justify-center text-center', compact ? 'min-h-[200px] px-4 py-8' : 'min-h-[320px] rounded-xl border border-dashed border-line bg-surface px-6 py-12', className)}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-subtle">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-4 text-sm font-semibold text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <button type="button" onClick={action.onClick} className="mt-5 inline-flex h-9 items-center rounded-lg border border-line bg-surface px-3.5 text-sm font-medium text-fg transition-colors duration-150 hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics">
          {action.label}
        </button>}
    </div>;
}