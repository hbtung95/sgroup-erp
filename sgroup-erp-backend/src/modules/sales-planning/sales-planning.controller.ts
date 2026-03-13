import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SalesPlanningService } from './sales-planning.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('sales-planning')
@UseGuards(RolesGuard)
@Roles('admin', 'employee', 'sales', 'team_lead')
export class SalesPlanningController {
  constructor(private readonly service: SalesPlanningService) {}

  @Get('latest')
  async getLatest(@Query('year') year: string, @Query('scenario') scenario: string) {
    return this.service.getLatest(Number(year), scenario);
  }

  @Get('header')
  async getHeader(@Query('planId') planId: string) {
    return this.service.getHeader(planId);
  }

  @Get('months')
  async getMonths(@Query('planId') planId: string) {
    return this.service.getMonths(planId);
  }

  @Get('teams')
  async getTeams(@Query('planId') planId: string) {
    return this.service.getTeams(planId);
  }

  @Get('staff')
  async getStaff(@Query('planId') planId: string) {
    return this.service.getStaff(planId);
  }
}
