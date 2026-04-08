import { apiClient } from '../../../core/api/apiClient';

export const marketingApi = {
  // Dashboard
  getDashboard: async () => {
    const res = await apiClient.get('/marketing/dashboard');
    return res.data;
  },

  // Campaigns
  getCampaigns: async (params?: { status?: string; channel?: string }) => {
    const res = await apiClient.get('/marketing/campaigns', { params });
    return res.data;
  },
  createCampaign: async (data: any) => {
    const res = await apiClient.post('/marketing/campaigns', data);
    return res.data;
  },
  updateCampaign: async (id: string, data: any) => {
    const res = await apiClient.patch(`/marketing/campaigns/${id}`, data);
    return res.data;
  },
  deleteCampaign: async (id: string) => {
    await apiClient.delete(`/marketing/campaigns/${id}`);
  },

  // Leads
  getLeads: async (params?: { status?: string; source?: string; campaignId?: string }) => {
    const res = await apiClient.get('/marketing/leads', { params });
    return res.data;
  },
  createLead: async (data: any) => {
    const res = await apiClient.post('/marketing/leads', data);
    return res.data;
  },
  updateLead: async (id: string, data: any) => {
    const res = await apiClient.patch(`/marketing/leads/${id}`, data);
    return res.data;
  },
  deleteLead: async (id: string) => {
    await apiClient.delete(`/marketing/leads/${id}`);
  },

  // Content
  getContent: async (params?: { status?: string; channel?: string }) => {
    const res = await apiClient.get('/marketing/content', { params });
    return res.data;
  },
  createContent: async (data: any) => {
    const res = await apiClient.post('/marketing/content', data);
    return res.data;
  },
  updateContent: async (id: string, data: any) => {
    const res = await apiClient.patch(`/marketing/content/${id}`, data);
    return res.data;
  },
  deleteContent: async (id: string) => {
    await apiClient.delete(`/marketing/content/${id}`);
  },

  // Channels
  getChannels: async (params?: { year?: string; month?: string }) => {
    const res = await apiClient.get('/marketing/channels', { params });
    return res.data;
  },
  upsertChannel: async (data: any) => {
    const res = await apiClient.post('/marketing/channels', data);
    return res.data;
  },

  // Budget
  getBudget: async () => {
    const res = await apiClient.get('/marketing/budget');
    return res.data;
  },
};

export const marketingPlanningApi = {
  getHeader: async (id: string) => {
    const res = await apiClient.get(`/marketing/planning/${id}/header`);
    return res.data;
  },
  getKpiTargets: async (id: string) => {
    const res = await apiClient.get(`/marketing/planning/${id}/kpis`);
    return res.data;
  },
  getAssumptions: async (id: string) => {
    const res = await apiClient.get(`/marketing/planning/${id}/assumptions`);
    return res.data;
  },
  getChannelBudgets: async (id: string) => {
    const res = await apiClient.get(`/marketing/planning/${id}/channels`);
    return res.data;
  },
};
