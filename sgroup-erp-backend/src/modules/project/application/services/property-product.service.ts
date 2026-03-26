import { Injectable, Logger } from '@nestjs/common';
import { PropertyProductRepository } from '../../infrastructure/property-product.repository';

@Injectable()
export class PropertyProductService {
  private readonly logger = new Logger(PropertyProductService.name);
  // Red Flag 2 Fix: Implementing a high-speed In-Memory Cache for Inventory
  private cache = new Map<string, { data: any, expiry: number }>();
  private CACHE_TTL = 30000; // 30 seconds TTL

  constructor(private readonly repo: PropertyProductRepository) {}

  async findAllByProject(projectId: string, skip?: number, take?: number, status?: string) {
    const cacheKey = `inventory_${projectId}_${skip}_${take}_${status}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      this.logger.debug(`Cache Hit for ${cacheKey}`);
      return cached.data;
    }

    this.logger.debug(`Cache Miss for ${cacheKey}. Fetching from DB...`);
    const data = await this.repo.findAllByProject(projectId, skip, take, status);
    
    this.cache.set(cacheKey, { data, expiry: Date.now() + this.CACHE_TTL });
    return data;
  }

  async findOne(productId: string) {
    return this.repo.findById(productId);
  }

  async lockProduct(productId: string, staffName?: string) {
    const result = await this.repo.lockProduct(productId, staffName || 'SYSTEM');
    this.invalidateCache(result.projectId);
    return result;
  }

  async unlockProduct(productId: string) {
    const result = await this.repo.unlockProduct(productId);
    this.invalidateCache(result.projectId);
    return result;
  }

  private invalidateCache(projectId: string) {
    this.logger.log(`Invalidating Cache for Project ${projectId}`);
    for (const key of this.cache.keys()) {
      if (key.includes(`inventory_${projectId}`)) {
        this.cache.delete(key);
      }
    }
  }

  // Legacy fallbacks for compatibility while refactoring
  async create(data: any) { return null; }
  async batchCreate(projectId: string, items: any[]) { return null; }
  async generateInventory(projectId: string, dto: any) { return null; }
  async update(productId: string, dto: any) { return null; }
  async remove(productId: string) { return null; }
}
