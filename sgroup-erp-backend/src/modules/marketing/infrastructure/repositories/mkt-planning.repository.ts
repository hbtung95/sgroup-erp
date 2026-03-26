import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class MktPlanningRepository {
  private readonly logger = new Logger(MktPlanningRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async getMasterPlan(year: number, scenarioKey: string) {
    return this.prisma.mktPlanHeader.findFirst({
      where: { year, scenarioKey }
    });
  }

  async getChannelBudgets(planId: string) {
    return this.prisma.mktPlanChannelBudget.findMany({
      where: { planId },
      orderBy: { budgetVnd: 'desc' }
    });
  }
}
