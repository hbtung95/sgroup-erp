import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { MktPlanningRepository } from '../../infrastructure/repositories/mkt-planning.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketing/planning')
export class MktPlanningController {
  constructor(private readonly planningRepo: MktPlanningRepository) {}

  @Get('master-plan')
  @Roles('admin', 'cmo', 'ceo')
  getMasterPlan(@Query('year') year: string, @Query('scenarioKey') scenarioKey: string) {
    return this.planningRepo.getMasterPlan(Number(year), scenarioKey);
  }

  @Get(':planId/budgets')
  @Roles('admin', 'cmo', 'ceo')
  getChannelBudgets(@Param('planId') planId: string) {
    return this.planningRepo.getChannelBudgets(planId);
  }
}
