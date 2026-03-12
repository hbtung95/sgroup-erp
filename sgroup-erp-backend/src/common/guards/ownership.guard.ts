import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const OWNERSHIP_KEY = 'ownership';

/**
 * Ownership levels:
 *   'own'  → User can only access their own data (staffId matches)
 *   'team' → User can access data within their team
 *   'all'  → User can access all data
 *
 * The guard checks user's salesRole to determine their access scope,
 * then filters based on the query param or body content.
 *
 * Usage:
 *   @SetMetadata('ownership', 'own')  → sales staff only sees own data
 *   @SetMetadata('ownership', 'team') → at minimum team_lead to see team data
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ownershipLevel = this.reflector.getAllAndOverride<string>(
      OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No ownership metadata → allow
    if (!ownershipLevel) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Chưa xác thực');
    }

    // Admin always passes
    if (user.role === 'admin' || user.salesRole === 'sales_admin') {
      return true;
    }

    // sales_manager / sales_director can see everything
    if (['sales_manager', 'sales_director'].includes(user.salesRole)) {
      return true;
    }

    // team_lead can see team data
    if (user.salesRole === 'team_lead') {
      if (ownershipLevel === 'own' || ownershipLevel === 'team') {
        // Inject teamId filter into request for service-level filtering
        request._ownershipScope = 'team';
        request._ownershipTeamId = user.teamId;
        return true;
      }
    }

    // Regular sales: can only see own data
    if (ownershipLevel === 'own') {
      request._ownershipScope = 'own';
      request._ownershipStaffId = user.salesStaffId;
      return true;
    }

    throw new ForbiddenException(
      'Bạn không có quyền truy cập dữ liệu này',
    );
  }
}
