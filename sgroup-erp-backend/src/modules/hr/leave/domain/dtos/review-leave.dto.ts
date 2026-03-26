import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class ReviewLeaveDto {
  @IsString()
  @IsNotEmpty()
  approverId: string;

  @IsString()
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  note?: string;
}
