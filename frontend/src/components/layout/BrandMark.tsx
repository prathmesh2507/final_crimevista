import React from 'react';
import { RadarIcon } from 'lucide-react';

export function BrandMark() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-analytics text-white" aria-hidden>
      <RadarIcon className="h-5 w-5" />
    </span>);

}