import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BdhApi } from '../../infrastructure/api/bdh-api';

export const bdhKeys = {
  all: ['bdh'] as const,
  overview: () => [...bdhKeys.all, 'overview'] as const,
  pulse: (dept: string) => [...bdhKeys.all, 'pulse', dept] as const,
  plans: () => [...bdhKeys.all, 'plans'] as const,
  planItem: (year: number, scenario: string, tab: string) => [...bdhKeys.plans(), year, scenario, tab] as const,
  kpis: (year: number, scenario: string, tab: string) => [...bdhKeys.all, 'kpis', year, scenario, tab] as const,
};

// --- Dashboard Queries ---
export const useGetBdhOverview = () => {
  return useQuery({
    queryKey: bdhKeys.overview(),
    queryFn: BdhApi.getOverview,
    refetchInterval: 30000, // Live C-Level Radar
  });
};

export const useGetDepartmentPulse = (dept: 'SALES' | 'MK' | 'HR' | 'FINANCE') => {
  return useQuery({
    queryKey: bdhKeys.pulse(dept),
    queryFn: () => BdhApi.getDepartmentPulse(dept),
    refetchInterval: 60000,
    enabled: !!dept,
  });
};

// --- Planning Queries & Mutations ---
export const useGetExecPlan = (year: number, scenario: string, tab: string) => {
  return useQuery({
    queryKey: bdhKeys.planItem(year, scenario, tab),
    queryFn: () => BdhApi.getPlan(year, scenario, tab),
    enabled: !!year && !!scenario && !!tab,
    refetchInterval: 300000, // 5 minutes cache
  });
};

export const useUpsertExecPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ year, scenario, tab, data }: { year: number, scenario: string, tab: string, data: any }) => 
      BdhApi.upsertPlan(year, scenario, tab, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: bdhKeys.planItem(variables.year, variables.scenario, variables.tab) });
      queryClient.invalidateQueries({ queryKey: bdhKeys.kpis(variables.year, variables.scenario, variables.tab) });
    },
  });
};

export const useGetExecKpis = (year: number, scenario: string, tab: string) => {
  return useQuery({
    queryKey: bdhKeys.kpis(year, scenario, tab),
    queryFn: () => BdhApi.getKpis(year, scenario, tab),
    enabled: !!year && !!scenario && !!tab,
  });
};
