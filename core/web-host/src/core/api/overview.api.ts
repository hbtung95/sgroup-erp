import { apiClient } from './apiClient';

export const OverviewAPI = {
  getDashboard: async (year: number) => {
    const response = await apiClient.get('/overview/dashboard', { params: { year } });
    return response.data;
  },

  getKpis: async (year: number) => {
    const response = await apiClient.get('/overview/kpis', { params: { year } });
    return response.data;
  },

  getAlerts: async () => {
    const response = await apiClient.get('/overview/alerts');
    return response.data;
  },

  getMarketingPerformance: async (year: number) => {
    const response = await apiClient.get('/overview/marketing-performance', { params: { year } });
    return response.data;
  },

  getSalesPerformance: async (year: number) => {
    const response = await apiClient.get('/overview/sales-performance', { params: { year } });
    return response.data;
  },

  getHRPerformance: async (year: number) => {
    const response = await apiClient.get('/overview/hr-performance', { params: { year } });
    return response.data;
  },

  getFinancePerformance: async (year: number) => {
    const response = await apiClient.get('/overview/finance-performance', { params: { year } });
    return response.data;
  },

  getAgencyPerformance: async (year: number) => {
    const response = await apiClient.get('/overview/agency-performance', { params: { year } });
    return response.data;
  },

  getSHomesPerformance: async (year: number) => {
    const response = await apiClient.get('/overview/shomes-performance', { params: { year } });
    return response.data;
  },

  getProjectPerformance: async (year: number) => {
    const response = await apiClient.get('/overview/project-performance', { params: { year } });
    return response.data;
  },

  getOpsPerformance: async (year: number) => {
    const response = await apiClient.get('/overview/ops-performance', { params: { year } });
    return response.data;
  },
};
