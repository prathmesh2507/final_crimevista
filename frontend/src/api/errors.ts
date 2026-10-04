import axios from 'axios';
import type { ApiErrorKind } from '../types/api';

const FRIENDLY_MESSAGES: Record<ApiErrorKind, string> = {
  bad_request: "The request couldn't be processed. Check the selected filters and try again.",
  unauthorized: 'Authentication required. Sign in as an administrator in Settings, then try again.',
  forbidden: "You don't have permission to access this data.",
  not_found: 'The requested data could not be found.',
  validation: 'Some of the submitted values were rejected by the server.',
  server: 'The CrimeVista server ran into a problem. Please try again.',
  network: "Can't reach the CrimeVista server. Check your connection or the API address.",
  timeout: 'The server took too long to respond. Please try again.',
  cancelled: 'The request was cancelled.',
  unknown: 'Something unexpected happened. Please try again.'
};

const RETRYABLE: ApiErrorKind[] = ['network', 'timeout', 'server', 'unknown'];

/** Normalised error thrown by every API call. Never carries raw stack traces. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly details: string[];
  readonly retryable: boolean;

  constructor(kind: ApiErrorKind, status: number | null, message?: string, details: string[] = []) {
    super(message ?? FRIENDLY_MESSAGES[kind]);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.details = details;
    this.retryable = RETRYABLE.includes(kind);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 400) return 'bad_request';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 408) return 'timeout';
  if (status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

function safeServerMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const record = body as {message?: unknown;error?: unknown;};
  const message = record.message ?? record.error;
  if (typeof message !== 'string' || message.length === 0 || message.length > 200) return undefined;
  if (/traceback|exception|stack|\bat\s+\S+\s*\(/i.test(message)) return undefined;
  return message;
}

function validationDetails(body: unknown): string[] {
  if (!body || typeof body !== 'object') return [];
  const detail = (body as {detail?: unknown;}).detail;
  if (Array.isArray(detail)) {
    return detail.
    map((d) => d && typeof d === 'object' && 'msg' in d ? String((d as {msg: unknown;}).msg) : String(d)).
    slice(0, 5);
  }
  const errors = (body as {errors?: unknown;}).errors;
  if (Array.isArray(errors)) return errors.map(String).slice(0, 5);
  if (errors && typeof errors === 'object') {
    return Object.entries(errors).
    map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).
    slice(0, 5);
  }
  return [];
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;
  if (axios.isCancel(error)) return new ApiError('cancelled', null);
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return new ApiError('timeout', null);
    if (!error.response) return new ApiError('network', null);
    const { status, data } = error.response;
    const kind = kindForStatus(status);
    const expose = kind === 'bad_request' || kind === 'validation' || kind === 'not_found';
    return new ApiError(kind, status, expose ? safeServerMessage(data) : undefined, expose ? validationDetails(data) : []);
  }
  return new ApiError('unknown', null);
}