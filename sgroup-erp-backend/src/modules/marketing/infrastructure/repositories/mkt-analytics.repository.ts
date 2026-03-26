import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class MktAnalyticsRepository {
  private readonly logger = new Logger(MktAnalyticsRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  // Heavy Aggregation: Return On Ad Spend & Cost Per Lead
  async getChannelPerformanceSummary(year: number, month: number) {
    // Simulated heavy raw metrics pulling from multiple tables
    const metrics = await this.prisma.mktChannelPerformance.findMany({
      where: { year, month },
      orderBy: { roas: 'desc' }
    });

    // If empty schema initially, return derived metrics directly from campaigns
    if (!metrics.length) {
       this.logger.warn(`No pre-calculated Channel Metrics for ${year}-${month}. Re-aggregating Raw Campaigns...`);
       const campaigns = await this.prisma.mktCampaign.findMany({
          where: {
            startDate: { gte: new Date(year, month - 1, 1) },
            endDate: { lte: new Date(year, month, 1) }
          }
       });

       const channelMap = new Map();
       for (const c of campaigns) {
         if (!channelMap.has(c.channel)) channelMap.set(c.channel, { spend: 0, leads: 0 });
         channelMap.get(c.channel).spend += Number(c.spend);
         channelMap.get(c.channel).leads += c.leads;
       }

       return Array.from(channelMap.entries()).map(([channel, data]) => ({
          channelKey: channel,
          spend: data.spend,
          leads: data.leads,
          cpl: data.leads > 0 ? (data.spend / data.leads) : 0,
          roas: 'Processing...' // Requires Sales Integration to map Lead -> Revenue
       }));
    }

    return metrics;
  }
}
