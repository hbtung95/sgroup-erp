import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════
  async getDashboardStats() {
    const [
      totalCampaigns,
      runningCampaigns,
      totalLeads,
      newLeads,
      totalContent,
      channels,
    ] = await Promise.all([
      this.prisma.mktCampaign.count(),
      this.prisma.mktCampaign.count({ where: { status: 'RUNNING' } }),
      this.prisma.mktLead.count(),
      this.prisma.mktLead.count({ where: { status: 'NEW' } }),
      this.prisma.mktContent.count(),
      this.prisma.mktChannelPerformance.findMany({
        orderBy: { leads: 'desc' },
        take: 10,
      }),
    ]);

    // Aggregate totals
    const totalSpend = await this.prisma.mktCampaign.aggregate({ _sum: { spend: true } });
    const totalBudget = await this.prisma.mktCampaign.aggregate({ _sum: { budget: true } });
    const totalConversions = await this.prisma.mktLead.count({ where: { status: 'WON' } });

    return {
      totalCampaigns,
      runningCampaigns,
      totalLeads,
      newLeads,
      totalContent,
      totalSpend: Number(totalSpend._sum.spend) || 0,
      totalBudget: Number(totalBudget._sum.budget) || 0,
      totalConversions,
      channels,
    };
  }

  // ═══════════════════════════════════════════
  // CAMPAIGNS
  // ═══════════════════════════════════════════
  async findAllCampaigns(opts?: { status?: string; channel?: string }) {
    const where: Prisma.MktCampaignWhereInput = {};
    if (opts?.status) where.status = opts.status;
    if (opts?.channel) where.channel = opts.channel;

    return this.prisma.mktCampaign.findMany({
      where,
      include: { _count: { select: { mktLeads: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCampaign(data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return this.prisma.mktCampaign.create({ data });
  }

  async updateCampaign(id: string, data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    return this.prisma.mktCampaign.update({ where: { id }, data });
  }

  async deleteCampaign(id: string) {
    return this.prisma.mktCampaign.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════
  // LEADS
  // ═══════════════════════════════════════════
  async findAllLeads(opts?: { status?: string; source?: string; campaignId?: string }) {
    const where: Prisma.MktLeadWhereInput = {};
    if (opts?.status) where.status = opts.status;
    if (opts?.source) where.source = opts.source;
    if (opts?.campaignId) where.campaignId = opts.campaignId;

    return this.prisma.mktLead.findMany({
      where,
      include: { campaign: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLead(data: any) {
    return this.prisma.mktLead.create({
      data,
      include: { campaign: { select: { id: true, name: true } } },
    });
  }

  async updateLead(id: string, data: any) {
    return this.prisma.mktLead.update({
      where: { id },
      data,
      include: { campaign: { select: { id: true, name: true } } },
    });
  }

  async deleteLead(id: string) {
    return this.prisma.mktLead.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════
  async findAllContent(opts?: { status?: string; channel?: string }) {
    const where: Prisma.MktContentWhereInput = {};
    if (opts?.status) where.status = opts.status;
    if (opts?.channel) where.channel = opts.channel;

    return this.prisma.mktContent.findMany({
      where,
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async createContent(data: any) {
    if (data.scheduledDate) data.scheduledDate = new Date(data.scheduledDate);
    if (data.publishedDate) data.publishedDate = new Date(data.publishedDate);
    return this.prisma.mktContent.create({ data });
  }

  async updateContent(id: string, data: any) {
    if (data.scheduledDate) data.scheduledDate = new Date(data.scheduledDate);
    if (data.publishedDate) data.publishedDate = new Date(data.publishedDate);
    return this.prisma.mktContent.update({ where: { id }, data });
  }

  async deleteContent(id: string) {
    return this.prisma.mktContent.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════
  // CHANNELS
  // ═══════════════════════════════════════════
  async findAllChannels(opts?: { year?: string; month?: string }) {
    const where: Prisma.MktChannelPerformanceWhereInput = {};
    if (opts?.year) where.year = parseInt(opts.year);
    if (opts?.month) where.month = parseInt(opts.month);

    return this.prisma.mktChannelPerformance.findMany({
      where,
      orderBy: { leads: 'desc' },
    });
  }

  async upsertChannel(data: any) {
    const { channelKey, period, ...rest } = data;
    const year = parseInt(period.split('-')[0]);
    const month = parseInt(period.split('-')[1]);

    return this.prisma.mktChannelPerformance.upsert({
      where: { channelKey_period: { channelKey, period } },
      update: rest,
      create: { channelKey, period, year, month, ...rest },
    });
  }

  // ═══════════════════════════════════════════
  // BUDGET (aggregates from campaigns)
  // ═══════════════════════════════════════════
  async getBudgetSummary() {
    const campaigns = await this.prisma.mktCampaign.findMany({
      where: { status: { in: ['RUNNING', 'COMPLETED'] } },
    });

    // Group by channel
    const byChannel: Record<string, { allocated: number; spent: number; leads: number }> = {};
    for (const c of campaigns) {
      if (!byChannel[c.channel]) byChannel[c.channel] = { allocated: 0, spent: 0, leads: 0 };
      byChannel[c.channel].allocated += Number(c.budget);
      byChannel[c.channel].spent += Number(c.spend);
      byChannel[c.channel].leads += c.leads;
    }

    const totalAllocated = Object.values(byChannel).reduce((s, v) => s + v.allocated, 0);
    const totalSpent = Object.values(byChannel).reduce((s, v) => s + v.spent, 0);

    return {
      totalAllocated,
      totalSpent,
      remaining: totalAllocated - totalSpent,
      channels: Object.entries(byChannel).map(([key, val]) => ({
        channel: key,
        ...val,
        utilization: val.allocated > 0 ? Math.round(val.spent / val.allocated * 100) : 0,
      })),
    };
  }
}
