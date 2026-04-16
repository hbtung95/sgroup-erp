import axios from 'axios';
import * as M from './salesMocks';

// ═══════════════════════════════════════════════════════════
// SALES API CLIENT — Centralized HTTP layer
// ═══════════════════════════════════════════════════════════

const API_BASE = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SALES_API_URL : undefined) || 'http://localhost:8083/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach auth token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: unwrap { data } wrapper
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error?.message || err.message || 'Network error';
    console.error('[Sales API]', message);
    return Promise.reject(new Error(message));
  }
);

// ═══ Types ═══

export interface PaginationMeta { total: number; page: number; limit: number; pages: number; }
export interface ApiResponse<T> { data: T; meta?: PaginationMeta; }
export interface ListFilter {
  search?: string; status?: string; teamId?: string; staffId?: string;
  projectId?: string; dateFrom?: string; dateTo?: string;
  sortBy?: string; sortDir?: string; page?: number; limit?: number;
}

import { Customer, Transaction, SalesDeal, SalesTeam, SalesStaff, SalesBooking } from '@sgroup/types';

export interface SalesActivity {
  id?: string;
  staffId?: string;
  staffName?: string;
  teamId?: string;
  activityType: 'CALL' | 'MEET' | 'DEAL_CLOSED' | 'MSG';
  points: number;
  value?: number;
  activityDate?: string;
  note?: string;
  createdAt?: string;
}

export interface KPIData {
  totalLeads: number;
  totalDeals: number;
  closedDeals: number;
  pendingApprovals: number;
  revenue: number;
  pipelineValue: number;
  conversionRate: number;
  avgDealSize: number;
  activeStaff: number;
  teamCount: number;
  totalActivityPoints: number;
  pointsKPI: number;
  revenueKPI: number;
}

export interface StageCount {
  stage: string; count: number; value: number;
}

export interface TeamPerformance {
  teamId: string; teamName: string; totalDeals: number;
  closedDeals: number; gmv: number; revenue: number; staffCount: number;
  totalActivityPoints: number;
}

export interface TopSeller {
  staffId: string; staffName: string; teamName: string;
  deals: number; gmv: number; revenue: number;
}

// ═══ MOCK WRAPPER ═══

const mockDelay = <T>(data: T, ms = 400): Promise<ApiResponse<T>> => 
  new Promise(res => setTimeout(() => res({ data }), ms));

// ═══ Dashboard API ═══
export const dashboardApi = {
  getKPIs: () => mockDelay(M.MOCK_KPIS),
  getMonthlyRevenue: (_year?: number) => mockDelay(M.MOCK_MONTHLY_REVENUE),
  getRecentTransactions: (limit?: number) => mockDelay(M.MOCK_TRANSACTIONS.slice(0, limit || 5)),
  getPipelineSummary: () => mockDelay(M.MOCK_PIPELINE),
  getTeamPerformance: () => mockDelay(M.MOCK_TEAM_PERF),
  getTopSellers: (limit?: number) => mockDelay(M.MOCK_TOP_SELLERS.slice(0, limit || 10)),
};

// ═══ Customer API ═══
export const customerApi = {
  list: (_f?: ListFilter) => mockDelay(M.MOCK_CUSTOMERS),
  getById: (id: string) => mockDelay(M.MOCK_CUSTOMERS.find(c => c.id === id) || M.MOCK_CUSTOMERS[0]),
  // Disabling writes
  create: (_d: Partial<Customer>) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<Customer>>,
  update: (_i: string, _d: Partial<Customer>) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<Customer>>,
  delete: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<void>>,
};

// ═══ Transaction API ═══
export const transactionApi = {
  list: (_f?: ListFilter) => mockDelay(M.MOCK_TRANSACTIONS),
  listTeam: (_f?: ListFilter) => mockDelay(M.MOCK_TRANSACTIONS),
  requestLock: (_d: unknown) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<Transaction>>,
  approveLock: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<Transaction>>,
  rejectLock: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<Transaction>>,
  markDeposit: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<Transaction>>,
  markSold: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<Transaction>>,
};

// ═══ Sales Ops API ═══
export const salesOpsApi = {
  listBookings: (_f?: ListFilter) => mockDelay([] as SalesBooking[]),
  createBooking: (_d: unknown) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<SalesBooking>>,
  approveBooking: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<SalesBooking>>,
  rejectBooking: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<SalesBooking>>,
  listDeposits: (_f?: ListFilter) => mockDelay([] as unknown[]),
  createDeposit: (_d: unknown) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<unknown>>,
  confirmDeposit: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<unknown>>,
  cancelDeposit: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<unknown>>,
  listDeals: (_f?: ListFilter) => mockDelay(M.MOCK_DEALS),
  createDeal: (_d: unknown) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<SalesDeal>>,
  createActivity: (data: Partial<SalesActivity>) => mockDelay(data as SalesActivity),
};

// ═══ Team & Staff API ═══
export const teamApi = {
  list: (_f?: ListFilter) => mockDelay(M.MOCK_TEAMS),
  getById: (i: string) => mockDelay(M.MOCK_TEAMS.find(t => t.id === i) || M.MOCK_TEAMS[0]),
  create: (_d: unknown) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<SalesTeam>>,
  update: (_i: string, _d: unknown) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<SalesTeam>>,
  delete: (_i: string) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<void>>,
};

export const staffApi = {
  list: (_f?: ListFilter) => mockDelay(M.MOCK_STAFF),
  getById: (i: string) => mockDelay(M.MOCK_STAFF.find(t => t.id === i) || M.MOCK_STAFF[0]),
  create: (_d: unknown) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<SalesStaff>>,
  update: (_i: string, _d: unknown) => Promise.reject(new Error("Read Only. Synced from CRM.")) as Promise<ApiResponse<SalesStaff>>,
};

export default api;
