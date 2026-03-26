import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class MktCampaignRepository {
  private readonly logger = new Logger(MktCampaignRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mktCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return this.prisma.mktCampaign.findUnique({
      where: { id },
      include: { mktLeads: true }
    });
  }

  // Cập nhật số liệu Real-time (Spend, Leads) để Dashboard nhảy Live
  async updatePerformanceMetrics(id: string, spendAdded: number, leadsAdded: number) {
    const campaign = await this.findById(id);
    if (!campaign) return null;

    const newSpend = Number(campaign.spend) + spendAdded;
    const newLeads = campaign.leads + leadsAdded;

    return this.prisma.mktCampaign.update({
      where: { id },
      data: { spend: newSpend, leads: newLeads }
    });
  }
}
