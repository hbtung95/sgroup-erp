import { apiClient } from '../../../core/api/apiClient';

export interface ProjectData {
  id: string;
  projectCode: string;
  name: string;
  developer?: string;
  location?: string;
  type?: string;
  feeRate: number;
  avgPrice: number;
  totalUnits: number;
  soldUnits: number;
  status: string;
  startDate?: string;
  endDate?: string;
  note?: string;
  _count?: {
    legalDocs: number;
  };
}

export interface PropertyProductData {
  id: string;
  projectId: string;
  projectName?: string;
  code: string;
  block?: string;
  floor: number;
  area: number;
  price: number;
  direction?: string;
  bedrooms: number;
  status: string;
  bookedBy?: string;
  lockedUntil?: string;
  customerPhone?: string;
  note?: string;
}

export const projectApi = {
  // Projects
  getProjects: async (): Promise<ProjectData[]> => {
    return apiClient.get('/projects');
  },
  
  getProject: async (id: string): Promise<ProjectData> => {
    return apiClient.get(`/projects/${id}`);
  },
  
  createProject: async (data: Partial<ProjectData>): Promise<ProjectData> => {
    return apiClient.post('/projects', data);
  },
  
  updateProject: async (id: string, data: Partial<ProjectData>): Promise<ProjectData> => {
    return apiClient.patch(`/projects/${id}`, data);
  },
  
  deleteProject: async (id: string): Promise<void> => {
    return apiClient.delete(`/projects/${id}`);
  },

  // Products (Inventory)
  getProducts: async (projectId: string): Promise<PropertyProductData[]> => {
    return apiClient.get(`/projects/${projectId}/products`);
  },
  
  getProduct: async (productId: string): Promise<PropertyProductData> => {
    return apiClient.get(`/projects/products/${productId}`);
  },
  
  createProduct: async (projectId: string, data: Partial<PropertyProductData>): Promise<PropertyProductData> => {
    return apiClient.post(`/projects/${projectId}/products`, data);
  },
  
  updateProduct: async (productId: string, data: Partial<PropertyProductData>): Promise<PropertyProductData> => {
    return apiClient.patch(`/projects/products/${productId}`, data);
  },
  
  deleteProduct: async (productId: string): Promise<void> => {
    return apiClient.delete(`/projects/products/${productId}`);
  }
};
