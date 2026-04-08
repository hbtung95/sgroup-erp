import { apiClient } from './apiClient';

export const BizflySyncAPI = {
  triggerSync: async (data: { syncType: string; initiatedBy: string }) => {
    const response = await apiClient.post('/bizfly-sync/trigger', data);
    return response.data;
  },
  getSyncStatus: async () => {
    const response = await apiClient.get('/bizfly-sync/status');
    return response.data;
  },
  getSyncHistory: async (limit = 20) => {
    const response = await apiClient.get('/bizfly-sync/history', { params: { limit } });
    return response.data;
  },
  reconcile: async (data: { year: number; month?: number }) => {
    const response = await apiClient.post('/bizfly-sync/reconcile', data);
    return response.data;
  },
};
