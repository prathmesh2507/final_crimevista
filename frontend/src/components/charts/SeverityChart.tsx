import React from 'react';
import type { CategoryCount } from '../../types/dashboard';
import { severityColor } from '../../utils/colors';
import { DonutChart } from './DonutChart';

export function SeverityChart({ data }: {data: CategoryCount[];}) {
  return <DonutChart data={data} colorFor={(label) => severityColor(label)} centerLabel="incidents" />;
}