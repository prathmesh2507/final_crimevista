import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { crimeApi } from '../api/crimeApi';
import { useFilters } from './useFilters';

export function useCrimeData(page: number, pageSize: number) {
  const { filters } = useFilters();
  return useQuery({
    queryKey: ['crimes', 'records', filters, page, pageSize],
    queryFn: ({ signal }) => crimeApi.getRecords(filters, page, pageSize, signal),
    placeholderData: keepPreviousData
  });
}