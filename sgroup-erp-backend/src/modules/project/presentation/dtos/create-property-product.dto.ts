import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreatePropertyProductDto {
  @IsString()
  projectId: string;

  @IsString()
  @IsOptional()
  projectName?: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  block?: string;

  @IsNumber()
  @IsOptional()
  floor?: number;

  @IsNumber()
  @IsOptional()
  area?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  direction?: string;

  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  bookedBy?: string;

  @IsDateString()
  @IsOptional()
  lockedUntil?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
