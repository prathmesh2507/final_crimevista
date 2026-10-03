import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export function useFilterOptions() {
  return useQuery({
    queryKey: ['filters', 'options'],
    queryFn: ({ signal }) => dashboardApi.getFilterOptions(signal),
    staleTime: 10 * 60_000
  });
}