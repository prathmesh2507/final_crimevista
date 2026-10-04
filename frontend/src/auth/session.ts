import { LEGACY_AUTH_TOKEN_STORAGE_KEY } from "../api/config";

export const AUTH_STATE_CHANGED_EVENT = "crimevista:auth-state-changed";

export function notifyAuthStateChanged(): void {
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}

try {
  window.localStorage.removeItem(LEGACY_AUTH_TOKEN_STORAGE_KEY);
} catch {
  // Storage may be disabled; the API session is managed by an HttpOnly cookie.
}
