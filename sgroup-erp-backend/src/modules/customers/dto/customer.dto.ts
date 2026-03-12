import { IsString, IsOptional, IsInt, IsBoolean, IsIn, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @IsString()
  fullName: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  projectInterest?: string;

  @IsOptional() @IsString()
  budget?: string;

  @IsOptional()
  @IsIn(['NEW', 'CONTACTED', 'INTERESTED', 'MEETING', 'NEGOTIATION', 'WON', 'LOST'])
  status?: string;

  @IsOptional() @IsString()
  assignedTo?: string;

  @IsOptional() @IsString()
  assignedName?: string;

  @IsOptional() @IsBoolean()
  isVip?: boolean;

  @IsOptional() @IsString()
  note?: string;

  @IsInt() @Min(2020)
  year: number;

  @IsInt() @Min(1)
  month: number;
}

export class UpdateCustomerDto {
  @IsOptional() @IsString()
  fullName?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  projectInterest?: string;

  @IsOptional() @IsString()
  budget?: string;

  @IsOptional()
  @IsIn(['NEW', 'CONTACTED', 'INTERESTED', 'MEETING', 'NEGOTIATION', 'WON', 'LOST'])
  status?: string;

  @IsOptional() @IsString()
  assignedTo?: string;

  @IsOptional() @IsString()
  assignedName?: string;

  @IsOptional() @IsBoolean()
  isVip?: boolean;

  @IsOptional() @IsString()
  note?: string;

  @IsOptional() @IsDate() @Type(() => Date)
  lastContactAt?: Date;
}
