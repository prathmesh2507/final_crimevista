import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { mapApi } from '../api/mapApi';
import { useFilters } from './useFilters';

export function useCrimeMap() {
  const { filters } = useFilters();
  return useQuery({
    queryKey: ['map', 'incidents', filters],
    queryFn: ({ signal }) => mapApi.getCrimeMap(filters, signal),
    placeholderData: keepPreviousData
  });
}