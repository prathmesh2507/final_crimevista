import { CHART_PALETTE, FALLBACK_SEVERITY_COLOR, SEVERITY_COLORS } from './constants';

export function severityColor(severity: string): string {
  const key = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
  return SEVERITY_COLORS[key] ?? FALLBACK_SEVERITY_COLOR;
}

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

export type Tone = 'danger' | 'alert' | 'caution' | 'neutral';

export function riskTone(level: string | null): Tone {
  const l = (level ?? '').toLowerCase();
  if (l.includes('very') || l.includes('critical')) return 'danger';
  if (l.includes('high')) return 'alert';
  if (l.includes('elevated') || l.includes('medium')) return 'caution';
  return 'neutral';
}