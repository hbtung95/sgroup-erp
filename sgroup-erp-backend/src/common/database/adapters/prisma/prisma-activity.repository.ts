/**
 * Prisma Adapter — Activity Repository
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IActivityRepository, ActivityEntity } from '../../entity-repositories';

@Injectable()
export class PrismaActivityRepository implements IActivityRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: Record<string, any>): Promise<ActivityEntity[]> {
    const where: any = {};
    if (filters?.staffId) where.staffId = filters.staffId;
    if (filters?.teamId) where.teamId = filters.teamId;
    if (filters?.year) where.year = filters.year;
    if (filters?.month) where.month = filters.month;
    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters?.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters?.dateTo) where.date.lte = new Date(filters.dateTo);
    }
    return this.prisma.salesActivity.findMany({ where, orderBy: { date: 'desc' } }) as any;
  }

  async findById(id: string): Promise<ActivityEntity | null> {
    return this.prisma.salesActivity.findUnique({ where: { id } }) as any;
  }

  async create(data: Partial<ActivityEntity>): Promise<ActivityEntity> {
    return this.prisma.salesActivity.create({
      data: {
        ...data as any,
        date: data.date ? new Date(data.date as any) : new Date(),
      },
    }) as any;
  }

  async update(id: string, data: Partial<ActivityEntity>): Promise<ActivityEntity> {
    return this.prisma.salesActivity.update({ where: { id }, data: data as any }) as any;
  }

  async delete(id: string): Promise<ActivityEntity> {
    return this.prisma.salesActivity.delete({ where: { id } }) as any;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const where: any = {};
    if (filters?.year) where.year = filters.year;
    if (filters?.month) where.month = filters.month;
    if (filters?.staffId) where.staffId = filters.staffId;
    if (filters?.teamId) where.teamId = filters.teamId;
    return this.prisma.salesActivity.count({ where });
  }

  async getSummary(filters: { staffId?: string; teamId?: string; year: number; month?: number }) {
    const where: any = { year: filters.year };
    if (filters.staffId) where.staffId = filters.staffId;
    if (filters.teamId) where.teamId = filters.teamId;
    if (filters.month) where.month = filters.month;

    const activities = await this.prisma.salesActivity.findMany({ where });
    const totals = activities.reduce(
      (acc, a) => ({
        postsCount: acc.postsCount + a.postsCount,
        callsCount: acc.callsCount + a.callsCount,
        newLeads: acc.newLeads + a.newLeads,
        meetingsMade: acc.meetingsMade + a.meetingsMade,
      }),
      { postsCount: 0, callsCount: 0, newLeads: 0, meetingsMade: 0 },
    );
    return { totalEntries: activities.length, ...totals };
  }
}
