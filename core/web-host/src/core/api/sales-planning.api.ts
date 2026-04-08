import { apiClient } from './apiClient';

export const SalesPlanningAPI = {
  getLatest: async (year: number, scenario: string) => {
    const response = await apiClient.get('/sales-planning/latest', { params: { year, scenario } });
    return response.data;
  },

  getHeader: async (planId: string) => {
    const response = await apiClient.get('/sales-planning/header', { params: { planId } });
    return response.data;
  },

  getMonths: async (planId: string) => {
    const response = await apiClient.get('/sales-planning/months', { params: { planId } });
    return response.data;
  },

  getTeams: async (planId: string) => {
    const response = await apiClient.get('/sales-planning/teams', { params: { planId } });
    return response.data;
  },

  getStaff: async (planId: string) => {
    const response = await apiClient.get('/sales-planning/staff', { params: { planId } });
    return response.data;
  },
};
