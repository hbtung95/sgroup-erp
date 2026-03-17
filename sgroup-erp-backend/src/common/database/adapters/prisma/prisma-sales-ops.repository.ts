/**
 * Prisma Adapters — Sales Ops entities (Team, Staff, Project, Deal, Target, Commission)
 * Combined into one file since SalesOpsService managed them together.
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  ITeamRepository, IStaffRepository, IProjectRepository,
  IDealRepository, ITargetRepository, ICommissionRepository,
  TeamEntity, StaffEntity, ProjectEntity,
  DealEntity, TargetEntity, CommissionEntity,
} from '../../entity-repositories';

// ── TEAM ──
@Injectable()
export class PrismaTeamRepository implements ITeamRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<TeamEntity[]> {
    return this.prisma.salesTeam.findMany({
      where: { status: filters?.status || 'ACTIVE' },
      orderBy: { sortOrder: 'asc' },
    }) as any;
  }

  async findById(id: string): Promise<TeamEntity | null> {
    return this.prisma.salesTeam.findUnique({ where: { id } }) as any;
  }

  async create(data: Partial<TeamEntity>): Promise<TeamEntity> {
    return this.prisma.salesTeam.create({ data: data as any }) as any;
  }

  async update(id: string, data: Partial<TeamEntity>): Promise<TeamEntity> {
    return this.prisma.salesTeam.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<TeamEntity> {
    return this.prisma.salesTeam.update({ where: { id }, data: { status: 'DELETED', deletedAt: new Date() } as any }) as any;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    return this.prisma.salesTeam.count({ where: { status: filters?.status || 'ACTIVE' } });
  }
}

// ── STAFF ──
@Injectable()
export class PrismaStaffRepository implements IStaffRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<StaffEntity[]> {
    const where: any = {};
    if (filters?.teamId) where.teamId = filters.teamId;
    if (filters?.status) where.status = filters.status;
    else where.status = 'ACTIVE';
    if (filters?.role) where.role = filters.role;
    return this.prisma.salesStaff.findMany({
      where,
      include: { team: true, _count: { select: { deals: true } } },
      orderBy: { fullName: 'asc' },
    }) as any;
  }

  async findById(id: string): Promise<StaffEntity | null> {
    return this.prisma.salesStaff.findUnique({
      where: { id },
      include: { team: true, _count: { select: { deals: true } } },
    }) as any;
  }

  async findByCode(code: string): Promise<StaffEntity | null> {
    return this.prisma.salesStaff.findUnique({
      where: { employeeCode: code },
      include: { team: true },
    }) as any;
  }

  async create(data: Partial<StaffEntity>): Promise<StaffEntity> {
    return this.prisma.salesStaff.create({ data: data as any }) as any;
  }

  async update(id: string, data: Partial<StaffEntity>): Promise<StaffEntity> {
    return this.prisma.salesStaff.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<StaffEntity> {
    return this.prisma.salesStaff.update({ where: { id }, data: { status: 'DELETED', deletedAt: new Date() } as any }) as any;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const where: any = {};
    if (filters?.teamId) where.teamId = filters.teamId;
    if (filters?.status) where.status = filters.status;
    else where.status = 'ACTIVE';
    return this.prisma.salesStaff.count({ where });
  }
}

// ── PROJECT ──
@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<ProjectEntity[]> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    else where.status = 'ACTIVE';
    if (filters?.type) where.type = filters.type;
    return this.prisma.dimProject.findMany({ where, orderBy: { name: 'asc' } }) as any;
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    return this.prisma.dimProject.findUnique({ where: { id } }) as any;
  }

  async create(data: Partial<ProjectEntity>): Promise<ProjectEntity> {
    return this.prisma.dimProject.create({ data: data as any }) as any;
  }

  async update(id: string, data: Partial<ProjectEntity>): Promise<ProjectEntity> {
    return this.prisma.dimProject.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<ProjectEntity> {
    return this.prisma.dimProject.update({ where: { id }, data: { status: 'DELETED', deletedAt: new Date() } as any }) as any;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    else where.status = 'ACTIVE';
    return this.prisma.dimProject.count({ where });
  }
}

// ── DEAL ──
@Injectable()
export class PrismaDealRepository implements IDealRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<DealEntity[]> {
    const where: any = {};
    if (filters?.year) where.year = filters.year;
    if (filters?.month) where.month = filters.month;
    if (filters?.teamId) where.teamId = filters.teamId;
    if (filters?.staffId) where.staffId = filters.staffId;
    if (filters?.stage) where.stage = filters.stage;
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.status) where.status = filters.status;
    else where.status = 'ACTIVE';
    return this.prisma.factDeal.findMany({ where, orderBy: { createdAt: 'desc' } }) as any;
  }

  async findById(id: string): Promise<DealEntity | null> {
    return this.prisma.factDeal.findUnique({ where: { id } }) as any;
  }

  async create(data: Partial<DealEntity>): Promise<DealEntity> {
    return this.prisma.factDeal.create({ data: data as any }) as any;
  }

  async update(id: string, data: Partial<DealEntity>): Promise<DealEntity> {
    return this.prisma.factDeal.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<DealEntity> {
    return this.prisma.factDeal.update({ where: { id }, data: { status: 'DELETED', deletedAt: new Date() } as any }) as any;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const where: any = {};
    if (filters?.year) where.year = filters.year;
    if (filters?.status) where.status = filters.status;
    else where.status = 'ACTIVE';
    return this.prisma.factDeal.count({ where });
  }

  async getStats(filters: { year: number; month?: number; teamId?: string }) {
    const where: any = { year: filters.year, status: 'ACTIVE' };
    if (filters.month) where.month = filters.month;
    if (filters.teamId) where.teamId = filters.teamId;

    const deals = await this.prisma.factDeal.findMany({ where });
    const total = deals.length;
    const totalGMV = deals.reduce((s, d) => s + Number(d.dealValue), 0);
    const totalRevenue = deals.reduce((s, d) => s + Number(d.commission), 0);
    const byStage = deals.reduce((acc, d) => {
      acc[d.stage] = (acc[d.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, totalGMV, totalRevenue, byStage };
  }
}

// ── TARGET ──
@Injectable()
export class PrismaTargetRepository implements ITargetRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<TargetEntity[]> {
    const where: any = {};
    if (filters?.year) where.year = filters.year;
    if (filters?.month) where.month = filters.month;
    if (filters?.teamId) where.teamId = filters.teamId;
    if (filters?.staffId) where.staffId = filters.staffId;
    if (filters?.scenarioKey) where.scenarioKey = filters.scenarioKey;
    else where.scenarioKey = 'base';
    return this.prisma.salesTargetMonthly.findMany({ where, orderBy: [{ month: 'asc' }] }) as any;
  }

  async findById(id: string): Promise<TargetEntity | null> {
    return this.prisma.salesTargetMonthly.findUnique({ where: { id } }) as any;
  }

  async create(data: Partial<TargetEntity>): Promise<TargetEntity> {
    return this.prisma.salesTargetMonthly.create({ data: data as any }) as any;
  }

  async update(id: string, data: Partial<TargetEntity>): Promise<TargetEntity> {
    return this.prisma.salesTargetMonthly.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<TargetEntity> {
    return this.prisma.salesTargetMonthly.delete({ where: { id } }) as any;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const where: any = {};
    if (filters?.year) where.year = filters.year;
    return this.prisma.salesTargetMonthly.count({ where });
  }

  async upsertTarget(
    where: { year: number; month: number; teamId: string; staffId: string; scenarioKey: string },
    data: Partial<TargetEntity>,
  ): Promise<TargetEntity> {
    return this.prisma.salesTargetMonthly.upsert({
      where: {
        year_month_teamId_staffId_scenarioKey: {
          year: where.year,
          month: where.month,
          teamId: where.teamId || '',
          staffId: where.staffId || '',
          scenarioKey: where.scenarioKey,
        },
      },
      create: { ...data, ...where } as any,
      update: data as any,
    }) as any;
  }
}

// ── COMMISSION ──
@Injectable()
export class PrismaCommissionRepository implements ICommissionRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<CommissionEntity[]> {
    const where: any = {};
    if (filters?.year) where.year = filters.year;
    if (filters?.month) where.month = filters.month;
    if (filters?.teamId) where.teamId = filters.teamId;
    if (filters?.staffId) where.staffId = filters.staffId;
    if (filters?.status) where.status = filters.status;
    return this.prisma.commissionRecord.findMany({ where, orderBy: { createdAt: 'desc' } }) as any;
  }

  async findById(id: string): Promise<CommissionEntity | null> {
    return this.prisma.commissionRecord.findUnique({ where: { id } }) as any;
  }

  async create(data: Partial<CommissionEntity>): Promise<CommissionEntity> {
    return this.prisma.commissionRecord.create({ data: data as any }) as any;
  }

  async update(id: string, data: Partial<CommissionEntity>): Promise<CommissionEntity> {
    return this.prisma.commissionRecord.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<CommissionEntity> {
    return this.prisma.commissionRecord.delete({ where: { id } }) as any;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const where: any = {};
    if (filters?.year) where.year = filters.year;
    if (filters?.status) where.status = filters.status;
    return this.prisma.commissionRecord.count({ where });
  }
}
