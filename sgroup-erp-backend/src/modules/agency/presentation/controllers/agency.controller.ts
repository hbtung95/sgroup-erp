import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AgencyRepository } from '../../infrastructure/repositories/agency.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('agency')
export class AgencyController {
  constructor(private readonly repo: AgencyRepository) {}

  @Get('overview')
  @Roles('ceo', 'admin', 'agency_manager')
  getNetworkOverview() {
    return this.repo.getNetworkOverview();
  }

  @Get('list')
  @Roles('ceo', 'admin', 'agency_manager')
  getAllAgencies() {
    return this.repo.getAllAgencies();
  }

  @Post('create')
  @Roles('ceo', 'admin', 'agency_manager')
  createAgency(@Body() data: any) {
    return this.repo.createAgency(data);
  }

  @Post('commission/:id')
  @Roles('ceo', 'admin', 'finance')
  processCommission(@Param('id') id: string, @Body() data: { amount: number, referenceId: string }) {
    return this.repo.processCommission(id, data.amount, data.referenceId);
  }
}
