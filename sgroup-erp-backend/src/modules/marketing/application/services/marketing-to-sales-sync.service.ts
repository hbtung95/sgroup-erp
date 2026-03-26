import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class MarketingToSalesSyncService {
  private readonly logger = new Logger(MarketingToSalesSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tự động sinh Khách Hàng Khảo Sát bên luồng CRM khi Lead Marketing ĐẠT CHUẨN.
   */
  async handoffQualifiedLead(leadId: string) {
    this.logger.log(`[Cross-Module Sync] Auto-handoff Lead ${leadId} to Sales CRM...`);
    
    return this.prisma.$transaction(async (tx) => {
      const lead = await tx.mktLead.findUnique({ where: { id: leadId } });
      if (!lead) throw new Error('Lead not found');

      // 1. Mark Marketing Lead as QUALIFIED
      await tx.mktLead.update({
        where: { id: leadId },
        data: { status: 'QUALIFIED' }
      });

      // 2. Secretly Inject Customer to Sales CRM
      // The sales team automatically gets a new Customer on their FSD views
      const injectedCustomer = await tx.customer.create({
        data: {
          fullName: lead.name,
          phone: lead.phone || 'UNKNOWN',
          email: lead.email,
          source: lead.source as any,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          status: 'POTENTIAL',
          tags: JSON.stringify(['MARKETING_HANDOFF', 'HOT_LEAD'])
        }
      });

      this.logger.log(`[Cross-Module Sync] Successfully injected Customer ${injectedCustomer.id} for Sales Hunters.`);
      return injectedCustomer;
    });
  }
}
