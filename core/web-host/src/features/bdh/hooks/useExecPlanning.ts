import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExecPlanningAPI, GetLatestPlanParams } from '../../../core/api/exec-planning.api';

// --- QUERIES ---

export const useGetLatestPlan = (params: GetLatestPlanParams, options = {}) => {
  return useQuery({
    queryKey: ['execPlanning', 'latest', params],
    queryFn: () => ExecPlanningAPI.getLatestPlan(params),
    ...options,
  });
};

export const useGetKpis = (params: GetLatestPlanParams, options = {}) => {
  return useQuery({
    queryKey: ['execPlanning', 'kpis', params],
    queryFn: () => ExecPlanningAPI.getKpis(params),
    ...options,
  });
};

// --- MUTATIONS ---

export const useSavePlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => ExecPlanningAPI.savePlan(data),
    onSuccess: (_, variables) => {
      // Invalidate the cache to trigger a refetch of the latest plan
      queryClient.invalidateQueries({
        queryKey: ['execPlanning', 'latest', { 
            year: variables.year, 
            scenario: variables.scenario, 
            tab: variables.tab 
        }],
      });
      // Also invalidate KPIs just to be safe if they calculate off the latest save
      queryClient.invalidateQueries({
        queryKey: ['execPlanning', 'kpis', { 
            year: variables.year, 
            scenario: variables.scenario, 
            tab: variables.tab 
        }],
      });
    },
  });
};
