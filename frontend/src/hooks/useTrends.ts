import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { useFilters } from './useFilters';

export function useTrends() {
  const { filters } = useFilters();
  return useQuery({
    queryKey: ['analytics', 'trends', filters],
    queryFn: ({ signal }) => analyticsApi.getTrends(filters, signal),
    placeholderData: keepPreviousData
  });
}