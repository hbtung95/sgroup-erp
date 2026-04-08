import { apiClient } from '../../../core/api/apiClient';

export const legalApi = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await apiClient.get('/legal/dashboard');
    return res.data;
  },

  // Project Docs
  getProjectDocs: async (projectId: string, params: any = {}) => {
    const res = await apiClient.get(`/legal/projects/${projectId}/docs`, { params });
    return res.data;
  },
  createProjectDoc: async (projectId: string, data: any) => {
    const res = await apiClient.post(`/legal/projects/${projectId}/docs`, data);
    return res.data;
  },
  updateProjectDoc: async (docId: string, data: any) => {
    const res = await apiClient.put(`/legal/projects/docs/${docId}`, data);
    return res.data;
  },
  deleteProjectDoc: async (docId: string) => {
    const res = await apiClient.delete(`/legal/projects/docs/${docId}`);
    return res.data;
  },

  // Transaction Docs
  getTransactionDocs: async (dealId: string, params: any = {}) => {
    const res = await apiClient.get(`/legal/deals/${dealId}/docs`, { params });
    return res.data;
  },
  createTransactionDoc: async (dealId: string, data: any) => {
    const res = await apiClient.post(`/legal/deals/${dealId}/docs`, data);
    return res.data;
  },
  updateTransactionDoc: async (docId: string, data: any) => {
    const res = await apiClient.put(`/legal/deals/docs/${docId}`, data);
    return res.data;
  },
  deleteTransactionDoc: async (docId: string) => {
    const res = await apiClient.delete(`/legal/deals/docs/${docId}`);
    return res.data;
  },

  // Templates
  getTemplates: async (params: any = {}) => {
    const res = await apiClient.get('/legal/templates', { params });
    return res.data;
  },
  createTemplate: async (data: any) => {
    const res = await apiClient.post('/legal/templates', data);
    return res.data;
  },
  updateTemplate: async (templateId: string, data: any) => {
    const res = await apiClient.put(`/legal/templates/${templateId}`, data);
    return res.data;
  },
  deleteTemplate: async (templateId: string) => {
    const res = await apiClient.delete(`/legal/templates/${templateId}`);
    return res.data;
  },

  // Upload
  uploadFile: async (fileUri: string, mimeType: string, filename: string) => {
    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
      uri: fileUri,
      type: mimeType,
      name: filename,
    });
    
    // Using apiClient but forcing Content-Type for multipart
    const res = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data, // Do not serialize to JSON
    });
    return res.data;
  }
};
