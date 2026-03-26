import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MktCampaignRepository } from '../../infrastructure/repositories/mkt-campaign.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketing/campaigns')
export class MktCampaignController {
  constructor(private readonly campaignRepo: MktCampaignRepository) {}

  @Get()
  @Roles('admin', 'cmo', 'marketing_manager', 'marketing_staff')
  findAll() {
    return this.campaignRepo.findAll();
  }

  @Get(':id')
  @Roles('admin', 'cmo', 'marketing_manager', 'marketing_staff')
  findById(@Param('id') id: string) {
    return this.campaignRepo.findById(id);
  }
}
