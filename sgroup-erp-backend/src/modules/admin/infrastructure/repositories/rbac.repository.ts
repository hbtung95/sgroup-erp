import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class RbacRepository {
  private readonly logger = new Logger(RbacRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async getRolePermissions(role: string) {
    return this.prisma.rolePermission.findMany({
      where: { role }
    });
  }

  async updateRolePermission(role: string, module: string, permission: string, updatedBy: string) {
    return this.prisma.rolePermission.upsert({
      where: { role_module: { role, module } },
      update: { permission, updatedBy },
      create: { role, module, permission, updatedBy }
    });
  }

  async getAllPermissionsMatrix() {
    const all = await this.prisma.rolePermission.findMany();
    // Transform into matrix format: { role: { module: permission } }
    const matrix = {};
    for (const p of all) {
      if (!matrix[p.role]) matrix[p.role] = {};
      matrix[p.role][p.module] = p.permission;
    }
    return matrix;
  }
}
