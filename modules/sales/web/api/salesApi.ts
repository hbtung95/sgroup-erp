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
  postsCount: number;
  callsCount: number;
  newLeads: number;
  meetingsMade: number;
  siteVisits?: number;
  points?: number;
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

// ═══ Local Mock State (seeded from salesMocks) ═══
let MOCK_ACTIVITIES: SalesActivity[] = [...M.MOCK_ACTIVITIES_SEED];
let MOCK_BOOKINGS_STATE = [...M.MOCK_BOOKINGS];
let MOCK_DEPOSITS_STATE = [...M.MOCK_DEPOSITS];
let MOCK_DEALS_STATE: SalesDeal[] = [...M.MOCK_DEALS];

const uid = () => Math.random().toString(36).substring(2, 9);

// ═══ Sales Ops API (Fully Mocked for Frontend-only dev) ═══
export const salesOpsApi = {
  // Activities
  listActivities: (_f?: ListFilter) => mockDelay(MOCK_ACTIVITIES),
  createActivity: (data: Partial<SalesActivity>) => {
    const newAct: SalesActivity = {
      id: uid(), staffId: 'S1', staffName: 'Nguyễn Demo', teamId: 'T1',
      postsCount: data.postsCount || 0, callsCount: data.callsCount || 0,
      newLeads: data.newLeads || 0, meetingsMade: data.meetingsMade || 0,
      siteVisits: data.siteVisits || 0,
      points: (data.newLeads||0)*1 + (data.meetingsMade||0)*10 + (data.siteVisits||0)*20,
      activityDate: new Date().toISOString(), note: data.note || '', createdAt: new Date().toISOString(),
    };
    MOCK_ACTIVITIES = [newAct, ...MOCK_ACTIVITIES];
    return mockDelay(newAct);
  },
  
  // Bookings
  listBookings: (_f?: ListFilter) => mockDelay(MOCK_BOOKINGS_STATE as unknown as SalesBooking[]),
  createBooking: (data: Partial<SalesBooking>) => {
    const b = { ...data, id: `BK-${uid()}`, status: 'PENDING', bookingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), year: 2026, month: 4,
      staffId: 'S1', staffName: 'Nguyễn Demo', teamName: 'BD Zone 1' };
    MOCK_BOOKINGS_STATE = [b, ...MOCK_BOOKINGS_STATE];
    return mockDelay(b as unknown as SalesBooking);
  },
  updateBooking: (id: string, data: Partial<SalesBooking>) => {
    MOCK_BOOKINGS_STATE = MOCK_BOOKINGS_STATE.map(b => 
      b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
    );
    const updated = MOCK_BOOKINGS_STATE.find(b => b.id === id);
    return mockDelay(updated as unknown as SalesBooking);
  },
  approveBooking: (id: string) => {
    MOCK_BOOKINGS_STATE = MOCK_BOOKINGS_STATE.map(b => b.id === id ? { ...b, status: 'APPROVED', reviewedByName: 'Manager', reviewedAt: new Date().toISOString() } : b);
    return mockDelay({ success: true } as unknown as SalesBooking);
  },
  rejectBooking: (id: string) => {
    MOCK_BOOKINGS_STATE = MOCK_BOOKINGS_STATE.map(b => b.id === id ? { ...b, status: 'REJECTED', reviewedByName: 'Manager', reviewedAt: new Date().toISOString() } : b);
    return mockDelay({ success: true } as unknown as SalesBooking);
  },
  
  // Deposits
  listDeposits: (_f?: ListFilter) => mockDelay(MOCK_DEPOSITS_STATE as unknown as SalesBooking[]),
  createDeposit: (data: Partial<SalesBooking>) => {
    const d = { ...data, id: `DP-${uid()}`, status: 'PENDING', depositDate: new Date().toISOString(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), year: 2026, month: 4,
      staffId: 'S1', staffName: 'Nguyễn Demo', teamName: 'BD Zone 1' };
    MOCK_DEPOSITS_STATE = [d, ...MOCK_DEPOSITS_STATE];
    return mockDelay(d as unknown as SalesBooking);
  },
  updateDeposit: (id: string, data: Partial<SalesBooking>) => {
    MOCK_DEPOSITS_STATE = MOCK_DEPOSITS_STATE.map(d => 
      d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
    );
    const updated = MOCK_DEPOSITS_STATE.find(d => d.id === id);
    return mockDelay(updated as unknown as SalesBooking);
  },
  confirmDeposit: (id: string) => {
    MOCK_DEPOSITS_STATE = MOCK_DEPOSITS_STATE.map(d => d.id === id ? { ...d, status: 'CONFIRMED', confirmedAt: new Date().toISOString() } : d);
    return mockDelay({ success: true } as unknown as SalesBooking);
  },
  cancelDeposit: (id: string) => {
    MOCK_DEPOSITS_STATE = MOCK_DEPOSITS_STATE.map(d => d.id === id ? { ...d, status: 'CANCELLED' } : d);
    return mockDelay({ success: true } as unknown as SalesBooking);
  },
  
  // Deals
  listDeals: (_f?: ListFilter) => mockDelay(MOCK_DEALS_STATE),
  createDeal: (data: Partial<SalesDeal>) => {
    const deal: SalesDeal = { ...data, id: `DL-${uid()}`, dealCode: `GD-${uid()}`,
      commission: (data.dealValue || 0) * ((data.feeRate || 3) / 100),
      stage: 'PROSPECTING', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    MOCK_DEALS_STATE = [deal, ...MOCK_DEALS_STATE];
    return mockDelay(deal);
  },
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
