import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ExecPlanningRepository } from '../../infrastructure/repositories/exec-planning.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bdh/planning')
export class ExecPlanningController {
  constructor(private readonly planningRepo: ExecPlanningRepository) {}

  @Get()
  @Roles('ceo', 'admin', 'finance', 'planning')
  getPlan(
    @Query('year') year: string,
    @Query('scenario') scenarioKey: string,
    @Query('tab') tabKey: string
  ) {
    if (!year || !scenarioKey || !tabKey) return null;
    return this.planningRepo.getLatestPlan(+year, scenarioKey, tabKey);
  }

  @Post()
  @Roles('ceo', 'admin', 'planning')
  upsertPlan(
    @Query('year') year: string,
    @Query('scenario') scenarioKey: string,
    @Query('tab') tabKey: string,
    @Body() data: any,
    @Req() req: any
  ) {
    const userId = req.user?.id || 'SYSTEM';
    return this.planningRepo.upsertPlan(+year, scenarioKey, tabKey, data, userId);
  }

  @Get('kpis')
  @Roles('ceo', 'admin', 'planning')
  getKpis(
    @Query('year') year: string,
    @Query('scenario') scenarioKey: string,
    @Query('tab') tabKey: string
  ) {
    return this.planningRepo.getKpis(+year, scenarioKey, tabKey);
  }
}
