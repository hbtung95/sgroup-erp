import type {
  REProject, REProduct, RELegalDoc,
  ApiResponse, CreateProjectPayload, CreateProductPayload
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `API Error ${res.status}`);
  }

  return res.json();
}

// ─── Projects ───

export const projectApi = {
  list: (page = 1, limit = 20, search = '') =>
    apiFetch<ApiResponse<REProject[]>>(
      `/projects?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`
    ),

  get: (id: string) =>
    apiFetch<ApiResponse<REProject>>(`/projects/${id}`),

  create: (data: CreateProjectPayload) =>
    apiFetch<ApiResponse<REProject>>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<REProject>) =>
    apiFetch<ApiResponse<REProject>>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse<{ message: string }>>(`/projects/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Products (Inventory) ───

export const productApi = {
  listByProject: (projectId: string, page = 1, limit = 50) =>
    apiFetch<ApiResponse<REProduct[]>>(
      `/projects/${projectId}/products?page=${page}&limit=${limit}`
    ),

  create: (projectId: string, data: CreateProductPayload) =>
    apiFetch<ApiResponse<REProduct>>(`/projects/${projectId}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  lock: (id: string, payload: { bookedBy: string; customerName: string; customerPhone: string }) =>
    apiFetch<ApiResponse<{ message: string }>>(`/products/${id}/lock`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  bulkLock: (productIds: string[], payload: { bookedBy: string; customerName: string; customerPhone: string }) =>
    apiFetch<ApiResponse<{ message: string; count: number }>>(`/products/bulk-lock`, {
      method: 'POST',
      body: JSON.stringify({ productIds, ...payload }),
    }),

  unlock: (id: string, requestedBy: string, isAdmin = false) =>
    apiFetch<ApiResponse<{ message: string }>>(`/products/${id}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ requestedBy, isAdmin }),
    }),

  bulkUnlock: (productIds: string[], requestedBy: string, isAdmin = false) =>
    apiFetch<ApiResponse<{ message: string; count: number }>>(`/products/bulk-unlock`, {
      method: 'POST',
      body: JSON.stringify({ productIds, requestedBy, isAdmin }),
    }),

  deposit: (id: string, requestedBy: string) =>
    apiFetch<ApiResponse<{ message: string }>>(`/products/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ requestedBy }),
    }),

  sold: (id: string, requestedBy: string) =>
    apiFetch<ApiResponse<{ message: string }>>(`/products/${id}/sold`, {
      method: 'POST',
      body: JSON.stringify({ requestedBy }),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse<{ message: string }>>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// ─── Legal Docs ───

export const legalDocApi = {
  listByProject: (projectId: string) =>
    apiFetch<ApiResponse<RELegalDoc[]>>(`/projects/${projectId}/docs`),

  upload: (projectId: string, data: Partial<RELegalDoc>) =>
    apiFetch<ApiResponse<RELegalDoc>>(`/projects/${projectId}/docs`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (projectId: string, docId: string, status: string) =>
    apiFetch<ApiResponse<{ message: string }>>(`/projects/${projectId}/docs/${docId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  delete: (projectId: string, docId: string) =>
    apiFetch<ApiResponse<{ message: string }>>(`/projects/${projectId}/docs/${docId}`, {
      method: 'DELETE',
    }),
};
