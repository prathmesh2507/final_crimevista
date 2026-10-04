import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminSession {
  authenticated: boolean;
}

export const authApi = {
  async login(credentials: AdminCredentials): Promise<void> {
    await apiClient.post(ENDPOINTS.authLogin, credentials);
  },

  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.authLogout);
  },

  async getSession(signal?: AbortSignal): Promise<AdminSession> {
    const { data } = await apiClient.get<AdminSession>(ENDPOINTS.authSession, {
      signal,
    });
    return data;
  },
};
