import { IsNumber, IsNotEmpty, IsString, IsOptional, Min, Max } from 'class-validator';

export class GeneratePayrollDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(2000)
  year: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(12)
  month: number;
}

export class ApprovePayrollDto {
  @IsString()
  @IsNotEmpty()
  period: string;

  @IsString()
  @IsNotEmpty()
  approvedBy: string;

  @IsString()
  @IsOptional()
  note?: string;
}
