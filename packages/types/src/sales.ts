// ═══════════════════════════════════════════════════════════
// @sgroup/types — Sales Module Types
// ═══════════════════════════════════════════════════════════

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
  totalActivityPoints?: number;
  pointsKPI?: number;
  revenueKPI?: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  label: string;
  gmv: number;
  revenue: number;
  deals: number;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idCardNo?: string;
  address?: string;
  company?: string;
  source: string;
  assignedTo: string;
  assignedToName: string;
  teamId?: string;
  status: string;
  notes?: string;
  lastInteraction?: string;
  lastContactAt?: string;
  bizflyCrmId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productCode?: string;
  unitCode: string;
  price: number;
  commission: number;
  projectId?: string;
  projectName?: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  salesStaffId: string;
  salesTeamId?: string;
  status: string;
  priceAtLock: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  customer?: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface SalesDeal {
  id: string;
  dealCode: string;
  projectId?: string;
  projectName: string;
  staffId?: string;
  staffName: string;
  teamId?: string;
  teamName: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  productCode: string;
  productType: string;
  dealValue: number;
  feeRate: number;
  commission: number;
  source: string;
  year: number;
  month: number;
  stage: string;
  priority: string;
  expectedClose?: string;
  closedAt?: string;
  lostReason?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesTeam {
  id: string;
  name: string;
  code: string;
  managerId: string;
  managerName: string;
  parentId?: string;
  status: string;
  sortOrder: number;
  members?: SalesStaff[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesStaff {
  id: string;
  employeeCode: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  leadsCapacity: number;
  personalTarget: number;
  teamId?: string;
  team?: SalesTeam;
  createdAt: string;
  updatedAt: string;
}

export interface SalesBooking {
  id: string;
  projectName: string;
  unitCode: string;
  customerName: string;
  customerPhone: string;
  bookingAmount: number;
  staffName?: string;
  teamName?: string;
  status: string;
  bookingDate: string;
  createdAt: string;
}

export interface SalesDeposit {
  id: string;
  projectName: string;
  unitCode: string;
  customerName: string;
  depositAmount: number;
  staffName?: string;
  status: string;
  depositDate: string;
}
