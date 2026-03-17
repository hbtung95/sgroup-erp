import { Injectable, Inject, Logger } from '@nestjs/common';
import { MKT_PLAN_REPOSITORY } from '../../common/database/repository-tokens';
import { IMktPlanRepository } from '../../common/database/entity-repositories';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarketingPlanningService {
  private readonly logger = new Logger(MarketingPlanningService.name);

  constructor(
    @Inject(MKT_PLAN_REPOSITORY) private repo: IMktPlanRepository,
    private prisma: PrismaService,
  ) {}

  async getHeader(planId: string) {
    return this.repo.getHeader(planId);
  }

  async getChannelBudgets(planId: string) {
    return this.repo.getChannelBudgets(planId);
  }

  async getKpiTargets(planId: string) {
    return this.repo.getKpiTargets(planId);
  }

  async getAssumptions(planId: string) {
    return this.repo.getAssumptions(planId);
  }

  // ──────────────────────────── ROI COMPUTATION ────────────────────────────
  async getChannelROI(planId: string) {
    const header = await this.repo.getHeader(planId);
    const budgets = await this.repo.getChannelBudgets(planId);
    
    if (!header || !budgets || budgets.length === 0) return [];
    
    const year = header.year;
    
    const roiData = await Promise.all(budgets.map(async (budget) => {
      // Find customers with this source in the year
      const customers = await this.prisma.customer.findMany({
        where: { year, source: budget.channelKey },
        select: { phone: true }
      });
      
      const phones = customers.map(c => c.phone).filter(Boolean);
      const leadsCount = phones.length;
      
      let revenue = 0;
      let wonDealsCount = 0;
      
      if (phones.length > 0) {
        const deals = await this.prisma.factDeal.findMany({
          where: { 
            year,
            customerPhone: { in: phones as string[] },
            stage: { in: ['CONTRACT', 'COMPLETED'] }
          }
        });
        
        wonDealsCount = deals.length;
        revenue = deals.reduce((sum, d) => sum + (Number(d.dealValue) * 1000000000), 0); // BILLION -> VND
      }
      
      const roi = Number(budget.budgetVnd) > 0 ? (revenue / Number(budget.budgetVnd)) : 0;
      
      return {
        ...budget,
        revenue,
        roi,
        leadsCount,
        wonDealsCount
      };
    }));
    
    return roiData;
  }
}
