import { IsString, IsNotEmpty, IsOptional, IsEmail, IsDateString, IsEnum } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  englishName?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEmail()
  @IsOptional()
  personalEmail?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  identityNumber?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  positionId?: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsDateString()
  @IsNotEmpty()
  joinDate: string;

  @IsString()
  @IsOptional()
  status?: string;
}
