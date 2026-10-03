import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../api/reportsApi';
import type { ReportRequest } from '../types/operations';

export function useReportHistory() {
  return useQuery({
    queryKey: ['reports', 'history'],
    queryFn: ({ signal }) => reportsApi.listReports(signal)
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ReportRequest) => reportsApi.generateReport(request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', 'history'] })
  });
}