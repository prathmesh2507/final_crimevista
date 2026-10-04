import axios from "axios";
import { notifyAuthStateChanged } from "../auth/session";
import { API_BASE_URL, API_TIMEOUT_MS } from "./config";
import { normalizeApiError } from "./errors";

/** The only HTTP client in the app. Every request goes through here. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error);
    if (normalized.status === 401) {
      notifyAuthStateChanged();
    }
    return Promise.reject(normalized);
  },
);
