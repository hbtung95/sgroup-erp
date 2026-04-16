// ═══════════════════════════════════════════════════════════
// SALES MOCKS — Rich dataset for local 10/10 UI representation
// ═══════════════════════════════════════════════════════════

import { KPIData, MonthlyRevenue, Customer, Transaction, SalesDeal, SalesTeam, SalesStaff, Team, Employee } from '@sgroup/types';
import { StageCount, TeamPerformance, TopSeller } from "./salesApi";
import { erpMockBFF } from '../../../../core/web-host/src/api/erpMockBFF';

// ── KPI Dashboard ──
export const MOCK_KPIS: KPIData = {
  totalLeads: 1250,
  totalDeals: 342,
  closedDeals: 156,
  pendingApprovals: 12,
  revenue: 45000000000, // 45 Tỷ
  pipelineValue: 120000000000, // 120 Tỷ
  conversionRate: 12.5,
  avgDealSize: 288000000,
  activeStaff: 45,
  teamCount: 4,
  totalActivityPoints: 85400,
  pointsKPI: 75.3,
  revenueKPI: 62.4
};

// ── Monthly Revenue ──
export const MOCK_MONTHLY_REVENUE: MonthlyRevenue[] = [
  { year: 2026, month: 1, label: 'Tháng 1', gmv: 8500000000, revenue: 350000000, deals: 25 },
  { year: 2026, month: 2, label: 'Tháng 2', gmv: 12000000000, revenue: 500000000, deals: 32 },
  { year: 2026, month: 3, label: 'Tháng 3', gmv: 9500000000, revenue: 420000000, deals: 28 },
  { year: 2026, month: 4, label: 'Tháng 4', gmv: 15000000000, revenue: 650000000, deals: 45 }, // Current peak
];



// ── Staff & Teams ──
export const MOCK_TEAMS: SalesTeam[] = erpMockBFF.hr.teams
  .filter((t: Team) => t.departmentId === '1') // Kinh Doanh
  .map((t: Team) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    managerId: 'S1',
    managerName: 'Ngô Việt',
    status: 'ACTIVE',
    sortOrder: 1,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  }));

export const MOCK_STAFF: SalesStaff[] = erpMockBFF.hr.employees
  .filter((e: Employee) => e.departmentId === '1' || e.departmentId === 1) // Kinh Doanh
  .map((e: Employee) => ({
    id: e.id,
    employeeCode: e.employeeCode || '',
    fullName: e.fullName,
    phone: e.phone || '',
    email: e.email,
    role: e.position?.name === 'Trưởng phòng' ? 'LEADER' : 'MEMBER',
    status: 'ACTIVE',
    leadsCapacity: 50,
    personalTarget: 2000000000,
    teamId: e.team?.id || MOCK_TEAMS[0]?.id,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  }));

// ── Customers ──
export const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `C${i + 1}`,
  fullName: ['Trần Lê Hải', 'Ngô Thị Vàng', 'Lâm Chấn Phong', 'Đào Thuỳ Trang', 'Phan Văn Khoa'][i % 5] + ` ${i}`,
  phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
  email: `client${i}@example.com`,
  company: ['Vingroup', 'Masan', 'FPT', 'Techcombank', 'Cá nhân'][i % 5],
  source: ['Facebook', 'Google Ads', 'Referral', 'Walk-in'][i % 4],
  assignedTo: MOCK_STAFF[i % MOCK_STAFF.length]?.id || 'S1',
  assignedToName: MOCK_STAFF[i % MOCK_STAFF.length]?.fullName || 'Unknown',
  teamId: MOCK_STAFF[i % MOCK_STAFF.length]?.teamId || 'T1',
  status: ['COLD', 'WARM', 'HOT', 'WON', 'LOST'][i % 5],
  notes: 'Đã tư vấn sơ bộ, đợi khách hàng phản hồi.',
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-04-10T10:00:00Z',
}));

// ── Transactions (Kanban) ──
export const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 12 }).map((_, i) => {
  const c = MOCK_CUSTOMERS[i];
  // Use BFF products instead of direct import
  const product = erpMockBFF.project.products[i % erpMockBFF.project.products.length];
  const project = erpMockBFF.project.projects.find(p => p.id === product.projectId);
  return {
    id: `TX${i + 1}`,
    productId: product.id,
    productCode: product.code,
    unitCode: product.code,
    price: product.price,
    commission: product.commissionAmt || 0,
    projectId: project?.id,
    projectName: project?.name,
    customerId: c.id,
    customerName: c.fullName,
    customerPhone: c.phone,
    salesStaffId: c.assignedTo || 'S1',
    status: ['NEW', 'LOCKED', 'DEPOSITED', 'SOLD'][i % 4],
    priceAtLock: product.price,
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-04-12T10:00:00Z',
  };
});

// ── Sales Deals ──
export const MOCK_DEALS: SalesDeal[] = MOCK_TRANSACTIONS.map(tx => ({
  id: tx.id + '_DL',
  dealCode: `DL-${tx.id}`,
  projectId: tx.projectId,
  projectName: tx.projectName || '',
  staffName: MOCK_STAFF.find(s => s.id === tx.salesStaffId)?.fullName || '',
  teamName: MOCK_TEAMS.find(t => t.id === MOCK_STAFF.find(s => s.id === tx.salesStaffId)?.teamId)?.name || 'BD Zone 1',
  customerName: tx.customerName || '',
  customerPhone: tx.customerPhone || '',
  productCode: tx.unitCode,
  productType: 'Căn hộ',
  dealValue: tx.price,
  feeRate: 3,
  commission: tx.commission,
  source: 'CRM',
  year: 2026,
  month: 4,
  stage: tx.status,
  priority: 'HIGH',
  createdAt: tx.createdAt,
  updatedAt: tx.updatedAt,
}));

// ── Analytics Models ──
export const MOCK_PIPELINE: StageCount[] = [
  { stage: 'Tiềm năng', count: 45, value: 12000000000 },
  { stage: 'Mới gặp', count: 32, value: 8500000000 },
  { stage: 'Đã Lock', count: 18, value: 5000000000 },
  { stage: 'Đã Cọc', count: 7, value: 2000000000 },
];

export const MOCK_TEAM_PERF: TeamPerformance[] = MOCK_TEAMS.map((t, i) => ({
  teamId: t.id,
  teamName: t.name,
  totalDeals: 150 + i * 10,
  closedDeals: 45 + i * 5,
  gmv: 45000000000 - i * 5000000000,
  revenue: 1350000000 - i * 150000000,
  staffCount: 15,
  totalActivityPoints: 21350 - i * 1500
}));

export const MOCK_TOP_SELLERS: TopSeller[] = MOCK_STAFF.map(s => ({
  staffId: s.id,
  staffName: s.fullName,
  teamName: MOCK_TEAMS.find(t => t.id === s.teamId)?.name || 'BD Zone 1',
  deals: Math.floor(Math.random() * 20) + 5,
  gmv: Math.floor(Math.random() * 10000000000) + 2000000000,
  revenue: Math.floor(Math.random() * 300000000) + 50000000,
})).sort((a, b) => b.revenue - a.revenue);
