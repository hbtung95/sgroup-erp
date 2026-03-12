import { SetMetadata } from '@nestjs/common';

export const SALES_ROLES_KEY = 'salesRoles';

/**
 * Decorator to restrict access based on salesRole.
 * Usage: @SalesRoles('team_lead', 'sales_manager', 'sales_admin')
 * 
 * Note: Users with global role 'admin' always bypass this check.
 */
export const SalesRoles = (...roles: string[]) =>
  SetMetadata(SALES_ROLES_KEY, roles);
