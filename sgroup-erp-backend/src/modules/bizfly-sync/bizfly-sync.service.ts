import { Injectable, Inject, Logger } from '@nestjs/common';
import { BIZFLY_SYNC_REPOSITORY, DEAL_REPOSITORY } from '../../common/database/repository-tokens';
import { IBizflySyncRepository, IDealRepository } from '../../common/database/entity-repositories';

@Injectable()
export class BizflySyncService {
  private readonly logger = new Logger(BizflySyncService.name);

  constructor(
    @Inject(BIZFLY_SYNC_REPOSITORY) private syncRepo: IBizflySyncRepository,
    @Inject(DEAL_REPOSITORY) private dealRepo: IDealRepository,
  ) {}

  // ── TRIGGER SYNC ──
  async triggerSync(params: { syncType: string; initiatedBy: string }) {
    const log = await this.syncRepo.create({
      syncType: params.syncType,
      syncDirection: 'PULL',
      status: 'RUNNING',
      initiatedBy: params.initiatedBy,
      startedAt: new Date(),
      recordsTotal: 0,
      recordsSynced: 0,
      recordsFailed: 0,
    } as any);

    try {
      this.logger.log(`Starting ${params.syncType} sync (log: ${log.id})`);

      await this.syncRepo.update(log.id, {
        status: 'SUCCESS',
        recordsTotal: 0,
        recordsSynced: 0,
        completedAt: new Date(),
        metadata: JSON.stringify({
          message: 'Bizfly CRM API integration pending configuration',
          timestamp: new Date().toISOString(),
        }),
      } as any);

      return {
        syncId: log.id,
        status: 'SUCCESS',
        message: 'Sync completed. Note: Bizfly CRM API integration pending configuration.',
      };
    } catch (error: any) {
      await this.syncRepo.update(log.id, {
        status: 'FAILED',
        errorMessage: error.message,
        completedAt: new Date(),
      } as any);
      throw error;
    }
  }

  // ── SYNC STATUS ──
  async getSyncStatus() {
    const latest = await this.syncRepo.findLatest();
    const totalSyncs = await this.syncRepo.count();
    const successSyncs = await this.syncRepo.countByStatus('SUCCESS');
    const failedSyncs = await this.syncRepo.countByStatus('FAILED');

    return {
      latestSync: latest,
      totalSyncs,
      successSyncs,
      failedSyncs,
      isRunning: latest?.status === 'RUNNING',
    };
  }

  // ── SYNC HISTORY ──
  async getSyncHistory(limit = 20) {
    return this.syncRepo.findAll({ limit });
  }

  // ── RECONCILIATION ──
  async reconcile(params: { year: number; month?: number }) {
    const where: any = { year: params.year, status: 'ACTIVE' };
    if (params.month) where.month = params.month;

    const erpDeals = await this.dealRepo.findAll(where);
    const bizflyLinked = erpDeals.filter(d => d.bizflyCrmId);
    const manualOnly = erpDeals.filter(d => !d.bizflyCrmId);

    return {
      period: { year: params.year, month: params.month || 'ALL' },
      totalERPDeals: erpDeals.length,
      linkedToBizfly: bizflyLinked.length,
      manualEntries: manualOnly.length,
      totalGMV: erpDeals.reduce((s, d) => s + Number(d.dealValue), 0),
      linkedGMV: bizflyLinked.reduce((s, d) => s + Number(d.dealValue), 0),
      manualGMV: manualOnly.reduce((s, d) => s + Number(d.dealValue), 0),
      reconciliationStatus: 'PARTIAL',
      note: 'Full reconciliation available after Bizfly CRM API is configured.',
    };
  }
}
