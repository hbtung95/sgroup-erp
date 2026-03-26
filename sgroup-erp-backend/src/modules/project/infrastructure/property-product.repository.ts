import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, PropertyProduct } from '@prisma/client';

@Injectable()
export class PropertyProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByProject(projectId: string, skip?: number, take?: number, status?: string) {
    const where: any = { projectId };
    if (status) where.status = status;
    return this.prisma.propertyProduct.findMany({
      skip, take, where,
      orderBy: { code: 'asc' },
    });
  }

  async findById(productId: string): Promise<PropertyProduct | null> {
    return this.prisma.propertyProduct.findUnique({
      where: { id: productId },
      include: { statusLogs: { orderBy: { createdAt: 'desc' } } }
    });
  }

  async lockProduct(productId: string, staffName: string): Promise<PropertyProduct> {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.propertyProduct.findUnique({
        where: { id: productId }
      });
      
      if (!product) throw new BadRequestException('Bất động sản không tồn tại.');
      if (product.status !== 'AVAILABLE') throw new BadRequestException(`Căn hộ đang ở trạng thái ${product.status}, không thể khóa.`);

      const updated = await tx.propertyProduct.update({
        where: { id: productId },
        data: {
          status: 'LOCKED',
          bookedBy: staffName,
          lockedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // Lock 2 hours
        }
      });

      // AUDIT LOG - Red Flag 3 Fix: Writing exact history changes safely
      await tx.productStatusLog.create({
        data: {
          productId: product.id,
          oldStatus: product.status,
          newStatus: 'LOCKED',
          changedBy: staffName,
          reason: 'System Auto-Lock for Sale',
        }
      });

      return updated;
    });
  }

  async unlockProduct(productId: string): Promise<PropertyProduct> {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.propertyProduct.findUnique({
        where: { id: productId }
      });
      if (!product) throw new BadRequestException('Bất động sản không tồn tại.');

      const updated = await tx.propertyProduct.update({
        where: { id: productId },
        data: {
          status: 'AVAILABLE',
          bookedBy: null,
          lockedUntil: null,
        }
      });

      // AUDIT LOG
      await tx.productStatusLog.create({
        data: {
          productId: product.id,
          oldStatus: product.status,
          newStatus: 'AVAILABLE',
          changedBy: 'SYSTEM',
          reason: 'Manual Unlock / Expiration',
        }
      });

      return updated;
    });
  }
}
