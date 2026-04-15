// ═══════════════════════════════════════════════════════════
// @sgroup/types — Auth Types
// Single Source of Truth for authentication across all modules
// ═══════════════════════════════════════════════════════════

/** User roles across the ERP system */
export type UserRole =
  | 'admin'
  | 'hr'
  | 'employee'
  | 'sales_manager'
  | 'sales_director';

/** Authenticated user profile */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly modules: string[];
  readonly salesRole?: string;
  readonly department?: string;
  readonly teamId?: string;
  readonly teamName?: string;
}

/** Login credentials payload */
export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

/** Server response after successful login */
export interface LoginResponse {
  readonly user: AuthUser;
  readonly token: string;
}
