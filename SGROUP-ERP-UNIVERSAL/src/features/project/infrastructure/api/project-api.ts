import axios from 'axios';

const projectApi = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ? `${process.env.EXPO_PUBLIC_API_URL}/projects` : 'http://localhost:3000/projects',
  timeout: 10000,
});

projectApi.interceptors.request.use(config => {
  // const token = await SecureStore.getItemAsync('token');
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const ProjectApi = {
  // Project Core
  getProjects: async () => {
    const res = await projectApi.get('/core');
    return res.data;
  },
  getProjectById: async (id: string) => {
    const res = await projectApi.get(`/core/${id}`);
    return res.data;
  },

  // Property Products (Inventory)
  getProducts: async (projectId: string, params?: { skip?: number, take?: number, status?: string }) => {
    const res = await projectApi.get(`/${projectId}/products`, { params });
    return res.data;
  },
  lockProduct: async (projectId: string, productId: string, staffName?: string) => {
    const res = await projectApi.patch(`/${projectId}/products/${productId}/lock`, { staffName });
    return res.data;
  },
  unlockProduct: async (projectId: string, productId: string) => {
    const res = await projectApi.patch(`/${projectId}/products/${productId}/unlock`);
    return res.data;
  },

  // Policies
  getPolicies: async (status?: string) => {
    const res = await projectApi.get('/policies/all', { params: { status } });
    return res.data;
  },

  // Docs
  getDocs: async (projectId?: string) => {
    const res = await projectApi.get('/docs/all', { params: { projectId } });
    return res.data;
  },

  // Assignments
  getAssignments: async (projectId?: string, status?: string) => {
    const res = await projectApi.get('/assignments/all', { params: { projectId, status } });
    return res.data;
  }
};
