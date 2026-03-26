import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class AgencyRepository {
  private readonly logger = new Logger(AgencyRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async getNetworkOverview() {
    const [totalAgencies, totalTiers, activeContracts] = await Promise.all([
      this.prisma.agAgency.count(),
      this.prisma.agTier.count(),
      this.prisma.agContract.count({ where: { status: 'ACTIVE' } })
    ]);

    // Pre-seed tiers if none exist
    if (totalTiers === 0) {
      await this.prisma.agTier.createMany({
        data: [
          { name: 'DIAMOND', discountRate: 0.3, minRevenueLimit: 1000000000 },
          { name: 'GOLD', discountRate: 0.2, minRevenueLimit: 500000000 },
          { name: 'SILVER', discountRate: 0.1, minRevenueLimit: 0 },
        ]
      });
    }

    return {
      overview: {
        totalAgencies,
        activeContracts,
        networkRevenue: 5000000000, // Sync this later with Sales CRM
      },
      lastUpdated: new Date()
    };
  }

  async getAllAgencies() {
    return this.prisma.agAgency.findMany({
      include: { tier: true, contracts: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createAgency(data: any) {
    return this.prisma.agAgency.create({
      data: {
        code: data.code,
        name: data.name,
        taxId: data.taxId,
        region: data.region,
        tierId: data.tierId,
      }
    });
  }

  async processCommission(agencyId: string, amount: number, referenceId: string) {
    return this.prisma.agTransaction.create({
      data: {
        agencyId,
        type: 'COMMISSION',
        amount,
        referenceId,
      }
    });
  }
}
