import React from 'react';
import { InfoIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ContextualHelpProps {
  text: string;
  className?: string;
}

export function ContextualHelp({ text, className }: ContextualHelpProps) {
  return (
    <div
      title={text}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[11px] font-medium text-muted shadow-card',
        className,
      )}
    >
      <InfoIcon className="h-3.5 w-3.5 text-analytics" aria-hidden />
      <span>Tip</span>
    </div>
  );
}
