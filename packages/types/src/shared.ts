// ═══════════════════════════════════════════════════════════
// @sgroup/types — Cross-Module Shared Types
//
// Types here are ONLY for data that crosses module boundaries.
// Module-specific types belong in modules/{module}/web/types/.
// ═══════════════════════════════════════════════════════════

/** Identifies which module an entity belongs to. */
export type ModuleId = 'hr' | 'project' | 'sales' | 'crm' | 'accounting';

/** Base entity interface — every domain entity has these fields. */
export interface BaseEntity {
  readonly id: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/** Audit trail fields for entities that track who modified them. */
export interface AuditableEntity extends BaseEntity {
  readonly created_by?: string;
  readonly updated_by?: string;
}

/**
 * Lightweight user reference for cross-module contexts.
 * Example: HR provides employee data → Sales references NVKD by this shape.
 */
export interface UserReference {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly avatar_url?: string;
  readonly department?: string;
  readonly position?: string;
}

/**
 * Lightweight project reference for cross-module contexts.
 * Example: Project module data referenced by Sales for inventory linking.
 */
export interface ProjectReference {
  readonly id: string;
  readonly name: string;
  readonly code: string;
  readonly status: string;
}

/** Address value object — used by HR, CRM, Project, and Sales. */
export interface Address {
  readonly street?: string;
  readonly ward?: string;
  readonly district?: string;
  readonly city: string;
  readonly province?: string;
  readonly country: string;
  readonly postal_code?: string;
}

/** Money value object with currency awareness. */
export interface Money {
  readonly amount: number;
  readonly currency: string; // ISO 4217 e.g. 'VND', 'USD'
}

/** Date range value object. */
export interface DateRange {
  readonly start_date: string;
  readonly end_date: string;
}

/** File/attachment metadata. */
export interface Attachment {
  readonly id: string;
  readonly filename: string;
  readonly url: string;
  readonly size_bytes: number;
  readonly mime_type: string;
  readonly uploaded_at: string;
}
