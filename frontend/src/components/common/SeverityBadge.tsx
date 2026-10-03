import React from 'react';
import { severityColor } from '../../utils/colors';

export function SeverityBadge({ severity }: {severity: string;}) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-fg">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: severityColor(severity) }} aria-hidden />
      {severity}
    </span>);

}