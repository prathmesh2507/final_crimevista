import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';
import { useFilters } from './useFilters';

export function useHotspots() {
  const { filters } = useFilters();
  return useQuery({
    queryKey: ['analytics', 'hotspots', filters],
    queryFn: ({ signal }) => analyticsApi.getHotspots(filters, signal),
    placeholderData: keepPreviousData
  });
}