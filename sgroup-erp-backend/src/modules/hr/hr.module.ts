import { Module } from '@nestjs/common';
import { EmployeeModule } from './employee/employee.module';
import { LeaveModule } from './leave/leave.module';
import { PayrollModule } from './payroll/payroll.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    EmployeeModule,
    LeaveModule,
    PayrollModule,
    AttendanceModule,
  ],
})
export class HrModule {}
