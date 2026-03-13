import { Module } from '@nestjs/common';
import { LegalService } from './legal.service';
import { LegalController } from './legal.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { LegalCron } from './legal.cron';

@Module({
  imports: [PrismaModule],
  controllers: [LegalController],
  providers: [LegalService, LegalCron],
  exports: [LegalService],
})
export class LegalModule {}
