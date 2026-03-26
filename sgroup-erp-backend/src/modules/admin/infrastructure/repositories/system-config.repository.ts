import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class SystemConfigRepository {
  private readonly logger = new Logger(SystemConfigRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async getAllSettings() {
    return this.prisma.systemSetting.findMany({ orderBy: { group: 'asc' } });
  }

  async updateSetting(key: string, value: string) {
    return this.prisma.systemSetting.update({
      where: { key },
      data: { value }
    });
  }

  async getAllFeatureFlags() {
    return this.prisma.featureFlag.findMany({ orderBy: { module: 'asc' } });
  }

  async toggleFeatureFlag(key: string, enabled: boolean, updatedBy: string) {
    return this.prisma.featureFlag.update({
      where: { key },
      data: { enabled, updatedBy }
    });
  }
}
