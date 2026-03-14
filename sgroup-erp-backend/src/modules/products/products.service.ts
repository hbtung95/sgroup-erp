import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../common/database/repository-tokens';
import { IProductRepository } from '../../common/database/entity-repositories';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private repo: IProductRepository,
  ) {}

  async findAll(filters?: {
    projectId?: string; status?: string; block?: string;
    minPrice?: number; maxPrice?: number;
    bedrooms?: number;
  }) {
    return this.repo.findAll(filters as any);
  }

  async findById(id: string) {
    const product = await this.repo.findById(id);
    if (!product) throw new NotFoundException('Property unit not found');
    return product;
  }

  async create(data: {
    projectId: string; projectName?: string; code: string;
    block?: string; floor?: number; area?: number;
    price?: number; direction?: string; bedrooms?: number;
    note?: string;
  }) {
    return this.repo.create(data as any);
  }

  async update(id: string, data: Partial<{
    price: number; area: number; direction: string;
    bedrooms: number; status: string; note: string;
  }>) {
    return this.repo.update(id, data as any);
  }

  async lockUnit(id: string, body: { bookedBy: string; durationMinutes?: number }) {
    const duration = (body.durationMinutes || 30) * 60 * 1000;
    const lockedUntil = new Date(Date.now() + duration);
    const success = await this.repo.atomicLock(id, body.bookedBy, lockedUntil);

    if (!success) {
      throw new BadRequestException('Unit is not available for locking or already locked.');
    }

    return this.repo.findById(id);
  }

  async requestDeposit(id: string, body: { customerName: string; customerPhone: string }) {
    const unit = await this.repo.findById(id);
    if (!unit) throw new NotFoundException('Unit not found');
    if (!['AVAILABLE', 'BOOKED'].includes(unit.status)) {
      throw new BadRequestException(`Unit is ${unit.status}, cannot request deposit`);
    }
    return this.repo.update(id, {
      status: 'PENDING_DEPOSIT',
      bookedBy: body.customerName,
      customerPhone: body.customerPhone,
    } as any);
  }

  async approveDeposit(id: string) {
    const unit = await this.repo.findById(id);
    if (!unit) throw new NotFoundException('Unit not found');
    if (unit.status !== 'PENDING_DEPOSIT') {
      throw new BadRequestException('Unit is not pending deposit');
    }
    return this.repo.update(id, { status: 'DEPOSIT' } as any);
  }

  async cancelBooking(id: string) {
    const success = await this.repo.atomicUnlock(id);
    if (!success) {
      throw new BadRequestException('Unit is not currently locked or booked.');
    }
    return this.repo.findById(id);
  }

  async getStats(projectId?: string) {
    return this.repo.getStats(projectId);
  }
}
