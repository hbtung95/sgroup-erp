import { Module } from '@nestjs/common';
import { PayrollController } from './presentation/payroll.controller';
import { PayrollService } from './application/payroll.service';
import { PayrollRepository } from './infrastructure/payroll.repository';

@Module({
  controllers: [PayrollController],
  providers: [PayrollService, PayrollRepository],
  exports: [PayrollService],
})
export class PayrollModule {}
