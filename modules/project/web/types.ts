// ─── Project Types (synced with backend model) ───

export type REProjectStatus = 'UPCOMING' | 'SELLING' | 'HANDOVER' | 'CLOSED';
export type REPropertyType = 'LAND' | 'APARTMENT' | 'VILLA' | 'SHOPHOUSE';
export type REProductStatus = 'AVAILABLE' | 'LOCKED' | 'RESERVED' | 'PENDING_DEPOSIT' | 'DEPOSIT' | 'SOLD' | 'COMPLETED';
export type RELegalProcedureStatus = 'PREPARATION' | 'SUBMITTED' | 'ISSUE_FIXING' | 'APPROVED';

export interface REProject {
  id: string;
  code: string;
  name: string;
  description: string;
  developer: string;
  location: string;
  type: REPropertyType;
  feeRate: number;
  avgPrice: number;
  totalUnits: number;
  soldUnits: number;
  status: REProjectStatus;
  managerId: string;
  managerName: string;
  teamSize: number;
  progress: number;
  tags: string; // JSON array stored as text in backend
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt?: string;
}

export interface REProduct {
  id: string;
  projectId: string;
  code: string;
  block: string;
  floor: number;
  area: number;
  price: number;
  commissionAmt?: number;
  bonusAmt?: number;
  direction: string;
  bedrooms: number;
  unitType?: string;
  viewDesc?: string;
  status: REProductStatus;
  bookedBy?: string;
  lockedUntil?: string;
  customerName?: string;
  customerPhone?: string;
  salespersonId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface RELegalDoc {
  id: string;
  projectId: string;
  title: string;
  description: string;
  docType: string;
  status: RELegalProcedureStatus;
  fileUrl?: string;
  uploadedBy?: string;
  assigneeName?: string;
  submitDate?: string;
  approveDate?: string;
  createdAt?: string;
}

// ─── API Response Types ───

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiError {
  error: {
    code: number;
    message: string;
  };
}

// ─── Form Types ───

export interface CreateProjectPayload {
  code: string;
  name: string;
  description?: string;
  developer?: string;
  location?: string;
  type: REPropertyType;
  status?: REProjectStatus;
  managerName?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateProductPayload {
  code: string;
  block?: string;
  floor?: number;
  area: number;
  price: number;
  direction?: string;
  bedrooms?: number;
}
