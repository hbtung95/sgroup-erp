import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MktLeadRepository } from '../../infrastructure/repositories/mkt-lead.repository';
import { MarketingToSalesSyncService } from '../../application/services/marketing-to-sales-sync.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketing/leads')
export class MktLeadController {
  constructor(
    private readonly leadRepo: MktLeadRepository,
    private readonly syncService: MarketingToSalesSyncService
  ) {}

  @Get()
  @Roles('admin', 'cmo', 'marketing_manager', 'marketing_staff', 'sales_manager')
  findAll() {
    return this.leadRepo.findAll();
  }

  @Post()
  @Roles('admin', 'cmo', 'marketing_manager', 'marketing_staff')
  createLead(@Body() data: any) {
    return this.leadRepo.createLead(data);
  }

  @Post(':id/status')
  @Roles('admin', 'cmo', 'marketing_manager', 'marketing_staff', 'sales')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    const updatedLead = await this.leadRepo.updateLeadStatus(id, status);
    
    // Core Cross-Module Injection trigger
    if (status === 'QUALIFIED') {
      await this.syncService.handoffQualifiedLead(id);
    }
    
    return updatedLead;
  }
}
