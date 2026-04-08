/**
 * Admin Module — Shared Constants
 * Single source of truth for roles, departments, and colors
 */

export const ROLE_OPTIONS = [
  { value: 'admin',    label: 'Admin',      color: '#ef4444' },
  { value: 'hr',       label: 'HR',         color: '#ec4899' },
  { value: 'employee', label: 'Nhân viên',  color: '#6366f1' },
  { value: 'sales',    label: 'Sales',      color: '#3b82f6' },
  { value: 'ceo',      label: 'CEO',        color: '#f59e0b' },
] as const;

export type RoleValue = (typeof ROLE_OPTIONS)[number]['value'];

export const DEPT_OPTIONS = ['SALES', 'MARKETING', 'HR', 'FINANCE', 'OPS'] as const;

export type DeptValue = (typeof DEPT_OPTIONS)[number];

/** Lookup role label+color by role value */
export function getRoleStyle(role: string) {
  const r = ROLE_OPTIONS.find(o => o.value === role);
  return r || { value: role, label: role, color: '#64748b' };
}

/** HTTP method color mapping for audit logs */
export const METHOD_COLORS: Record<string, { color: string; bg: string }> = {
  POST:   { color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  PATCH:  { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  PUT:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  DELETE: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};
