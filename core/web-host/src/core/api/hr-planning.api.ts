import { apiClient } from './apiClient';

export const HrPlanningAPI = {
  getLatest: async (year: number) => {
    const response = await apiClient.get('/hr-planning/latest', { params: { year } });
    return response.data;
  },

  getDepartments: async (planId: string) => {
    const response = await apiClient.get('/hr-planning/departments', { params: { planId } });
    return response.data;
  },

  getHeadcounts: async (planId: string) => {
    const response = await apiClient.get('/hr-planning/headcounts', { params: { planId } });
    return response.data;
  },
};
