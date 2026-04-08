import { apiClient } from './apiClient';

export interface GetLatestPlanParams {
  year: number;
  scenario: string;
  tab: string;
}

export const ExecPlanningAPI = {
  getLatestPlan: async ({ year, scenario, tab }: GetLatestPlanParams) => {
    const response = await apiClient.get('/exec-planning/latest', {
      params: { year, scenario, tab },
    });
    return response.data;
  },

  getKpis: async ({ year, scenario, tab }: GetLatestPlanParams) => {
    const response = await apiClient.get('/exec-planning/kpis', {
      params: { year, scenario, tab },
    });
    return response.data;
  },

  savePlan: async (data: any) => {
    const response = await apiClient.put('/exec-planning/save', data);
    return response.data;
  },
};
