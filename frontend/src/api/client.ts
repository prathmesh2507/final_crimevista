import axios from "axios";
import { readAuthToken, clearAuthToken } from "../auth/session";
import { API_BASE_URL, API_TIMEOUT_MS } from "./config";
import { normalizeApiError } from "./errors";

/** The only HTTP client in the app. Every request goes through here. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = readAuthToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalized = normalizeApiError(error);
    if (normalized.status === 401) {
      clearAuthToken();
    }
    return Promise.reject(normalized);
  },
);
