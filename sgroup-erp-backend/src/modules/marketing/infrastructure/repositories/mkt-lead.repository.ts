import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class MktLeadRepository {
  private readonly logger = new Logger(MktLeadRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mktLead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { campaign: { select: { name: true, channel: true } } }
    });
  }

  async createLead(data: any) {
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.mktLead.create({ data });
      
      // Auto-increment Campaign Leads count atomically
      if (data.campaignId) {
        await tx.mktCampaign.update({
          where: { id: data.campaignId },
          data: { leads: { increment: 1 } }
        });
        this.logger.log(`Auto-incremented lead count for Campaign ${data.campaignId}`);
      }
      return lead;
    });
  }

  async updateLeadStatus(id: string, status: string) {
    return this.prisma.mktLead.update({
      where: { id },
      data: { status }
    });
  }
}
