import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ACTIVITY_REPOSITORY } from '../../common/database/repository-tokens';
import { IActivityRepository } from '../../common/database/entity-repositories';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(ACTIVITY_REPOSITORY) private repo: IActivityRepository,
    private prisma: PrismaService,
  ) {}

  async findAll(filters?: {
    staffId?: string; teamId?: string;
    year?: number; month?: number;
    dateFrom?: string; dateTo?: string;
  }) {
    return this.repo.findAll(filters as any);
  }

  async findById(id: string) {
    const activity = await this.repo.findById(id);
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  /**
   * Create activity log — tự động resolve teamId/teamName
   * từ SalesStaff hiện tại để snapshot team tại thời điểm ghi nhật ký.
   * Khi sales đổi team, các bản ghi cũ vẫn giữ nguyên team cũ.
   */
  async create(data: {
    staffId: string; staffName?: string;
    teamId?: string; teamName?: string;
    postsCount?: number; callsCount?: number;
    newLeads?: number; meetingsMade?: number;
    note?: string; year: number; month: number;
    date?: string;
  }) {
    // Auto-resolve team from SalesStaff if not explicitly provided
    let { teamId, teamName } = data;
    if (!teamId) {
      const staff = await this.prisma.salesStaff.findUnique({
        where: { id: data.staffId },
        include: { team: true },
      });
      if (staff) {
        teamId = staff.teamId ?? undefined;
        teamName = staff.team?.name ?? undefined;
        // Also fill staffName if not provided
        if (!data.staffName) {
          data.staffName = staff.fullName;
        }
      }
    }

    return this.repo.create({
      ...data,
      teamId,
      teamName,
      date: data.date ? new Date(data.date) : new Date(),
    } as any);
  }

  async update(id: string, data: Partial<{
    postsCount: number; callsCount: number;
    newLeads: number; meetingsMade: number;
    note: string;
  }>) {
    return this.repo.update(id, data as any);
  }

  async remove(id: string) {
    return this.repo.delete(id);
  }

  async getSummary(filters: {
    staffId?: string; teamId?: string;
    year: number; month?: number;
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  }) {
    return this.repo.getSummary(filters);
  }
}
