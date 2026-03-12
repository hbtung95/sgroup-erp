import { IsString, IsOptional, IsInt, IsNumber, IsIn, Min } from 'class-validator';

// ── Teams ──
export class CreateTeamDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional() @IsString()
  leaderId?: string;

  @IsOptional() @IsString()
  leaderName?: string;

  @IsOptional() @IsString()
  region?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;

  @IsOptional() @IsInt()
  sortOrder?: number;
}

export class UpdateTeamDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  leaderId?: string;

  @IsOptional() @IsString()
  leaderName?: string;

  @IsOptional() @IsString()
  region?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;

  @IsOptional() @IsInt()
  sortOrder?: number;
}

// ── Staff ──
export class CreateStaffDto {
  @IsString()
  fullName: string;

  @IsOptional() @IsString()
  userId?: string;

  @IsOptional() @IsString()
  employeeCode?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  teamId?: string;

  @IsOptional()
  @IsIn(['sales', 'team_lead', 'sales_manager', 'sales_director', 'sales_admin'])
  role?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
  status?: string;

  @IsOptional() @IsInt()
  leadsCapacity?: number;

  @IsOptional() @IsNumber()
  personalTarget?: number;
}

export class UpdateStaffDto {
  @IsOptional() @IsString()
  fullName?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  teamId?: string;

  @IsOptional()
  @IsIn(['sales', 'team_lead', 'sales_manager', 'sales_director', 'sales_admin'])
  role?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'ON_LEAVE'])
  status?: string;

  @IsOptional() @IsInt()
  leadsCapacity?: number;

  @IsOptional() @IsNumber()
  personalTarget?: number;
}

// ── Deals ──
export class CreateDealDto {
  @IsOptional() @IsString()
  dealCode?: string;

  @IsOptional() @IsString()
  projectId?: string;

  @IsOptional() @IsString()
  projectName?: string;

  @IsOptional() @IsString()
  staffId?: string;

  @IsOptional() @IsString()
  staffName?: string;

  @IsOptional() @IsString()
  customerName?: string;

  @IsOptional() @IsString()
  customerPhone?: string;

  @IsOptional() @IsString()
  productCode?: string;

  @IsNumber()
  dealValue: number;

  @IsOptional() @IsNumber()
  feeRate?: number;

  @IsOptional() @IsNumber()
  commission?: number;

  @IsOptional()
  @IsIn(['LEAD', 'MEETING', 'BOOKING', 'DEPOSIT', 'CONTRACT', 'COMPLETED', 'CANCELLED'])
  stage?: string;

  @IsOptional() @IsString()
  dealDate?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  note?: string;

  @IsInt() @Min(2020)
  year: number;

  @IsInt() @Min(1)
  month: number;
}

// ── Projects ──
export class CreateProjectDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  code?: string;

  @IsOptional() @IsString()
  developer?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsInt()
  totalUnits?: number;

  @IsOptional()
  @IsIn(['ACTIVE', 'CLOSED', 'COMING_SOON'])
  status?: string;
}
