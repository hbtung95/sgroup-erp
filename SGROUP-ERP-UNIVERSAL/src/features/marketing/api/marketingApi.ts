/**
 * SGROUP ERP — Marketing API Client
 * Connects to backend /marketing-planning/* endpoints
 */
import { API_BASE_URL } from '../../../core/api/api';

let _authToken: string | null = null;

export function setMarketingApiToken(token: string | null) {
  _authToken = token;
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

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

// ── MARKETING PLANNING ──

export const marketingPlanningApi = {
  getHeader: (planId: string) =>
    request(`/marketing-planning/header?planId=${planId}`),
  getChannelBudgets: (planId: string) =>
    request(`/marketing-planning/channel-budgets?planId=${planId}`),
  getKpiTargets: (planId: string) =>
    request(`/marketing-planning/kpi-targets?planId=${planId}`),
  getAssumptions: (planId: string) =>
    request(`/marketing-planning/assumptions?planId=${planId}`),
  getChannelROI: (planId: string) =>
    request(`/marketing-planning/channel-roi?planId=${planId}`),
};

// ── CAMPAIGNS (placeholder for future backend) ──

export const campaignsApi = {
  list: (filters?: Record<string, any>) =>
    request(`/marketing/campaigns${qs(filters || {})}`),
  getById: (id: string) =>
    request(`/marketing/campaigns/${id}`),
  create: (data: any) =>
    request('/marketing/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request(`/marketing/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── LEADS ──

export const marketingLeadsApi = {
  list: (filters?: Record<string, any>) =>
    request(`/marketing/leads${qs(filters || {})}`),
  stats: (filters?: Record<string, any>) =>
    request(`/marketing/leads/stats${qs(filters || {})}`),
};
