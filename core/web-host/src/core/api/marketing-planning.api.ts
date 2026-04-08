import { apiClient } from './apiClient';

export const MarketingPlanningAPI = {
  getHeader: async (planId: string) => {
    const response = await apiClient.get('/marketing-planning/header', { params: { planId } });
    return response.data;
  },

  getChannelBudgets: async (planId: string) => {
    const response = await apiClient.get('/marketing-planning/channel-budgets', { params: { planId } });
    return response.data;
  },

  getKpiTargets: async (planId: string) => {
    const response = await apiClient.get('/marketing-planning/kpi-targets', { params: { planId } });
    return response.data;
  },

  getAssumptions: async (planId: string) => {
    const response = await apiClient.get('/marketing-planning/assumptions', { params: { planId } });
    return response.data;
  },
};
