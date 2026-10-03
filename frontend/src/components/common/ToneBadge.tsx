import React from 'react';
import type { Tone } from '../../utils/colors';
import { cn } from '../../utils/cn';

const TONE_CLASSES: Record<Tone, string> = {
  danger: 'bg-danger-soft text-danger',
  alert: 'bg-alert-soft text-alert',
  caution: 'bg-caution-soft text-caution',
  neutral: 'bg-canvas text-muted'
};

export function ToneBadge({ tone, children }: {tone: Tone;children: React.ReactNode;}) {
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium', TONE_CLASSES[tone])}>
      {children}
    </span>);

}