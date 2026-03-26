import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateLeaveDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  leaveType: any; // Mapped to Prisma LeaveType enum or string

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsNumber()
  @Min(0.5)
  totalDays: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
