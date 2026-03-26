import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class AdminUserRepository {
  private readonly logger = new Logger(AdminUserRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
         id: true,
         email: true,
         name: true,
         role: true,
         isActive: true,
         lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async toggleUserStatus(id: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, isActive: true }
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true }
    });
  }
}
