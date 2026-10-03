import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { useFilters } from './useFilters';

export function useAreaProfile(area: string | null) {
  const { filters } = useFilters();
  return useQuery({
    queryKey: ['analytics', 'area', area, filters],
    queryFn: ({ signal }) => analyticsApi.getAreaProfile(area as string, filters, signal),
    enabled: Boolean(area),
    placeholderData: keepPreviousData
  });
}