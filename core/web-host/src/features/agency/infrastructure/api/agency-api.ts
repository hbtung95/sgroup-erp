import { apiClient } from '../../../../core/api/apiClient';

export const AgencyApi = {
  getOverview: async () => {
    const res = await apiClient.get('/agency/overview');
    return res.data;
  },
  
  getAllAgencies: async () => {
    const res = await apiClient.get('/agency/list');
    return res.data;
  },

  createAgency: async (data: any) => {
    const res = await apiClient.post('/agency/create', data);
    return res.data;
  },

  processCommission: async (id: string, data: { amount: number, referenceId: string }) => {
    const res = await apiClient.post(`/agency/commission/${id}`, data);
    return res.data;
  }
};
