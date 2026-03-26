import { Injectable, Logger } from '@nestjs/common';
import { CustomersRepository } from '../../infrastructure/repositories/customers.repository';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);
  // Red Flag 2 Fix: Enterprise Caching Strategy for Heavy Sales CRM Load
  private customerCache = new Map<string, { data: any, expiry: number }>();
  private CACHE_TTL = 60000; // 60 seconds

  constructor(private readonly repo: CustomersRepository) {}

  async findAll(skip?: number, take?: number, status?: string) {
    const cacheKey = `customers_${skip}_${take}_${status}`;
    const cached = this.customerCache.get(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      this.logger.debug(`[Sales CRM Cache] HIT for ${cacheKey}`);
      return cached.data;
    }

    this.logger.debug(`[Sales CRM Cache] MISS for ${cacheKey}. Hitting DB...`);
    const data = await this.repo.findAll(skip, take, status);
    
    this.customerCache.set(cacheKey, { data, expiry: Date.now() + this.CACHE_TTL });
    return data;
  }

  async findOne(id: string) {
    return this.repo.findById(id);
  }

  async create(data: any, staffId: string) {
    const res = await this.repo.createWithTransaction(data, staffId);
    this.invalidateCache();
    return res;
  }

  private invalidateCache() {
    this.logger.log('Invalidating Sales CRM Customer Cache');
    this.customerCache.clear();
  }
}
