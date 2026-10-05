import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface ChatRequest {
  message: string;
  page?: string | null;
  filters?: Record<string, unknown>;
  selectedArea?: string | null;
  selectedIncident?: Record<string, unknown> | null;
}

export interface ChatResponse {
  answer: string;
  provider: 'fallback' | 'openai';
  context: {
    page?: string | null;
    selectedArea?: string | null;
    selectedIncident?: boolean;
    activeFilters?: boolean;
  };
  suggestedActions: string[];
}

export const chatApi = {
  async ask(payload: ChatRequest): Promise<ChatResponse> {
    const { data } = await apiClient.post<ChatResponse>(ENDPOINTS.chat, payload);
    return data;
  },
};
