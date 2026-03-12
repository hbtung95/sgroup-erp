import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SALES_ROLES_KEY } from '../decorators/sales-roles.decorator';

/**
 * Sales Role hierarchy (higher index = more power):
 *   sales < team_lead < sales_manager < sales_director < sales_admin
 *
 * Global role 'admin' always bypasses.
 */
const SALES_ROLE_HIERARCHY: Record<string, number> = {
  sales: 1,
  senior_sales: 2,
  team_lead: 3,
  sales_manager: 4,
  sales_director: 5,
  sales_admin: 6,
};

@Injectable()
export class SalesRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      SALES_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @SalesRoles() decorator → allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Chưa xác thực');
    }

    // Global admin always passes
    if (user.role === 'admin') {
      return true;
    }

    // Check if user's salesRole meets the minimum required level
    const userLevel = SALES_ROLE_HIERARCHY[user.salesRole] || 0;
    const minRequired = Math.min(
      ...requiredRoles.map((r) => SALES_ROLE_HIERARCHY[r] || 99),
    );

    if (userLevel < minRequired) {
      throw new ForbiddenException(
        `Bạn cần quyền "${requiredRoles.join(' hoặc ')}" để thực hiện thao tác này`,
      );
    }

    return true;
  }
}
