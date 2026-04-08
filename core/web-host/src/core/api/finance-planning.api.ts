import { apiClient } from './apiClient';

export const FinancePlanningAPI = {
  getLatest: async (year: number, scenario: string) => {
    const response = await apiClient.get('/finance-planning/latest', { params: { year, scenario } });
    return response.data;
  },

  getPnl: async (planId: string) => {
    const response = await apiClient.get('/finance-planning/pnl', { params: { planId } });
    return response.data;
  },

  getCashflow: async (planId: string) => {
    const response = await apiClient.get('/finance-planning/cashflow', { params: { planId } });
    return response.data;
  },
};
