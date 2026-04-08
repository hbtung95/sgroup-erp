import axios from 'axios';

const marketingApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ? `${process.env.EXPO_PUBLIC_API_URL}/marketing` : 'http://localhost:3000/marketing',
  timeout: 10000,
});

marketingApi.interceptors.request.use(config => {
  return config; // Add auth tokens here
});

export const MarketingApi = {
  // Campaigns
  getCampaigns: async () => {
    const res = await marketingApi.get('/campaigns');
    return res.data;
  },
  getCampaignById: async (id: string) => {
    const res = await marketingApi.get(`/campaigns/${id}`);
    return res.data;
  },

  // Leads
  getLeads: async () => {
    const res = await marketingApi.get('/leads');
    return res.data;
  },
  createLead: async (data: any) => {
    const res = await marketingApi.post('/leads', data);
    return res.data;
  },
  updateLeadStatus: async (id: string, status: string) => {
    const res = await marketingApi.post(`/leads/${id}/status`, { status });
    return res.data;
  },

  // Planning
  getMasterPlan: async (year: number, scenarioKey: string) => {
    const res = await marketingApi.get('/planning/master-plan', { params: { year, scenarioKey } });
    return res.data;
  },
  getChannelBudgets: async (planId: string) => {
    const res = await marketingApi.get(`/planning/${planId}/budgets`);
    return res.data;
  },

  // Content
  getContents: async () => {
    const res = await marketingApi.get('/content');
    return res.data;
  },
  createContent: async (data: any) => {
    const res = await marketingApi.post('/content', data);
    return res.data;
  },

  // Analytics
  getChannelPerformance: async (year?: number, month?: number) => {
    const res = await marketingApi.get('/analytics/channel-performance', { params: { year, month } });
    return res.data;
  }
};
