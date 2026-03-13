import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePropertyProductDto } from './dto/create-property-product.dto';
import { UpdatePropertyProductDto } from './dto/update-property-product.dto';
import { GenerateInventoryDto } from './dto/generate-inventory.dto';

// ── Status Lifecycle State Machine ──
const VALID_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE:       ['LOCKED', 'BOOKED'],
  LOCKED:          ['AVAILABLE', 'BOOKED'],          // unlock reverts; or direct booking via deal
  BOOKED:          ['AVAILABLE', 'PENDING_DEPOSIT'],  // cancel reverts
  PENDING_DEPOSIT: ['AVAILABLE', 'DEPOSIT'],
  DEPOSIT:         ['AVAILABLE', 'SOLD'],
  SOLD:            ['COMPLETED'],                      // no reversal allowed
  COMPLETED:       [],                                 // terminal state
};

@Injectable()
export class PropertyProductService {
  private readonly logger = new Logger(PropertyProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreatePropertyProductDto) {
    const project = await this.prisma.dimProject.findUnique({
      where: { id: createDto.projectId }
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${createDto.projectId} not found`);
    }

    return this.prisma.propertyProduct.create({
      data: {
        ...createDto,
        projectName: project.name,
      },
    });
  }

  async findAllByProject(projectId: string) {
    return this.prisma.propertyProduct.findMany({
      where: { projectId },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.propertyProduct.findUnique({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`PropertyProduct with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateDto: UpdatePropertyProductDto) {
    const product = await this.findOne(id);
    // Validate status transition if status is being changed
    if (updateDto.status && updateDto.status !== product.status) {
      this.validateTransition(product.status, updateDto.status);
    }
    const updated = await this.prisma.propertyProduct.update({
      where: { id },
      data: updateDto,
    });
    // Audit log + sync if status changed
    if (updateDto.status && updateDto.status !== product.status) {
      await this.logStatusChange(id, product.status, updateDto.status, 'manual_update');
      await this.syncSoldUnits(product.projectId);
    }
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.propertyProduct.delete({
      where: { id },
    });
  }

  async lockProduct(id: string, staffName?: string) {
    const product = await this.findOne(id);
    this.validateTransition(product.status, 'LOCKED');
    const lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    const updated = await this.prisma.propertyProduct.update({
      where: { id },
      data: { status: 'LOCKED', bookedBy: staffName || null, lockedUntil },
    });
    await this.logStatusChange(id, product.status, 'LOCKED', staffName || 'system', 'Lock căn');
    return updated;
  }

  async unlockProduct(id: string) {
    const product = await this.findOne(id);
    this.validateTransition(product.status, 'AVAILABLE');
    const updated = await this.prisma.propertyProduct.update({
      where: { id },
      data: { status: 'AVAILABLE', bookedBy: null, lockedUntil: null },
    });
    await this.logStatusChange(id, product.status, 'AVAILABLE', undefined, 'Unlock căn');
    return updated;
  }

  // ──────────────────────────── HELPERS ────────────────────────────

  private validateTransition(from: string, to: string) {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${from} → ${to}. Cho phép: ${(allowed || []).join(', ') || 'không có'}`
      );
    }
  }

  private async logStatusChange(productId: string, oldStatus: string, newStatus: string, changedBy?: string, reason?: string) {
    try {
      await this.prisma.productStatusLog.create({
        data: { productId, oldStatus, newStatus, changedBy, reason },
      });
    } catch (e) {
      this.logger.warn(`Failed to write audit log: ${e}`);
    }
  }

  private async syncSoldUnits(projectId: string) {
    try {
      const soldCount = await this.prisma.propertyProduct.count({
        where: { projectId, status: 'SOLD' },
      });
      await this.prisma.dimProject.update({
        where: { id: projectId },
        data: { soldUnits: soldCount },
      });
      this.logger.log(`Synced soldUnits for project ${projectId}: ${soldCount}`);
    } catch (e) {
      this.logger.warn(`Failed to sync soldUnits: ${e}`);
    }
  }

  async batchCreate(projectId: string, items: CreatePropertyProductDto[]) {
    const project = await this.prisma.dimProject.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const data = items.map(item => ({
      ...item,
      projectId,
      projectName: project.name,
    }));

    return this.prisma.propertyProduct.createMany({ data });
  }

  // ──────────────────────────── BATCH GENERATE ────────────────────────────

  async generateInventory(projectId: string, dto: GenerateInventoryDto) {
    const project = await this.prisma.dimProject.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (dto.fromFloor > dto.toFloor) {
      throw new BadRequestException('fromFloor must be <= toFloor');
    }

    const pattern = dto.codePattern || '{block}-{floor}{unit}';
    const products: { projectId: string; projectName: string; code: string; block: string; floor: number; area: number; price: number; bedrooms: number; status: string }[] = [];

    for (const block of dto.blocks) {
      for (let floor = dto.fromFloor; floor <= dto.toFloor; floor++) {
        for (let unit = 1; unit <= dto.unitsPerFloor; unit++) {
          const floorPad = String(floor).padStart(2, '0');
          const unitPad = String(unit).padStart(2, '0');
          const code = pattern
            .replace('{block}', block)
            .replace('{floor}', floorPad)
            .replace('{unit}', unitPad);

          products.push({
            projectId,
            projectName: project.name,
            code,
            block,
            floor,
            area: dto.defaultArea || 0,
            price: dto.defaultPrice || 0,
            bedrooms: dto.defaultBedrooms || 0,
            status: 'AVAILABLE',
          });
        }
      }
    }

    // Skip codes that already exist
    const existingCodes = await this.prisma.propertyProduct.findMany({
      where: { projectId, code: { in: products.map(p => p.code) } },
      select: { code: true },
    });
    const existingSet = new Set(existingCodes.map(e => e.code));
    const newProducts = products.filter(p => !existingSet.has(p.code));

    if (newProducts.length === 0) {
      return { created: 0, skipped: products.length, total: 0 };
    }

    const result = await this.prisma.propertyProduct.createMany({ data: newProducts });

    // Update totalUnits on project
    const totalProducts = await this.prisma.propertyProduct.count({ where: { projectId } });
    await this.prisma.dimProject.update({
      where: { id: projectId },
      data: { totalUnits: totalProducts },
    });

    return { created: result.count, skipped: existingSet.size, total: totalProducts };
  }

  // ──────────────────────────── EVENT LISTENERS ────────────────────────────

  @OnEvent('deal.created')
  async handleDealCreated(deal: any) {
    if (!deal.productCode) return;
    this.logger.log(`Received deal.created for productCode: ${deal.productCode}`);

    if (['BOOKING', 'DEPOSIT', 'CONTRACT'].includes(deal.stage)) {
      const statusMapping: Record<string, string> = {
        'BOOKING': 'BOOKED',
        'DEPOSIT': 'DEPOSIT',
        'CONTRACT': 'SOLD'
      };
      const newStatus = statusMapping[deal.stage] || 'BOOKED';

      const products = await this.prisma.propertyProduct.findMany({
        where: { code: deal.productCode },
      });

      for (const product of products) {
        await this.prisma.propertyProduct.update({
          where: { id: product.id },
          data: { status: newStatus, bookedBy: deal.staffName || deal.customerName },
        });
        await this.logStatusChange(product.id, product.status, newStatus, deal.staffName, `deal.created (${deal.stage})`);
        await this.syncSoldUnits(product.projectId);
      }
      this.logger.log(`PropertyProduct ${deal.productCode} status updated to ${newStatus}`);
    }
  }

  @OnEvent('deal.status_changed')
  async handleDealStatusChanged(payload: { oldDeal: any, newDeal: any }) {
    const { oldDeal, newDeal } = payload;
    if (!newDeal.productCode) return;
    this.logger.log(`Received deal.status_changed for productCode: ${newDeal.productCode}`);

    if (newDeal.stage !== oldDeal.stage) {
      const products = await this.prisma.propertyProduct.findMany({
        where: { code: newDeal.productCode },
      });

      if (['BOOKING', 'DEPOSIT', 'CONTRACT'].includes(newDeal.stage)) {
        const statusMapping: Record<string, string> = {
          'BOOKING': 'BOOKED',
          'DEPOSIT': 'DEPOSIT',
          'CONTRACT': 'SOLD'
        };
        const newStatus = statusMapping[newDeal.stage] || 'BOOKED';

        for (const product of products) {
          await this.prisma.propertyProduct.update({
            where: { id: product.id },
            data: { status: newStatus, bookedBy: newDeal.staffName || newDeal.customerName },
          });
          await this.logStatusChange(product.id, product.status, newStatus, newDeal.staffName, `deal.status_changed (${oldDeal.stage} → ${newDeal.stage})`);
          await this.syncSoldUnits(product.projectId);
        }
        this.logger.log(`PropertyProduct ${newDeal.productCode} status updated to ${newStatus}`);
      } else if (['CANCELLED', 'LEAD', 'MEETING'].includes(newDeal.stage)) {
        for (const product of products) {
          await this.prisma.propertyProduct.update({
            where: { id: product.id },
            data: { status: 'AVAILABLE', bookedBy: null },
          });
          await this.logStatusChange(product.id, product.status, 'AVAILABLE', newDeal.staffName, `deal.cancelled (${newDeal.stage})`);
          await this.syncSoldUnits(product.projectId);
        }
        this.logger.log(`PropertyProduct ${newDeal.productCode} unlocked and set to AVAILABLE`);
      }
    }
  }
}
