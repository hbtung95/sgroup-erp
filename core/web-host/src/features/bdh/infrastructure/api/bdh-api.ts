import { apiClient } from '../../../../core/api/apiClient';

export const BdhApi = {
  // --- DASHBOARD AGGREGATION ---
  getOverview: async () => {
    const res = await apiClient.get('/bdh/dashboard/overview');
    return res.data;
  },
  
  getDepartmentPulse: async (dept: 'SALES' | 'MK' | 'HR' | 'FINANCE') => {
    const res = await apiClient.get(`/bdh/dashboard/pulse/${dept}`);
    return res.data;
  },

  // --- PLANNING MATRIX ---
  getPlan: async (year: number, scenario: string, tab: string) => {
    const res = await apiClient.get('/bdh/planning', { params: { year, scenario, tab } });
    return res.data;
  },

  upsertPlan: async (year: number, scenario: string, tab: string, data: any) => {
    const res = await apiClient.post('/bdh/planning', data, { params: { year, scenario, tab } });
    return res.data;
  },

  getKpis: async (year: number, scenario: string, tab: string) => {
    const res = await apiClient.get('/bdh/planning/kpis', { params: { year, scenario, tab } });
    return res.data;
  }
};
