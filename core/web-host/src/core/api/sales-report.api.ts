import { apiClient } from './apiClient';

export const SalesReportAPI = {
  getKpiCards: async (params: { year: number; month?: number; teamId?: string; staffId?: string }) => {
    const response = await apiClient.get('/sales-report/kpi-cards', { params });
    return response.data;
  },
  getPlanVsActual: async (params: { year: number; scenarioKey?: string; teamId?: string }) => {
    const response = await apiClient.get('/sales-report/plan-vs-actual', { params });
    return response.data;
  },
  getTeamPerformance: async (params: { year: number; month?: number }) => {
    const response = await apiClient.get('/sales-report/team-performance', { params });
    return response.data;
  },
  getStaffPerformance: async (params: { year: number; month?: number; teamId?: string }) => {
    const response = await apiClient.get('/sales-report/staff-performance', { params });
    return response.data;
  },
  getActualFunnel: async (params: { year: number; month?: number; teamId?: string }) => {
    const response = await apiClient.get('/sales-report/funnel', { params });
    return response.data;
  },
  getCommissionReport: async (params: { year: number; month?: number; teamId?: string; staffId?: string; status?: string }) => {
    const response = await apiClient.get('/sales-report/commission', { params });
    return response.data;
  },
  getProjectPerformance: async (params: { year: number }) => {
    const response = await apiClient.get('/sales-report/project-performance', { params });
    return response.data;
  },
};
