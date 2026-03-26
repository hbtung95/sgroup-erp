import { Module } from '@nestjs/common';
import { EmployeeController } from './presentation/employee.controller';
import { EmployeeService } from './application/employee.service';
import { EmployeeRepository } from './infrastructure/employee.repository';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository],
  exports: [EmployeeService],
})
export class EmployeeModule {}
