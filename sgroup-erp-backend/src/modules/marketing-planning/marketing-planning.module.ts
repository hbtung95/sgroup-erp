import { Module } from '@nestjs/common';
import { MarketingPlanningService } from './marketing-planning.service';
import { MarketingPlanningController } from './marketing-planning.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MarketingPlanningService],
  controllers: [MarketingPlanningController],
})
export class MarketingPlanningModule {}
