import { apiClient } from './apiClient';

export const SalesOpsAPI = {
  // ── TEAMS ──
  getTeams: async (status?: string) => {
    const response = await apiClient.get('/sales-ops/teams', { params: { status } });
    return response.data;
  },
  getTeamById: async (id: string) => {
    const response = await apiClient.get(`/sales-ops/teams/${id}`);
    return response.data;
  },
  createTeam: async (data: { code: string; name: string; leaderId?: string; leaderName?: string; region?: string }) => {
    const response = await apiClient.post('/sales-ops/teams', data);
    return response.data;
  },
  updateTeam: async (id: string, data: any) => {
    const response = await apiClient.patch(`/sales-ops/teams/${id}`, data);
    return response.data;
  },
  deleteTeam: async (id: string) => {
    const response = await apiClient.delete(`/sales-ops/teams/${id}`);
    return response.data;
  },

  // ── STAFF ──
  getStaff: async (params?: { teamId?: string; status?: string; role?: string }) => {
    const response = await apiClient.get('/sales-ops/staff', { params });
    return response.data;
  },
  getStaffById: async (id: string) => {
    const response = await apiClient.get(`/sales-ops/staff/${id}`);
    return response.data;
  },
  createStaff: async (data: any) => {
    const response = await apiClient.post('/sales-ops/staff', data);
    return response.data;
  },
  updateStaff: async (id: string, data: any) => {
    const response = await apiClient.patch(`/sales-ops/staff/${id}`, data);
    return response.data;
  },

  // ── PROJECTS ──
  getProjects: async (params?: { status?: string; type?: string }) => {
    const response = await apiClient.get('/sales-ops/projects', { params });
    return response.data;
  },
  getProjectById: async (id: string) => {
    const response = await apiClient.get(`/sales-ops/projects/${id}`);
    return response.data;
  },
  createProject: async (data: any) => {
    const response = await apiClient.post('/sales-ops/projects', data);
    return response.data;
  },
  updateProject: async (id: string, data: any) => {
    const response = await apiClient.patch(`/sales-ops/projects/${id}`, data);
    return response.data;
  },

  // ── DEALS ──
  getDeals: async (params?: { year?: number; month?: number; teamId?: string; staffId?: string; stage?: string; projectId?: string }) => {
    const response = await apiClient.get('/sales-ops/deals', { params });
    return response.data;
  },
  getDealById: async (id: string) => {
    const response = await apiClient.get(`/sales-ops/deals/${id}`);
    return response.data;
  },
  getDealStats: async (params: { year: number; month?: number; teamId?: string }) => {
    const response = await apiClient.get('/sales-ops/deals/stats', { params });
    return response.data;
  },
  createDeal: async (data: any) => {
    const response = await apiClient.post('/sales-ops/deals', data);
    return response.data;
  },
  updateDeal: async (id: string, data: any) => {
    const response = await apiClient.patch(`/sales-ops/deals/${id}`, data);
    return response.data;
  },

  // ── TARGETS ──
  getTargets: async (params: { year: number; month?: number; teamId?: string; staffId?: string; scenarioKey?: string }) => {
    const response = await apiClient.get('/sales-ops/targets', { params });
    return response.data;
  },
  distributeTargets: async (data: { year: number; scenarioKey: string; targets: any[] }) => {
    const response = await apiClient.post('/sales-ops/targets/distribute', data);
    return response.data;
  },
};
