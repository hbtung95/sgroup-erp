import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

const AUDIT_RETENTION_DAYS = 90;

@Injectable()
export class AuditLogRepository {
  private readonly logger = new Logger(AuditLogRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async fetchLogs(limit: number = 50, page: number = 1) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getAggregatedAnalytics(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [topUsersRaw, failedLogs, totalLogs] = await Promise.all([
      this.prisma.auditLog.groupBy({
        by: ['userName'],
        where: { createdAt: { gte: since }, userName: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      this.prisma.auditLog.count({ where: { createdAt: { gte: since }, responseStatus: 'FAILED' } }),
      this.prisma.auditLog.count({ where: { createdAt: { gte: since } } })
    ]);

    const errorRate = totalLogs > 0 ? ((failedLogs / totalLogs) * 100).toFixed(1) : '0';

    return {
      topUsers: topUsersRaw.map(r => ({ userName: r.userName, count: r._count.id })),
      errorRate,
      totalLogs
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOldAuditLogs() {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - AUDIT_RETENTION_DAYS);
    const result = await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } }
    });
    this.logger.log(`[CRON] Cleaned up ${result.count} audit logs older than ${AUDIT_RETENTION_DAYS} days`);
  }
}
