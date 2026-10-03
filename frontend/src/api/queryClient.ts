import { QueryClient } from '@tanstack/react-query';
import { isApiError } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => isApiError(error) && error.retryable && failureCount < 2
    },
    mutations: { retry: false }
  }
});