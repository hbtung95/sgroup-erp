import { apiClient } from '../../../core/api/apiClient';

export const projectApi = {
  // Policies
  getPolicies: async (status?: string) => {
    const res = await apiClient.get('/projects/policies/all', { params: status ? { status } : {} });
    return res.data;
  },
  createPolicy: async (data: any) => {
    const res = await apiClient.post('/projects/policies', data);
    return res.data;
  },
  updatePolicy: async (id: string, data: any) => {
    const res = await apiClient.patch(`/projects/policies/${id}`, data);
    return res.data;
  },

  // Documents
  getDocs: async (projectId?: string) => {
    const res = await apiClient.get('/projects/docs/all', { params: projectId ? { projectId } : {} });
    return res.data;
  },
  createDoc: async (data: any) => {
    const res = await apiClient.post('/projects/docs', data);
    return res.data;
  },

  // Assignments
  getAssignments: async (params?: { projectId?: string; status?: string }) => {
    const res = await apiClient.get('/projects/assignments/all', { params });
    return res.data;
  },
  createAssignment: async (data: any) => {
    const res = await apiClient.post('/projects/assignments', data);
    return res.data;
  },
  updateAssignment: async (id: string, data: any) => {
    const res = await apiClient.patch(`/projects/assignments/${id}`, data);
    return res.data;
  },
};
