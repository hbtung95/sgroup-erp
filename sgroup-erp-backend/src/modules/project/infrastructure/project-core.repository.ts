import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProjectCoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dimProject.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return this.prisma.dimProject.findUnique({
      where: { id },
      include: {
        products: { select: { id: true, status: true, code: true } }
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.dimProject.update({
      where: { id },
      data,
    });
  }
}
