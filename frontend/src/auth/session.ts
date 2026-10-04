import { AUTH_TOKEN_STORAGE_KEY } from "../api/config";

export const AUTH_STATE_CHANGED_EVENT = "crimevista:auth-state-changed";

export function readAuthToken(): string | null {
  try {
    const value = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return value && value.trim().length > 0 ? value.trim() : null;
  } catch {
    return null;
  }
}

export function hasAuthToken(): boolean {
  return Boolean(readAuthToken());
}

export function writeAuthToken(token: string): void {
  const clean = token.trim();
  if (!clean) {
    clearAuthToken();
    return;
  }

  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, clean);
  } catch {
    // Ignore storage failures and keep the app functional when browser storage is unavailable.
  }

  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

export function clearAuthToken(): void {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage failures and keep the app functional when browser storage is unavailable.
  }

  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}
