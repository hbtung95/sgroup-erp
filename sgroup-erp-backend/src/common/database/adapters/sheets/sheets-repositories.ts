/**
 * Google Sheets Adapters — Entity-specific repository implementations.
 * Each extends BaseSheetsRepository with domain-specific methods.
 */
import { Injectable } from '@nestjs/common';
import { SheetsClient } from './sheets-client';
import { BaseSheetsRepository } from './base-sheets.repository';
import {
  ICustomerRepository, IActivityRepository, IAppointmentRepository,
  IProductRepository, ITeamRepository, IStaffRepository,
  IProjectRepository, IDealRepository, ITargetRepository,
  ICommissionRepository, IUserRepository, IBizflySyncRepository,
  IAuditLogRepository, ISalesDailyRepository, IPipelineSnapshotRepository,
  CustomerEntity, ActivityEntity, AppointmentEntity,
  ProductEntity, TeamEntity, StaffEntity,
  ProjectEntity, DealEntity, TargetEntity,
  CommissionEntity, UserEntity, BizflySyncLogEntity,
  AuditLogEntity, SalesDailyEntity, PipelineSnapshotEntity,
} from '../../entity-repositories';
import {
  SHEET_NAMES,
  CUSTOMER_COLUMNS, ACTIVITY_COLUMNS, APPOINTMENT_COLUMNS,
  PRODUCT_COLUMNS, TEAM_COLUMNS, STAFF_COLUMNS,
  DEAL_COLUMNS, PROJECT_COLUMNS, TARGET_COLUMNS,
  COMMISSION_COLUMNS, USER_COLUMNS,
} from './column-mappings';

// ═══════════════════════════════════════════════════════════════
// CUSTOMER
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsCustomerRepository
  extends BaseSheetsRepository<CustomerEntity>
  implements ICustomerRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Customer, CUSTOMER_COLUMNS);
  }

  async getStats(filters?: { assignedTo?: string; year?: number; month?: number }) {
    const all = await this.findAll(filters as any);
    const byStatus = all.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      total: all.length,
      byStatus,
      vipCount: all.filter(c => c.isVip).length,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsActivityRepository
  extends BaseSheetsRepository<ActivityEntity>
  implements IActivityRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Activity, ACTIVITY_COLUMNS);
  }

  async findAll(filters?: Record<string, any>): Promise<ActivityEntity[]> {
    let entities = await super.findAll(filters);
    // Handle date range filters
    if (filters?.dateFrom) {
      const from = new Date(filters.dateFrom);
      entities = entities.filter(e => new Date(e.date) >= from);
    }
    if (filters?.dateTo) {
      const to = new Date(filters.dateTo);
      entities = entities.filter(e => new Date(e.date) <= to);
    }
    // Sort by date desc
    return entities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getSummary(filters: { staffId?: string; year: number; month?: number }) {
    const all = await this.findAll(filters as any);
    const totals = all.reduce(
      (acc, a) => ({
        postsCount: acc.postsCount + (a.postsCount || 0),
        callsCount: acc.callsCount + (a.callsCount || 0),
        newLeads: acc.newLeads + (a.newLeads || 0),
        meetingsMade: acc.meetingsMade + (a.meetingsMade || 0),
      }),
      { postsCount: 0, callsCount: 0, newLeads: 0, meetingsMade: 0 },
    );
    return { totalEntries: all.length, ...totals };
  }
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsAppointmentRepository
  extends BaseSheetsRepository<AppointmentEntity>
  implements IAppointmentRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Appointment, APPOINTMENT_COLUMNS);
  }

  async findAll(filters?: Record<string, any>): Promise<AppointmentEntity[]> {
    let entities = await super.findAll(filters);
    if (filters?.dateFrom) {
      const from = new Date(filters.dateFrom);
      entities = entities.filter(e => new Date(e.scheduledAt) >= from);
    }
    if (filters?.dateTo) {
      const to = new Date(filters.dateTo);
      entities = entities.filter(e => new Date(e.scheduledAt) <= to);
    }
    return entities.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  async findToday(staffId: string): Promise<AppointmentEntity[]> {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const all = await this.findAll({ staffId });
    return all.filter(a => {
      const t = new Date(a.scheduledAt).getTime();
      return t >= start.getTime() && t <= end.getTime() && a.status !== 'CANCELLED';
    });
  }

  async delete(id: string): Promise<AppointmentEntity | void> {
    // Soft delete: set status to CANCELLED
    const entity = await this.findById(id);
    if (entity) {
      await this.update(id, { status: 'CANCELLED' } as any);
      return { ...entity, status: 'CANCELLED' };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsProductRepository
  extends BaseSheetsRepository<ProductEntity>
  implements IProductRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Product, PRODUCT_COLUMNS);
  }

  async findAll(filters?: Record<string, any>): Promise<ProductEntity[]> {
    let entities = await super.findAll(filters);
    if (filters?.minPrice) entities = entities.filter(e => e.price >= filters.minPrice);
    if (filters?.maxPrice) entities = entities.filter(e => e.price <= filters.maxPrice);
    return entities.sort((a, b) => {
      if (a.block !== b.block) return (a.block || '').localeCompare(b.block || '');
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.code.localeCompare(b.code);
    });
  }

  async getStats(projectId?: string) {
    const all = await this.findAll(projectId ? { projectId } : undefined);
    const byStatus = all.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return {
      total: all.length,
      byStatus,
      totalValue: all.reduce((s, p) => s + Number(p.price || 0), 0),
      availableValue: all.filter(p => p.status === 'AVAILABLE').reduce((s, p) => s + Number(p.price || 0), 0),
    };
  }

  async atomicLock(id: string, bookedBy: string, lockedUntil: Date): Promise<boolean> {
    const entity = await this.findById(id);
    if (entity && entity.status === 'AVAILABLE') {
      await this.update(id, { status: 'LOCKED', bookedBy, lockedUntil } as any);
      return true;
    }
    return false;
  }

  async atomicUnlock(id: string): Promise<boolean> {
    const entity = await this.findById(id);
    if (entity && entity.status === 'LOCKED') {
      await this.update(id, { status: 'AVAILABLE', bookedBy: null, lockedUntil: null } as any);
      return true;
    }
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// TEAM
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsTeamRepository
  extends BaseSheetsRepository<TeamEntity>
  implements ITeamRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Team, TEAM_COLUMNS);
  }

  async findAll(filters?: Record<string, any>): Promise<TeamEntity[]> {
    const all = await super.findAll({ ...filters, status: filters?.status || 'ACTIVE' });
    return all.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
}

// ═══════════════════════════════════════════════════════════════
// STAFF
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsStaffRepository
  extends BaseSheetsRepository<StaffEntity>
  implements IStaffRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Staff, STAFF_COLUMNS);
  }

  async findAll(filters?: Record<string, any>): Promise<StaffEntity[]> {
    const status = filters?.status || 'ACTIVE';
    const all = await super.findAll({ ...filters, status });
    return all.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  async findByCode(code: string): Promise<StaffEntity | null> {
    const all = await this.findAll({});
    return all.find(s => s.employeeCode === code) || null;
  }
}

// ═══════════════════════════════════════════════════════════════
// PROJECT
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsProjectRepository
  extends BaseSheetsRepository<ProjectEntity>
  implements IProjectRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Project, PROJECT_COLUMNS);
  }

  async findAll(filters?: Record<string, any>): Promise<ProjectEntity[]> {
    const status = filters?.status || 'ACTIVE';
    const all = await super.findAll({ ...filters, status });
    return all.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// ═══════════════════════════════════════════════════════════════
// DEAL
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsDealRepository
  extends BaseSheetsRepository<DealEntity>
  implements IDealRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Deal, DEAL_COLUMNS);
  }

  async findAll(filters?: Record<string, any>): Promise<DealEntity[]> {
    const status = filters?.status || 'ACTIVE';
    const all = await super.findAll({ ...filters, status });
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getStats(filters: { year: number; month?: number; teamId?: string }) {
    const all = await this.findAll(filters as any);
    const total = all.length;
    const totalGMV = all.reduce((s, d) => s + Number(d.dealValue || 0), 0);
    const totalRevenue = all.reduce((s, d) => s + Number(d.commission || 0), 0);
    const byStage = all.reduce((acc, d) => {
      acc[d.stage] = (acc[d.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, totalGMV, totalRevenue, byStage };
  }
}

// ═══════════════════════════════════════════════════════════════
// TARGET
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsTargetRepository
  extends BaseSheetsRepository<TargetEntity>
  implements ITargetRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Target, TARGET_COLUMNS);
  }

  async findAll(filters?: Record<string, any>): Promise<TargetEntity[]> {
    const scenarioKey = filters?.scenarioKey || 'base';
    const all = await super.findAll({ ...filters, scenarioKey });
    return all.sort((a, b) => a.month - b.month);
  }

  async upsertTarget(
    where: { year: number; month: number; teamId: string; staffId: string; scenarioKey: string },
    data: Partial<TargetEntity>,
  ): Promise<TargetEntity> {
    const existing = await this.findAll(where as any);
    const match = existing.find(t =>
      t.year === where.year && t.month === where.month &&
      (t.teamId || '') === (where.teamId || '') &&
      (t.staffId || '') === (where.staffId || '') &&
      t.scenarioKey === where.scenarioKey,
    );
    if (match) {
      return this.update(match.id, data);
    }
    return this.create({ ...data, ...where } as any);
  }
}

// ═══════════════════════════════════════════════════════════════
// COMMISSION
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsCommissionRepository
  extends BaseSheetsRepository<CommissionEntity>
  implements ICommissionRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.Commission, COMMISSION_COLUMNS);
  }
}

// ═══════════════════════════════════════════════════════════════
// USER
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsUserRepository
  extends BaseSheetsRepository<UserEntity>
  implements IUserRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.User, USER_COLUMNS);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const all = await this.findAll({ email });
    return all[0] || null;
  }

  async delete(id: string): Promise<UserEntity> {
    // Hard delete for users
    const rows = await this.client.readSheet(this.sheetName);
    const row = rows.find(r => r.id === id);
    if (row) {
      await this.client.clearRow(this.sheetName, row._rowIndex);
      return this.toEntity(row);
    }
    throw new Error('User not found');
  }
}

// ═══════════════════════════════════════════════════════════════
// BIZFLY SYNC LOG
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsBizflySyncRepository
  extends BaseSheetsRepository<BizflySyncLogEntity>
  implements IBizflySyncRepository
{
  constructor(client: SheetsClient) {
    // Simple mapping — reuse id/status columns inline
    super(client, SHEET_NAMES.BizflySyncLog, [
      { sheetHeader: 'id', entityField: 'id', type: 'string', required: true },
      { sheetHeader: 'syncType', entityField: 'syncType', type: 'string' },
      { sheetHeader: 'syncDirection', entityField: 'syncDirection', type: 'string' },
      { sheetHeader: 'status', entityField: 'status', type: 'string' },
      { sheetHeader: 'recordsTotal', entityField: 'recordsTotal', type: 'number' },
      { sheetHeader: 'recordsSynced', entityField: 'recordsSynced', type: 'number' },
      { sheetHeader: 'recordsFailed', entityField: 'recordsFailed', type: 'number' },
      { sheetHeader: 'errorMessage', entityField: 'errorMessage', type: 'string' },
      { sheetHeader: 'startedAt', entityField: 'startedAt', type: 'date' },
      { sheetHeader: 'completedAt', entityField: 'completedAt', type: 'date' },
      { sheetHeader: 'initiatedBy', entityField: 'initiatedBy', type: 'string' },
      { sheetHeader: 'metadata', entityField: 'metadata', type: 'string' },
    ]);
  }

  async findLatest(): Promise<BizflySyncLogEntity | null> {
    const all = await this.findAll();
    if (all.length === 0) return null;
    return all.sort((a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )[0];
  }

  async countByStatus(status: string): Promise<number> {
    return this.count({ status });
  }
}

// ═══════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsAuditLogRepository
  extends BaseSheetsRepository<AuditLogEntity>
  implements IAuditLogRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.AuditLog, [
      { sheetHeader: 'id', entityField: 'id', type: 'string', required: true },
      { sheetHeader: 'auditId', entityField: 'auditId', type: 'string' },
      { sheetHeader: 'action', entityField: 'action', type: 'string' },
      { sheetHeader: 'entity', entityField: 'entity', type: 'string' },
      { sheetHeader: 'entityId', entityField: 'entityId', type: 'string' },
      { sheetHeader: 'actorEmail', entityField: 'actorEmail', type: 'string' },
      { sheetHeader: 'meta', entityField: 'meta', type: 'string' },
      { sheetHeader: 'createdAt', entityField: 'createdAt', type: 'date' },
    ]);
  }
}

// ═══════════════════════════════════════════════════════════════
// SALES DAILY & PIPELINE SNAPSHOT (simplified)
// ═══════════════════════════════════════════════════════════════

@Injectable()
export class SheetsSalesDailyRepository
  extends BaseSheetsRepository<SalesDailyEntity>
  implements ISalesDailyRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.SalesDaily, [
      { sheetHeader: 'id', entityField: 'id', type: 'string', required: true },
      { sheetHeader: 'date', entityField: 'date', type: 'date' },
      { sheetHeader: 'year', entityField: 'year', type: 'number' },
      { sheetHeader: 'month', entityField: 'month', type: 'number' },
      { sheetHeader: 'week', entityField: 'week', type: 'number' },
      { sheetHeader: 'teamId', entityField: 'teamId', type: 'string' },
      { sheetHeader: 'staffId', entityField: 'staffId', type: 'string' },
      { sheetHeader: 'newLeads', entityField: 'newLeads', type: 'number' },
      { sheetHeader: 'meetings', entityField: 'meetings', type: 'number' },
      { sheetHeader: 'bookings', entityField: 'bookings', type: 'number' },
      { sheetHeader: 'deposits', entityField: 'deposits', type: 'number' },
      { sheetHeader: 'contracts', entityField: 'contracts', type: 'number' },
      { sheetHeader: 'completedDeals', entityField: 'completedDeals', type: 'number' },
      { sheetHeader: 'cancelledDeals', entityField: 'cancelledDeals', type: 'number' },
      { sheetHeader: 'gmv', entityField: 'gmv', type: 'float' },
      { sheetHeader: 'revenue', entityField: 'revenue', type: 'float' },
      { sheetHeader: 'source', entityField: 'source', type: 'string' },
      { sheetHeader: 'syncedAt', entityField: 'syncedAt', type: 'date' },
      { sheetHeader: 'createdAt', entityField: 'createdAt', type: 'date' },
    ]);
  }
}

@Injectable()
export class SheetsPipelineSnapshotRepository
  extends BaseSheetsRepository<PipelineSnapshotEntity>
  implements IPipelineSnapshotRepository
{
  constructor(client: SheetsClient) {
    super(client, SHEET_NAMES.PipelineSnapshot, [
      { sheetHeader: 'id', entityField: 'id', type: 'string', required: true },
      { sheetHeader: 'snapshotDate', entityField: 'snapshotDate', type: 'date' },
      { sheetHeader: 'year', entityField: 'year', type: 'number' },
      { sheetHeader: 'month', entityField: 'month', type: 'number' },
      { sheetHeader: 'teamId', entityField: 'teamId', type: 'string' },
      { sheetHeader: 'leadCount', entityField: 'leadCount', type: 'number' },
      { sheetHeader: 'contactedCount', entityField: 'contactedCount', type: 'number' },
      { sheetHeader: 'meetingCount', entityField: 'meetingCount', type: 'number' },
      { sheetHeader: 'bookingCount', entityField: 'bookingCount', type: 'number' },
      { sheetHeader: 'depositCount', entityField: 'depositCount', type: 'number' },
      { sheetHeader: 'contractCount', entityField: 'contractCount', type: 'number' },
      { sheetHeader: 'completedCount', entityField: 'completedCount', type: 'number' },
      { sheetHeader: 'totalPipelineValue', entityField: 'totalPipelineValue', type: 'float' },
      { sheetHeader: 'source', entityField: 'source', type: 'string' },
      { sheetHeader: 'createdAt', entityField: 'createdAt', type: 'date' },
    ]);
  }
}
