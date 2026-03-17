import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════
  // DASHBOARD STATS
  // ═══════════════════════════════════════════
  async getStats() {
    const [
      totalUsers,
      totalDepartments,
      totalTeams,
      totalPositions,
      totalEmployees,
      recentUsers,
      deptDistribution,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.hrDepartment.count(),
      this.prisma.hrTeam.count(),
      this.prisma.hrPosition.count(),
      this.prisma.hrEmployee.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, department: true, createdAt: true },
      }),
      this.prisma.hrDepartment.findMany({
        select: { id: true, name: true, code: true, _count: { select: { employees: true, teams: true } } },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      totalUsers,
      totalDepartments,
      totalTeams,
      totalPositions,
      totalEmployees,
      recentUsers,
      deptDistribution,
    };
  }

  // ═══════════════════════════════════════════
  // USER MANAGEMENT
  // ═══════════════════════════════════════════
  async findAllUsers(opts: { search?: string; role?: string; page?: number; limit?: number }) {
    const { search, role, page = 1, limit = 50 } = opts;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true,
          department: true, salesRole: true, createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async updateUser(id: string, data: { role?: string; department?: string; name?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, department: true, updatedAt: true },
    });
  }
}
