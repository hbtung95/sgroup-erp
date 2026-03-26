import { Injectable, Logger } from '@nestjs/common';
import { DebtRecordRepository } from '../../infrastructure/repositories/debt-record.repository';

@Injectable()
export class SalesToFinanceSyncService {
  private readonly logger = new Logger(SalesToFinanceSyncService.name);

  constructor(private readonly debtRepo: DebtRecordRepository) {}

  /**
   * Cross-Module Event Handler:
   * Được trigger khi module Sales-CRM chốt FactDeal thành công (Event Emitter).
   * Đảm bảo CFO không phải gõ tay mã hợp đồng.
   */
  async handleDealClosed(payload: {
    dealId: string;
    customerId: string;
    totalAmount: number;
    salesStaffId: string;
  }) {
    this.logger.log(`[Cross-Module Sync] Auto-generating CFO DebtRecord for Deal ${payload.dealId}...`);
    
    const debt = await this.debtRepo.generateDebtFromDeal({
      customerId: payload.customerId,
      dealId: payload.dealId,
      totalAmount: payload.totalAmount,
      note: `Auto-synced from Sales Staff ${payload.salesStaffId}`
    });

    this.logger.log(`[Cross-Module Sync] Successfully injected DebtRecord ${debt.debtCode} to Finance Ledgers.`);
    return debt;
  }
}
