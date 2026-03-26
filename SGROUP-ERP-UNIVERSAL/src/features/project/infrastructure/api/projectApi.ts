import { apiClient } from '../../../../core/api/apiClient';

export interface GenerateInventoryParams {
  blocks: string[];
  fromFloor: number;
  toFloor: number;
  unitsPerFloor: number;
  codePattern: string;
  defaultArea: number;
  defaultPrice: number;
  defaultBedrooms: number;
}

export const projectApi = {
  // Projects
  getProjects: async () => {
    const res = await apiClient.get('/projects');
    return res.data;
  },
  getProject: async (id: string) => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data;
  },
  createProject: async (data: any) => {
    const res = await apiClient.post('/projects', data);
    return res.data;
  },
  updateProject: async (id: string, data: any) => {
    const res = await apiClient.patch(`/projects/${id}`, data);
    return res.data;
  },
  deleteProject: async (id: string) => {
    const res = await apiClient.delete(`/projects/${id}`);
    return res.data;
  },

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
  
  // Products
  batchCreateProducts: async (projectId: string, products: any[]) => {
    const res = await apiClient.post(`/projects/${projectId}/products/batch`, { products });
    return res.data;
  },
  getProducts: async (projectId: string) => {
    const res = await apiClient.get(`/projects/${projectId}/products`);
    return res.data;
  },
  createProduct: async (projectId: string, data: any) => {
    const res = await apiClient.post(`/projects/${projectId}/products`, data);
    return res.data;
  },
  updateProduct: async (projectId: string, id: string, data: any) => {
    const res = await apiClient.patch(`/projects/${projectId}/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (projectId: string, id: string) => {
    const res = await apiClient.delete(`/projects/${projectId}/products/${id}`);
    return res.data;
  },
  lockProduct: async (projectId: string, id: string, staffName?: string) => {
    const res = await apiClient.post(`/projects/${projectId}/products/${id}/lock`, { staffName });
    return res.data;
  },
  unlockProduct: async (projectId: string, id: string) => {
    const res = await apiClient.post(`/projects/${projectId}/products/${id}/unlock`);
    return res.data;
  },
  generateInventory: async (projectId: string, params: GenerateInventoryParams) => {
    const res = await apiClient.post(`/projects/${projectId}/products/generate`, params);
    return res.data;
  },
};
