import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AgencyRepository } from './infrastructure/repositories/agency.repository';
import { AgencyController } from './presentation/controllers/agency.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AgencyController],
  providers: [AgencyRepository],
  exports: [AgencyRepository]
})
export class AgencyModule {}
