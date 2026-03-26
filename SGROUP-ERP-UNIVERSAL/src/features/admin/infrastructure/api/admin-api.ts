import axios from 'axios';

const adminApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ? `${process.env.EXPO_PUBLIC_API_URL}/admin` : 'http://localhost:3000/admin',
  timeout: 10000,
});

adminApi.interceptors.request.use(config => {
  return config; // Add auth tokens here
});

export const AdminApi = {
  // --- RBAC ---
  getPermissionsMatrix: async () => {
    const res = await adminApi.get('/rbac/matrix');
    return res.data;
  },
  updatePermission: async (role: string, module: string, permission: string, updatedBy: string) => {
    const res = await adminApi.post(`/rbac/${role}/${module}`, { permission, updatedBy });
    return res.data;
  },

  // --- Users ---
  getAllUsers: async () => {
    const res = await adminApi.get('/users');
    return res.data;
  },
  toggleUserStatus: async (id: string, isActive: boolean) => {
    const res = await adminApi.post(`/users/${id}/status`, { isActive });
    return res.data;
  },
  updateUserRole: async (id: string, role: string) => {
    const res = await adminApi.post(`/users/${id}/role`, { role });
    return res.data;
  },

  // --- Config & Flags ---
  getSettings: async () => {
    const res = await adminApi.get('/config/settings');
    return res.data;
  },
  updateSetting: async (key: string, value: string) => {
    const res = await adminApi.post(`/config/settings/${key}`, { value });
    return res.data;
  },
  getFeatureFlags: async () => {
    const res = await adminApi.get('/config/feature-flags');
    return res.data;
  },
  toggleFeatureFlag: async (key: string, enabled: boolean, updatedBy: string) => {
    const res = await adminApi.post(`/config/feature-flags/${key}/toggle`, { enabled, updatedBy });
    return res.data;
  },

  // --- Health ---
  getGlobalStats: async () => {
    const res = await adminApi.get('/health/stats');
    return res.data;
  },
  getHealthCheck: async () => {
    const res = await adminApi.get('/health/ping');
    return res.data;
  },

  // --- Audit Logs ---
  getAuditLogs: async (limit: number = 50, page: number = 1) => {
    const res = await adminApi.get('/audit-logs', { params: { limit, page } });
    return res.data;
  },
  getAuditAnalytics: async (days: number = 30) => {
    const res = await adminApi.get('/audit-logs/analytics', { params: { days } });
    return res.data;
  },

  // --- Security Sessions ---
  getUserSessions: async (userId: string) => {
    const res = await adminApi.get(`/sessions/user/${userId}`);
    return res.data;
  },
  revokeSession: async (sessionId: string) => {
    const res = await adminApi.post(`/sessions/${sessionId}/revoke`);
    return res.data;
  },
  revokeAllUserSessions: async (userId: string) => {
    const res = await adminApi.post(`/sessions/user/${userId}/revoke-all`);
    return res.data;
  }
};
