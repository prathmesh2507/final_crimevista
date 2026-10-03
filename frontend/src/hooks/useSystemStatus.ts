import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export function useSystemStatus() {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: ({ signal }) => dashboardApi.getHealth(signal),
    refetchInterval: 60_000,
    retry: false
  });
}