/**
 * Entity-specific Repository Interfaces.
 * Each interface extends IRepository<T> with domain-specific methods
 * that both Prisma and Sheets adapters must implement.
 */
import { IRepository, IUpsertRepository } from './IRepository';

// ═══════════════════════════════════════════════════════════════
// Type Definitions (shared across adapters)
// ═══════════════════════════════════════════════════════════════

export interface UserEntity {
  id: string; email: string; name: string; password: string;
  role: string; department?: string; salesRole?: string; teamId?: string;
  createdAt: Date; updatedAt: Date;
}

export interface CustomerEntity {
  id: string; fullName: string; phone?: string; email?: string;
  source?: string; projectInterest?: string; budget?: string;
  status: string; assignedTo?: string; assignedName?: string;
  isVip: boolean; lastContactAt?: Date; note?: string;
  year: number; month: number; createdAt: Date; updatedAt: Date;
}

export interface ActivityEntity {
  id: string; date: Date; staffId: string; staffName?: string;
  postsCount: number; callsCount: number; newLeads: number;
  meetingsMade: number; note?: string;
  year: number; month: number; createdAt: Date; updatedAt: Date;
}

export interface AppointmentEntity {
  id: string; staffId: string; staffName?: string;
  customerId?: string; customerName?: string; customerPhone?: string;
  projectId?: string; projectName?: string;
  type: string; scheduledAt: Date; duration: number;
  location?: string; status: string; outcome?: string; note?: string;
  createdAt: Date; updatedAt: Date;
}

export interface ProductEntity {
  id: string; projectId: string; projectName?: string;
  code: string; block?: string; floor: number;
  area: number; price: number; direction?: string; bedrooms: number;
  status: string; bookedBy?: string; lockedUntil?: Date;
  customerPhone?: string; note?: string;
  createdAt: Date; updatedAt: Date;
}

export interface TeamEntity {
  id: string; code: string; name: string;
  leaderId?: string; leaderName?: string; region?: string;
  status: string; sortOrder: number;
  createdAt: Date; updatedAt: Date;
}

export interface StaffEntity {
  id: string; userId?: string; hrEmployeeId?: string; employeeCode?: string;
  fullName: string; phone?: string; email?: string;
  teamId?: string; role: string; status: string;
  joinDate?: Date; leaveDate?: Date;
  leadsCapacity: number; personalTarget: number;
  note?: string; createdAt: Date; updatedAt: Date;
}

export interface ProjectEntity {
  id: string; projectCode: string; name: string;
  developer?: string; location?: string; type?: string;
  feeRate: number; avgPrice: number;
  totalUnits: number; soldUnits: number;
  status: string; startDate?: Date; endDate?: Date;
  note?: string; createdAt: Date; updatedAt: Date;
}

export interface DealEntity {
  id: string; dealCode?: string; bizflyCrmId?: string;
  projectId?: string; projectName?: string;
  staffId?: string; staffName?: string;
  teamId?: string; teamName?: string;
  customerName?: string; customerPhone?: string;
  productCode?: string; productType?: string;
  dealValue: number; feeRate: number; commission: number;
  stage: string; dealDate?: Date; bookingDate?: Date; contractDate?: Date;
  source?: string; note?: string;
  year: number; month: number; status: string;
  createdAt: Date; updatedAt: Date;
}

export interface TargetEntity {
  id: string; year: number; month: number;
  teamId?: string; staffId?: string;
  targetGMV: number; targetDeals: number;
  targetLeads: number; targetMeetings: number; targetBookings: number;
  scenarioKey: string; note?: string;
  createdAt: Date; updatedAt: Date;
}

export interface CommissionEntity {
  id: string; dealId: string; staffId: string; staffName?: string;
  teamId?: string; role: string;
  dealValue: number; commissionRate: number; commissionAmount: number;
  status: string; period?: string;
  approvedBy?: string; approvedAt?: Date; paidAt?: Date;
  year: number; month: number; note?: string;
  createdAt: Date; updatedAt: Date;
}

export interface BizflySyncLogEntity {
  id: string; syncType: string; syncDirection: string;
  status: string; recordsTotal: number;
  recordsSynced: number; recordsFailed: number;
  errorMessage?: string; startedAt: Date; completedAt?: Date;
  initiatedBy?: string; metadata?: string;
}

export interface AuditLogEntity {
  id: string; auditId: string; action: string;
  entity: string; entityId?: string;
  actorEmail?: string; meta?: string; createdAt: Date;
}

export interface SalesDailyEntity {
  id: string; date: Date; year: number; month: number; week: number;
  teamId?: string; staffId?: string;
  newLeads: number; meetings: number; bookings: number;
  deposits: number; contracts: number;
  completedDeals: number; cancelledDeals: number;
  gmv: number; revenue: number;
  source: string; syncedAt?: Date; createdAt: Date;
}

export interface PipelineSnapshotEntity {
  id: string; snapshotDate: Date; year: number; month: number;
  teamId?: string;
  leadCount: number; contactedCount: number; meetingCount: number;
  bookingCount: number; depositCount: number;
  contractCount: number; completedCount: number;
  totalPipelineValue: number;
  source: string; createdAt: Date;
}

// Planning entities use rawJson, so keep them simple
export interface ExecPlanLatestEntity {
  id: string; year: number; scenarioKey: string; tabKey: string;
  latestPlanId?: string; latestBundleId?: string;
  updatedAt: Date; updatedBy?: string;
  schemaVersion: string; rawJson?: string; note?: string;
}

export interface ExecKpiLatestEntity {
  id: string; year: number; scenarioKey: string; tabKey: string;
  kpiKey: string; value: number; unit?: string;
  sourcePlanId?: string; calcVersion?: string;
  updatedAt: Date; updatedBy?: string; note?: string;
}

export interface SalePlanLatestEntity {
  id: string; year: number; scenarioKey: string; planId: string;
  updatedAt: Date; updatedBy?: string; version?: string;
  rawJson?: string; note?: string;
}

export interface SalePlanHeaderEntity {
  id: string; planId: string; year: number; scenarioKey: string;
  ownerEmail?: string; status: string;
  targetGMV: number; avgDealValue: number; headcount: number;
  marketingRate: number; rateDeal: number;
  rateBooking: number; rateMeeting: number;
  note?: string; createdAt: Date; updatedAt: Date;
}

export interface MktPlanHeaderEntity {
  id: string; planId: string; year: number; scenarioKey: string;
  ownerEmail?: string; status: string;
  totalBudgetVnd: number; currency: string;
  note?: string; createdAt: Date; updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// Entity-Specific Repository Interfaces
// ═══════════════════════════════════════════════════════════════

export interface IUserRepository extends IRepository<UserEntity> {
  findByEmail(email: string): Promise<UserEntity | null>;
}

export interface ICustomerRepository extends IRepository<CustomerEntity> {
  getStats(filters?: { assignedTo?: string; year?: number; month?: number }): Promise<{
    total: number;
    byStatus: Record<string, number>;
    vipCount: number;
  }>;
}

export interface IActivityRepository extends IRepository<ActivityEntity> {
  getSummary(filters: {
    staffId?: string; year: number; month?: number;
  }): Promise<{
    totalEntries: number;
    postsCount: number; callsCount: number;
    newLeads: number; meetingsMade: number;
  }>;
}

export interface IAppointmentRepository extends IRepository<AppointmentEntity> {
  findToday(staffId: string): Promise<AppointmentEntity[]>;
}

export interface IProductRepository extends IRepository<ProductEntity> {
  getStats(projectId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    totalValue: number;
    availableValue: number;
  }>;
  atomicLock(id: string, bookedBy: string, lockedUntil: Date): Promise<boolean>;
  atomicUnlock(id: string): Promise<boolean>;
}

export interface ITeamRepository extends IRepository<TeamEntity> {}

export interface IStaffRepository extends IRepository<StaffEntity> {
  findByCode(code: string): Promise<StaffEntity | null>;
}

export interface IProjectRepository extends IRepository<ProjectEntity> {}

export interface IDealRepository extends IRepository<DealEntity> {
  getStats(filters: { year: number; month?: number; teamId?: string }): Promise<{
    total: number; totalGMV: number; totalRevenue: number;
    byStage: Record<string, number>;
  }>;
}

export interface ITargetRepository extends IRepository<TargetEntity> {
  upsertTarget(where: {
    year: number; month: number; teamId: string;
    staffId: string; scenarioKey: string;
  }, data: Partial<TargetEntity>): Promise<TargetEntity>;
}

export interface ICommissionRepository extends IRepository<CommissionEntity> {}

export interface IBizflySyncRepository extends IRepository<BizflySyncLogEntity> {
  findLatest(): Promise<BizflySyncLogEntity | null>;
  countByStatus(status: string): Promise<number>;
}

export interface IAuditLogRepository extends IRepository<AuditLogEntity> {}

export interface ISalesDailyRepository extends IRepository<SalesDailyEntity> {}

export interface IPipelineSnapshotRepository extends IRepository<PipelineSnapshotEntity> {}

export interface IExecPlanRepository extends IUpsertRepository<ExecPlanLatestEntity> {
  findByCompositeKey(year: number, scenarioKey: string, tabKey: string): Promise<ExecPlanLatestEntity | null>;
  getKpis(year: number, scenarioKey: string, tabKey: string): Promise<ExecKpiLatestEntity[]>;
}

export interface ISalePlanRepository {
  getLatest(year: number, scenarioKey: string): Promise<SalePlanLatestEntity | null>;
  getHeader(planId: string): Promise<SalePlanHeaderEntity | null>;
  getMonths(planId: string): Promise<any[]>;
  getTeams(planId: string): Promise<any[]>;
  getStaff(planId: string): Promise<any[]>;
}

export interface IMktPlanRepository {
  getHeader(planId: string): Promise<MktPlanHeaderEntity | null>;
  getChannelBudgets(planId: string): Promise<any[]>;
  getKpiTargets(planId: string): Promise<any[]>;
  getAssumptions(planId: string): Promise<any[]>;
}
