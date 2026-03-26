import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IPropertyProductRepository } from '../../domain/repositories/property-product.repository.interface';
import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { CreatePropertyProductDto } from '../../presentation/dtos/create-property-product.dto';
import { UpdatePropertyProductDto } from '../../presentation/dtos/update-property-product.dto';
import { GenerateInventoryDto } from '../../presentation/dtos/generate-inventory.dto';

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

  constructor(
    @Inject('IPropertyProductRepository')
    private readonly productRepo: IPropertyProductRepository,
    @Inject('IProjectRepository')
    private readonly projectRepo: IProjectRepository,
  ) {}

  async create(createDto: CreatePropertyProductDto) {
    const project = await this.projectRepo.findById(createDto.projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${createDto.projectId} not found`);
    }

    return this.productRepo.create({
      ...createDto,
      projectName: project.name,
    });
  }

  async findAllByProject(projectId: string, skip?: number, take?: number, status?: string) {
    return this.productRepo.findAllByProject(projectId, skip ? Number(skip) : undefined, take ? Number(take) : undefined, status);
  }

  async findOne(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`PropertyProduct with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateDto: UpdatePropertyProductDto) {
    const product = await this.findOne(id);
    if (updateDto.status && updateDto.status !== product.status) {
      this.validateTransition(product.status, updateDto.status);
    }
    const updated = await this.productRepo.update(id, updateDto);
    
    if (updateDto.status && updateDto.status !== product.status) {
      await this.productRepo.logStatusChange(id, product.status, updateDto.status, 'manual_update');
      await this.syncSoldUnits(product.projectId);
    }
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.productRepo.delete(id);
  }

  async lockProduct(id: string, staffName?: string) {
    const lockedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    const result = await this.productRepo.lockProduct(id, staffName || null, lockedUntil);
    
    if (result.count === 0) {
       throw new BadRequestException('Sản phẩm không khả dụng để Lock hoặc đã bị Lock bởi người khác.');
    }
    
    const updated = await this.findOne(id);
    await this.productRepo.logStatusChange(id, 'AVAILABLE', 'LOCKED', staffName || 'system', 'Lock căn');
    return updated;
  }

  async unlockProduct(id: string) {
    const result = await this.productRepo.unlockProduct(id);

    if (result.count === 0) {
      throw new BadRequestException('Sản phẩm không trong trạng thái Lock.');
    }

    const updated = await this.findOne(id);
    await this.productRepo.logStatusChange(id, 'LOCKED', 'AVAILABLE', undefined, 'Unlock căn');
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

  private async syncSoldUnits(projectId: string) {
    try {
      const soldCount = await this.productRepo.countSold(projectId);
      await this.productRepo.updateProjectUnits(projectId, soldCount);
      this.logger.log(`Synced soldUnits for project ${projectId}: ${soldCount}`);
    } catch (e) {
      this.logger.warn(`Failed to sync soldUnits: ${e}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredLocks() {
    try {
      const count = await this.productRepo.unlockExpiredLocks();
      if (count > 0) {
        this.logger.log(`Auto-unlocked ${count} expired product locks.`);
      }
    } catch (e) {
      this.logger.error(`Failed to handle expired locks via cron: ${e}`);
    }
  }

  async batchCreate(projectId: string, items: CreatePropertyProductDto[]) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const data = items.map(item => ({
      ...item,
      projectId,
      projectName: project.name,
    }));

    return this.productRepo.batchCreate(data);
  }

  // ──────────────────────────── BATCH GENERATE ────────────────────────────

  async generateInventory(projectId: string, dto: GenerateInventoryDto) {
    const project = await this.projectRepo.findById(projectId);
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

    const existingCodes = await this.productRepo.findExistingCodes(projectId, products.map(p => p.code));
    const existingSet = new Set(existingCodes);
    const newProducts = products.filter(p => !existingSet.has(p.code));

    if (newProducts.length === 0) {
      return { created: 0, skipped: products.length, total: 0 };
    }

    const result = await this.productRepo.batchCreate(newProducts);

    const totalProducts = await this.productRepo.countTotal(projectId);
    await this.productRepo.updateProjectUnits(projectId, undefined, totalProducts);

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

      const products = await this.productRepo.findByCode(deal.productCode);

      for (const product of products) {
        await this.productRepo.update(product.id, { status: newStatus, bookedBy: deal.staffName || deal.customerName });
        await this.productRepo.logStatusChange(product.id, product.status, newStatus, deal.staffName, `deal.created (${deal.stage})`);
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
      const products = await this.productRepo.findByCode(newDeal.productCode);

      if (['BOOKING', 'DEPOSIT', 'CONTRACT'].includes(newDeal.stage)) {
        const statusMapping: Record<string, string> = {
          'BOOKING': 'BOOKED',
          'DEPOSIT': 'DEPOSIT',
          'CONTRACT': 'SOLD'
        };
        const newStatus = statusMapping[newDeal.stage] || 'BOOKED';

        for (const product of products) {
          await this.productRepo.update(product.id, { status: newStatus, bookedBy: newDeal.staffName || newDeal.customerName });
          await this.productRepo.logStatusChange(product.id, product.status, newStatus, newDeal.staffName, `deal.status_changed (${oldDeal.stage} → ${newDeal.stage})`);
          await this.syncSoldUnits(product.projectId);
        }
        this.logger.log(`PropertyProduct ${newDeal.productCode} status updated to ${newStatus}`);
      } else if (['CANCELLED', 'LEAD', 'MEETING'].includes(newDeal.stage)) {
        for (const product of products) {
          await this.productRepo.update(product.id, { status: 'AVAILABLE', bookedBy: null });
          await this.productRepo.logStatusChange(product.id, product.status, 'AVAILABLE', newDeal.staffName, `deal.cancelled (${newDeal.stage})`);
          await this.syncSoldUnits(product.projectId);
        }
        this.logger.log(`PropertyProduct ${newDeal.productCode} unlocked and set to AVAILABLE`);
      }
    }
  }
}
