import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';
import { useFilters } from './useFilters';

export function useDashboard() {
  const { filters } = useFilters();
  return useQuery({
    queryKey: ['dashboard', 'overview', filters],
    queryFn: ({ signal }) => dashboardApi.getOverview(filters, signal),
    placeholderData: keepPreviousData
  });
}