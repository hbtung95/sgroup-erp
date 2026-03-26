import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExecDashboardRepository } from '../../infrastructure/repositories/exec-dashboard.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bdh/dashboard')
export class ExecDashboardController {
  constructor(private readonly dashboardRepo: ExecDashboardRepository) {}

  @Get('overview')
  @Roles('ceo', 'admin')
  getGlobalOverview() {
    return this.dashboardRepo.getGlobalOverview();
  }

  @Get('pulse/:dept')
  @Roles('ceo', 'admin')
  getDepartmentPulse(@Param('dept') dept: 'SALES' | 'MK' | 'HR' | 'FINANCE') {
    return this.dashboardRepo.getDepartmentPulse(dept);
  }
}
