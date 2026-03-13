import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MarketingPlanningService } from './marketing-planning.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('marketing-planning')
@UseGuards(RolesGuard)
@Roles('admin', 'marketing')
export class MarketingPlanningController {
  constructor(private readonly service: MarketingPlanningService) {}

  @Get('header')
  async getHeader(@Query('planId') planId: string) {
    return this.service.getHeader(planId);
  }

  @Get('channel-budgets')
  async getChannelBudgets(@Query('planId') planId: string) {
    return this.service.getChannelBudgets(planId);
  }

  @Get('kpi-targets')
  async getKpiTargets(@Query('planId') planId: string) {
    return this.service.getKpiTargets(planId);
  }

  @Get('assumptions')
  async getAssumptions(@Query('planId') planId: string) {
    return this.service.getAssumptions(planId);
  }

  @Get('channel-roi')
  async getChannelROI(@Query('planId') planId: string) {
    return this.service.getChannelROI(planId);
  }
}
