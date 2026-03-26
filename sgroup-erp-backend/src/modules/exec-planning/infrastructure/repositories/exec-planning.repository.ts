import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class ExecPlanningRepository {
  private readonly logger = new Logger(ExecPlanningRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async getLatestPlan(year: number, scenarioKey: string, tabKey: string) {
    return this.prisma.execPlanLatest.findUnique({
      where: {
        year_scenarioKey_tabKey: { year, scenarioKey, tabKey }
      }
    });
  }

  async upsertPlan(year: number, scenarioKey: string, tabKey: string, data: any, updatedBy: string) {
    this.logger.log(`Upserting BDH Plan Matrix: ${year}/${scenarioKey}/${tabKey} by ${updatedBy}`);
    return this.prisma.execPlanLatest.upsert({
      where: {
        year_scenarioKey_tabKey: { year, scenarioKey, tabKey }
      },
      update: {
        rawJson: JSON.stringify(data),
        updatedBy,
        updatedAt: new Date()
      },
      create: {
        year,
        scenarioKey,
        tabKey,
        rawJson: JSON.stringify(data),
        updatedBy
      }
    });
  }

  async getKpis(year: number, scenarioKey: string, tabKey: string) {
    const plan = await this.getLatestPlan(year, scenarioKey, tabKey);
    if (!plan || !plan.rawJson) return null;
    try {
      const parsed = plan.rawJson as any;
      return parsed.kpis || null;
    } catch {
      return null;
    }
  }
}
