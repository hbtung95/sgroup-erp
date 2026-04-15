// ==================== Enums ====================

export type ProjectStatus = "UPCOMING" | "SELLING" | "HANDOVER" | "CLOSED";
export type ProductStatus = "AVAILABLE" | "LOCKED" | "RESERVED" | "PENDING_DEPOSIT" | "DEPOSIT" | "SOLD" | "COMPLETED";
export type PropertyType = "LAND" | "APARTMENT" | "VILLA" | "SHOPHOUSE";
export type LegalDocStatus = "PREPARATION" | "SUBMITTED" | "ISSUE_FIXING" | "APPROVED";

// ==================== Models ====================

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  developer: string;
  location: string;
  province: string;
  district: string;
  imageUrl: string;
  type: PropertyType;
  feeRate: number;
  avgPrice: number;
  totalUnits: number;
  soldUnits: number;
  status: ProjectStatus;
  managerId: string;
  managerName: string;
  teamSize: number;
  progress: number;
  tags: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  projectId: string;
  code: string;
  block: string;
  floor: number;
  area: number;
  price: number;
  direction: string;
  bedrooms: number;
  unitType: string;
  viewDesc: string;
  status: ProductStatus;
  bookedBy: string | null;
  lockedUntil: string | null;
  customerName: string | null;
  customerPhone: string | null;
  salespersonId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LegalDoc {
  id: string;
  projectId: string;
  title: string;
  description: string;
  docType: string;
  status: LegalDocStatus;
  fileUrl: string;
  uploadedBy: string;
  assigneeName: string | null;
  submitDate: string | null;
  approveDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalUnits: number;
  totalProducts: number;
  availableProducts: number;
  lockedProducts: number;
  soldProducts: number;
  soldUnits: number;
  totalRevenue: number;
  totalCommission: number;
  absorptionRate: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

// ==================== Form Types ====================

export interface CreateProjectForm {
  code: string;
  name: string;
  description?: string;
  developer?: string;
  location?: string;
  province?: string;
  district?: string;
  imageUrl?: string;
  type: PropertyType;
  feeRate: number;
  avgPrice?: number;
  status?: ProjectStatus;
}

export interface CreateProductForm {
  code: string;
  block: string;
  floor: number;
  area: number;
  price: number;
  direction: string;
  bedrooms: number;
  unitType?: string;
  viewDesc?: string;
}

// ==================== Constants ====================

export const PROJECT_STATUS_MAP: Record<ProjectStatus, { label: string; color: string; bg: string; border: string }> = {
  UPCOMING: { label: "Sắp mở bán", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20" },
  SELLING: { label: "Đang bán", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
  HANDOVER: { label: "Bàn giao", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" },
  CLOSED: { label: "Đã đóng", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-200 dark:bg-slate-500/10", border: "border-slate-300 dark:border-slate-500/20" },
};

export const PRODUCT_STATUS_MAP: Record<ProductStatus, { label: string; color: string; bg: string; border: string }> = {
  AVAILABLE: { label: "Mở bán", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
  LOCKED: { label: "Đã khóa", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-500/10", border: "border-yellow-200 dark:border-yellow-500/20" },
  RESERVED: { label: "Giữ chỗ", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-500/10", border: "border-orange-200 dark:border-orange-500/20" },
  PENDING_DEPOSIT: { label: "Chờ cọc", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-500/10", border: "border-cyan-200 dark:border-cyan-500/20" },
  DEPOSIT: { label: "Đã cọc", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" },
  SOLD: { label: "Đã bán", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20" },
  COMPLETED: { label: "Hoàn tất", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/20" },
};

export const PROPERTY_TYPE_MAP: Record<PropertyType, string> = {
  LAND: "Đất nền",
  APARTMENT: "Căn hộ",
  VILLA: "Biệt thự",
  SHOPHOUSE: "Shophouse",
};
