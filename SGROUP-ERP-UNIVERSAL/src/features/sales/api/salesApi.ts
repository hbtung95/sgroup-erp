/**
 * @deprecated Use apiClient from core/api/apiClient.ts instead.
 * All hooks have been migrated to TanStack Query + apiClient.
 * This file is kept temporarily for backward compatibility.
 *
 * SGROUP ERP — Sales API Client (Legacy)
 */
import { API_BASE_URL } from '../../../core/api/api';

const API_BASE = API_BASE_URL;

let _authToken: string | null = null;

export function setSalesApiToken(token: string | null) {
  _authToken = token;
}

async function request<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `API Error ${res.status}`);
  }

  return res.json();
}

function qs(params: Record<string, any>): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

// ── CUSTOMERS ──

export const customersApi = {
  list: (filters?: Record<string, any>) =>
    request(`/customers${qs(filters || {})}`),
  getById: (id: string) =>
    request(`/customers/${id}`),
  create: (data: any) =>
    request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request(`/customers/${id}`, { method: 'DELETE' }),
  stats: (filters?: Record<string, any>) =>
    request(`/customers/stats${qs(filters || {})}`),
};

// ── ACTIVITIES ──

export const activitiesApi = {
  list: (filters?: Record<string, any>) =>
    request(`/activities${qs(filters || {})}`),
  getById: (id: string) =>
    request(`/activities/${id}`),
  create: (data: any) =>
    request('/activities', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/activities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request(`/activities/${id}`, { method: 'DELETE' }),
  summary: (filters?: Record<string, any>) =>
    request(`/activities/summary${qs(filters || {})}`),
};

// ── APPOINTMENTS ──

export const appointmentsApi = {
  list: (filters?: Record<string, any>) =>
    request(`/appointments${qs(filters || {})}`),
  getById: (id: string) =>
    request(`/appointments/${id}`),
  today: (staffId: string) =>
    request(`/appointments/today?staffId=${staffId}`),
  create: (data: any) =>
    request('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request(`/appointments/${id}`, { method: 'DELETE' }),
};

// ── PRODUCTS (Inventory) ──

export const productsApi = {
  list: (filters?: Record<string, any>) =>
    request(`/products${qs(filters || {})}`),
  getById: (id: string) =>
    request(`/products/${id}`),
  create: (data: any) =>
    request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  lock: (id: string, data: { bookedBy: string; durationMinutes?: number }) =>
    request(`/products/${id}/lock`, { method: 'POST', body: JSON.stringify(data) }),
  requestDeposit: (id: string, data: { customerName: string; customerPhone: string }) =>
    request(`/products/${id}/deposit`, { method: 'POST', body: JSON.stringify(data) }),
  approveDeposit: (id: string) =>
    request(`/products/${id}/approve`, { method: 'POST' }),
  cancelBooking: (id: string) =>
    request(`/products/${id}/cancel`, { method: 'POST' }),
  stats: (projectId?: string) =>
    request(`/products/stats${qs({ projectId })}`),
};

// ── DEALS (from sales-ops) ──

export const dealsApi = {
  list: (filters?: Record<string, any>) =>
    request(`/sales-ops/deals${qs(filters || {})}`),
  getById: (id: string) =>
    request(`/sales-ops/deals/${id}`),
  create: (data: any) =>
    request('/sales-ops/deals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/sales-ops/deals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  stats: (filters?: Record<string, any>) =>
    request(`/sales-ops/deals/stats${qs(filters || {})}`),
};

// ── TEAMS (from sales-ops) ──

export const teamsApi = {
  list: (filters?: Record<string, any>) =>
    request(`/sales-ops/teams${qs(filters || {})}`),
  getById: (id: string) =>
    request(`/sales-ops/teams/${id}`),
  create: (data: any) =>
    request('/sales-ops/teams', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/sales-ops/teams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request(`/sales-ops/teams/${id}`, { method: 'DELETE' }),
};

// ── STAFF (from sales-ops) ──

export const staffApi = {
  list: (filters?: Record<string, any>) =>
    request(`/sales-ops/staff${qs(filters || {})}`),
  getById: (id: string) =>
    request(`/sales-ops/staff/${id}`),
  create: (data: any) =>
    request('/sales-ops/staff', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/sales-ops/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── PROJECTS (from sales-ops) ──

export const projectsApi = {
  list: (filters?: Record<string, any>) =>
    request(`/sales-ops/projects${qs(filters || {})}`),
  getById: (id: string) =>
    request(`/sales-ops/projects/${id}`),
  create: (data: any) =>
    request('/sales-ops/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/sales-ops/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── TARGETS (from sales-ops) ──

export const targetsApi = {
  list: (filters?: Record<string, any>) =>
    request(`/sales-ops/targets${qs(filters || {})}`),
  distribute: (data: any) =>
    request('/sales-ops/targets/distribute', { method: 'POST', body: JSON.stringify(data) }),
};

// ── REPORTS (from sales-report) ──

export const reportsApi = {
  kpiCards: (filters?: Record<string, any>) =>
    request(`/sales-report/kpi-cards${qs(filters || {})}`),
  planVsActual: (filters?: Record<string, any>) =>
    request(`/sales-report/plan-vs-actual${qs(filters || {})}`),
  teamPerformance: (filters?: Record<string, any>) =>
    request(`/sales-report/team-performance${qs(filters || {})}`),
  staffPerformance: (filters?: Record<string, any>) =>
    request(`/sales-report/staff-performance${qs(filters || {})}`),
  funnel: (filters?: Record<string, any>) =>
    request(`/sales-report/funnel${qs(filters || {})}`),
  commission: (filters?: Record<string, any>) =>
    request(`/sales-report/commission${qs(filters || {})}`),
  projectPerformance: (filters?: Record<string, any>) =>
    request(`/sales-report/project-performance${qs(filters || {})}`),
};
