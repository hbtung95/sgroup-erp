import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsDateString()
  @IsOptional()
  checkInTime?: string;

  @IsDateString()
  @IsOptional()
  checkOutTime?: string;

  @IsNumber()
  @IsOptional()
  workingHours?: number;

  @IsString()
  @IsOptional()
  note?: string;
}
