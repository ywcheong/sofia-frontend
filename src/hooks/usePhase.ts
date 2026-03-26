import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentPhase } from '@/api/phase';
import type { GetCurrentPhaseResponse } from '@/types/api';

const PHASE_QUERY_KEY = ['phase'] as const;

export function usePhase() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: PHASE_QUERY_KEY,
    queryFn: getCurrentPhase,
  });

  return {
    phaseData: data ?? null,
    currentPhase: data?.currentPhase ?? null,
    isLoading,
    error,
    refetch,
  };
}

export function usePhaseInvalidation() {
  const queryClient = useQueryClient();

  return {
    invalidatePhase: () => queryClient.invalidateQueries({ queryKey: PHASE_QUERY_KEY }),
    setPhaseData: (data: GetCurrentPhaseResponse) =>
      queryClient.setQueryData(PHASE_QUERY_KEY, data),
  };
}
