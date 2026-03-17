/**
 * Admin API — Stats + User Management
 */
import { apiClient } from '../../../core/api/apiClient';

export const adminApi = {
  // Dashboard stats
  getStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  // User management
  getUsers: async (params?: { search?: string; role?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  },

  updateUser: async (id: string, data: { role?: string; department?: string; name?: string }) => {
    const res = await apiClient.patch(`/admin/users/${id}`, data);
    return res.data;
  },
};
