import axios from "axios";
import { API_BASE_URL, API_TIMEOUT_MS, AUTH_TOKEN_STORAGE_KEY } from "./config";
import { normalizeApiError } from "./errors";

/** The only HTTP client in the app. Every request goes through here. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { Accept: "application/json" },
});

function readAuthToken(): string | null {
  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = readAuthToken();
  if (token) {
    config.headers.set("Authorization", "Bearer " + token);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);
