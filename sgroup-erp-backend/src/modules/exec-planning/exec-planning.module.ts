import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExecDashboardRepository } from './infrastructure/repositories/exec-dashboard.repository';
import { ExecPlanningRepository } from './infrastructure/repositories/exec-planning.repository';
import { ExecDashboardController } from './presentation/controllers/exec-dashboard.controller';
import { ExecPlanningController } from './presentation/controllers/exec-planning.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    ExecDashboardController,
    ExecPlanningController
  ],
  providers: [
    ExecDashboardRepository,
    ExecPlanningRepository
  ],
  exports: []
})
export class ExecPlanningModule {}
