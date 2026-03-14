import { IsString, IsOptional, IsInt, IsNumber, IsIn, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsNumber()
  feeRate: number;

  @IsOptional() @IsNumber()
  commission?: number;

  @IsOptional()
  @IsIn(['LEAD', 'MEETING', 'BOOKING', 'DEPOSIT', 'CONTRACT', 'COMPLETED', 'CANCELLED'])
  stage?: string;

  @IsOptional() @IsDate() @Type(() => Date)
  dealDate?: Date;

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
  projectCode: string;

  @IsString()
  name: string;

  @IsOptional() @IsString()
  developer?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsString()
  type?: string;

  @IsOptional() @IsNumber()
  feeRate?: number;

  @IsOptional() @IsNumber()
  avgPrice?: number;

  @IsOptional() @IsInt()
  totalUnits?: number;

  @IsOptional()
  @IsIn(['ACTIVE', 'CLOSED', 'COMING_SOON'])
  status?: string;
}

// ── Bookings ──
export class ListBookingsDto {
  @IsOptional() @Type(() => Number) @IsInt()
  year?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  month?: number;

  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'])
  status?: string;

  @IsOptional() @IsString()
  projectId?: string;
}

export class CreateBookingDto {
  @IsString()
  project: string;

  @IsOptional() @IsString()
  projectId?: string;

  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @Type(() => Number) @IsNumber()
  bookingAmount: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  bookingCount?: number;

  @IsOptional() @IsString()
  note?: string;
}

export class UpdateBookingDto {
  @IsOptional() @IsString()
  project?: string;

  @IsOptional() @IsString()
  projectId?: string;

  @IsOptional() @IsString()
  customerName?: string;

  @IsOptional() @IsString()
  customerPhone?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  bookingAmount?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  bookingCount?: number;

  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELED'])
  status?: string;

  @IsOptional() @IsString()
  note?: string;
}

// ── Deposits ──
export class ListDepositsDto {
  @IsOptional() @Type(() => Number) @IsInt()
  year?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  month?: number;

  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED'])
  status?: string;

  @IsOptional() @IsString()
  projectId?: string;
}

export class CreateDepositDto {
  @IsString()
  project: string;

  @IsOptional() @IsString()
  projectId?: string;

  @IsString()
  unitCode: string;

  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @Type(() => Number) @IsNumber()
  depositAmount: number;

  @IsOptional() @IsString()
  paymentMethod?: string;

  @IsOptional() @IsString()
  receiptNo?: string;

  @IsOptional() @IsString()
  notes?: string;
}

export class UpdateDepositDto {
  @IsOptional() @IsString()
  project?: string;

  @IsOptional() @IsString()
  projectId?: string;

  @IsOptional() @IsString()
  unitCode?: string;

  @IsOptional() @IsString()
  customerName?: string;

  @IsOptional() @IsString()
  customerPhone?: string;

  @IsOptional() @Type(() => Number) @IsNumber()
  depositAmount?: number;

  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED'])
  status?: string;

  @IsOptional() @IsString()
  paymentMethod?: string;

  @IsOptional() @IsString()
  receiptNo?: string;

  @IsOptional() @IsString()
  notes?: string;
}
