export type HRRole = 'admin' | 'hr_manager' | 'hr_director' | 'staff';
export type WorkStatus = 'ACTIVE' | 'PROBATION' | 'ON_LEAVE' | 'TERMINATED';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  manager?: Employee;
  _count?: {
    employees: number;
  };
  teams?: Team[];
}

export interface Position {
  id: string;
  name: string;
  code: string;
  level: string;
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  description?: string;
  departmentId?: string;
  _count?: {
    employees: number;
  };
}

export interface Employee {
  id: string;
  code: string; // The backend uses "code" (employeeCode logic mapped to code)
  firstName: string;
  lastName: string;
  fullName: string;
  englishName?: string;
  email: string;
  phone?: string;
  relativePhone?: string;
  identityCard?: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  vnId?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  permanentAddress?: string;
  contactAddress?: string;
  avatarUrl?: string;

  taxCode?: string;
  insuranceBookNumber?: string;
  bankName?: string;
  bankAccount?: string;

  departmentId?: string | number;
  department?: Department;
  
  positionId?: string | number;
  position?: Position;
  
  teamId?: string | number;
  team?: Team;

  status: WorkStatus | string;
  joinDate?: string;
  leaveDate?: string;

  managerId?: string | number;
  manager?: Employee;

  createdAt?: string;
  updatedAt?: string;
}

export interface TransferRecord {
  id: string;
  transferType: 'DEPARTMENT' | 'TEAM' | 'BOTH';
  fromDepartment?: Department;
  toDepartment?: Department;
  fromTeam?: Team;
  toTeam?: Team;
  effectiveDate: string;
}

export interface HRDashboardData {
  totalEmployees: number;
  activeEmployees: number;
  probationEmployees: number;
  pendingLeaves: number;
  departmentCount?: number;
  onLeaveCount?: number;
}
