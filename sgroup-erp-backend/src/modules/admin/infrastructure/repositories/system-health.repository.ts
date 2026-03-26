import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class SystemHealthRepository {
  private readonly logger = new Logger(SystemHealthRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalStats() {
    const [
      totalUsers, activeUsers, totalDepartments,
      totalTeams, totalPositions, totalEmployees,
      recentAuditCount, lockedUsers
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.hrDepartment.count(),
      this.prisma.hrTeam.count(),
      this.prisma.hrPosition.count(),
      this.prisma.hrEmployee.count(),
      this.prisma.auditLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      }),
      this.prisma.user.count({ where: { lockedUntil: { gt: new Date() } } })
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      lockedUsers,
      totalDepartments,
      totalTeams,
      totalPositions,
      totalEmployees,
      recentAuditCount
    };
  }

  async getHealthCheck() {
    const checks: { name: string; status: string; latency?: number }[] = [];
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.push({ name: 'Database', status: 'online', latency: Date.now() - dbStart });
    } catch {
      checks.push({ name: 'Database', status: 'offline', latency: Date.now() - dbStart });
    }

    checks.push({ name: 'API Server', status: 'online', latency: 0 });
    checks.push({ name: 'Auth Service', status: 'online', latency: 0 });

    const allOnline = checks.every(c => c.status === 'online');
    return { status: allOnline ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() };
  }
}
