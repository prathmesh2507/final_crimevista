import React from 'react';
import type { CategoryCount } from '../../types/dashboard';
import { paletteColor } from '../../utils/colors';
import { DonutChart } from './DonutChart';

/** Displays up to the top 8 crime types as sent by the backend. */
export function CrimeTypeChart({ data }: {data: CategoryCount[];}) {
  return <DonutChart data={data.slice(0, 8)} colorFor={(_, i) => paletteColor(i)} centerLabel="in top types" />;
}