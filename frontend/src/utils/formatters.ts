import { format, isValid, parseISO } from 'date-fns';
import type { InsightKind } from '../types/dashboard';

const numberFormat = new Intl.NumberFormat('en-IN');

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return numberFormat.format(value);
}

export function formatValue(value: string | number): string {
  return typeof value === 'number' ? formatNumber(value) : value;
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toFixed(digits)}%`;
}

export function formatSignedPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function shareOf(part: number, total: number): string {
  return total ? formatPercent(part / total * 100) : '—';
}

function safeParse(value: string): Date | null {
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

export function formatDate(value: string | null | undefined, pattern = 'dd MMM yyyy'): string {
  if (!value) return '—';
  const parsed = safeParse(value);
  return parsed ? format(parsed, pattern) : value;
}

export const formatMonth = (value: string) => formatDate(value, 'MMMM yyyy');
export const formatMonthShort = (value: string) => formatDate(value, "MMM ''yy");
export const formatDateTime = (value: string | null | undefined) => formatDate(value, 'dd MMM yyyy, HH:mm');

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Picks a presentational icon for a backend insight string. Never alters the text. */
export function inferInsightKind(text: string): InsightKind {
  const t = text.toLowerCase();
  if (/(increase|rose|rise|up by|higher than)/.test(t)) return 'increase';
  if (/(decrease|fell|drop|declin|down by|lower than)/.test(t)) return 'decrease';
  if (/(severity|critical|high-severity)/.test(t)) return 'severity';
  if (/(morning|afternoon|evening|night|hour|time)/.test(t)) return 'time';
  if (/(area|zone|ward|locality|station)/.test(t)) return 'location';
  if (/(category|crime type|type)/.test(t)) return 'category';
  return 'info';
}