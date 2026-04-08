import { useQuery } from '@tanstack/react-query';
import { MarketingPlanningAPI } from '../../../core/api/marketing-planning.api';

export const useGetMarketingHeader = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['marketingPlanning', 'header', planId],
    queryFn: () => MarketingPlanningAPI.getHeader(planId),
    enabled: !!planId,
    ...options,
  });
};

export const useGetMarketingChannelBudgets = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['marketingPlanning', 'channels', planId],
    queryFn: () => MarketingPlanningAPI.getChannelBudgets(planId),
    enabled: !!planId,
    ...options,
  });
};

export const useGetMarketingKpiTargets = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['marketingPlanning', 'kpi-targets', planId],
    queryFn: () => MarketingPlanningAPI.getKpiTargets(planId),
    enabled: !!planId,
    ...options,
  });
};

export const useGetMarketingAssumptions = (planId: string, options = {}) => {
  return useQuery({
    queryKey: ['marketingPlanning', 'assumptions', planId],
    queryFn: () => MarketingPlanningAPI.getAssumptions(planId),
    enabled: !!planId,
    ...options,
  });
};
