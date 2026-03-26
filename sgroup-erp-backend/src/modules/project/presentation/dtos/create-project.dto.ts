import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  projectCode: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  developer?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  feeRate?: number;

  @IsNumber()
  @IsOptional()
  avgPrice?: number;

  @IsNumber()
  @IsOptional()
  totalUnits?: number;

  @IsNumber()
  @IsOptional()
  soldUnits?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
