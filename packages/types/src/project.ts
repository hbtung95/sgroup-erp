// ═══════════════════════════════════════════════════════════
// @sgroup/types — Project (Real Estate) Module Types
// Merged from:
//   - core/web-host/features/project/types.ts
//   - modules/project/web/src/lib/types.ts
// Contains the SUPERSET of all fields from both sources.
// ═══════════════════════════════════════════════════════════

// ─── Status Enums ───────────────────────────────────────────

export type ProjectStatus = 'UPCOMING' | 'SELLING' | 'HANDOVER' | 'CLOSED';

export type PropertyType = 'LAND' | 'APARTMENT' | 'VILLA' | 'SHOPHOUSE';

export type ProductStatus =
  | 'AVAILABLE'
  | 'LOCKED'
  | 'RESERVED'
  | 'PENDING_DEPOSIT'
  | 'DEPOSIT'
  | 'SOLD'
  | 'COMPLETED';

export type LegalDocStatus =
  | 'PREPARATION'
  | 'SUBMITTED'
  | 'ISSUE_FIXING'
  | 'APPROVED';

// ─── Domain Models ──────────────────────────────────────────

/** Real-estate project (brokerage listing) */
export interface Project {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly developer?: string;
  readonly location?: string;
  readonly province?: string;
  readonly district?: string;
  readonly imageUrl?: string;
  readonly type: PropertyType;
  readonly feeRate: number;
  readonly avgPrice: number;
  readonly totalUnits: number;
  readonly soldUnits: number;
  readonly status: ProjectStatus;
  readonly managerId?: string;
  readonly managerName?: string;
  readonly teamSize?: number;
  readonly progress?: number;
  readonly tags?: string;
  readonly startDate?: string | null;
  readonly endDate?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Individual real-estate product (unit / plot / lot) */
export interface Product {
  readonly id: string;
  readonly projectId: string;
  readonly code: string;
  readonly block?: string;
  readonly floor?: number;
  readonly area: number;
  readonly price: number;
  readonly commissionAmt?: number;
  readonly bonusAmt?: number;
  readonly direction?: string;
  readonly bedrooms?: number;
  readonly unitType?: string;
  readonly viewDesc?: string;
  readonly status: ProductStatus;
  readonly bookedBy?: string | null;
  readonly lockedUntil?: string | null;
  readonly customerName?: string | null;
  readonly customerPhone?: string | null;
  readonly salespersonId?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Legal document attached to a project */
export interface LegalDoc {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description?: string;
  readonly docType: string;
  readonly status: LegalDocStatus;
  readonly fileUrl: string;
  readonly uploadedBy: string;
  readonly assigneeName?: string | null;
  readonly submitDate?: string | null;
  readonly approveDate?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** Audit trail entry */
export interface AuditLog {
  readonly id: string;
  readonly userId: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly details: string;
  readonly createdAt: string;
}

// ─── Dashboard Aggregations ─────────────────────────────────

export interface DashboardStats {
  readonly totalProjects: number;
  readonly activeProjects: number;
  readonly completedProjects: number;
  readonly totalUnits: number;
  readonly totalProducts: number;
  readonly availableProducts: number;
  readonly lockedProducts: number;
  readonly soldProducts: number;
  readonly soldUnits: number;
  readonly totalRevenue: number;
  readonly totalCommission: number;
  readonly absorptionRate: number;
}

// ─── Form Payloads ──────────────────────────────────────────

export interface CreateProjectPayload {
  readonly code: string;
  readonly name: string;
  readonly description?: string;
  readonly developer?: string;
  readonly location?: string;
  readonly province?: string;
  readonly district?: string;
  readonly imageUrl?: string;
  readonly type: PropertyType;
  readonly feeRate?: number;
  readonly avgPrice?: number;
  readonly status?: ProjectStatus;
  readonly managerName?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

export interface CreateProductPayload {
  readonly code: string;
  readonly block?: string;
  readonly floor?: number;
  readonly area: number;
  readonly price: number;
  readonly direction?: string;
  readonly bedrooms?: number;
  readonly unitType?: string;
  readonly viewDesc?: string;
}
