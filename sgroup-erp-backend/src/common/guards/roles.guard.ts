import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard — kiểm tra role của user so với @Roles() decorator.
 *
 * SECURITY: Dùng so sánh EXACT MATCH (===) để tránh lỗ hổng string.includes()
 * Ví dụ lỗi cũ: "sales_manager".includes("sales") === true → BYPASS
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Không có @Roles() decorator → cho qua (chỉ cần auth)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Chưa xác thực người dùng');
    }

    // Lấy cả system role và salesRole của user
    const userRoles = [user.role, user.salesRole].filter(Boolean) as string[];

    // SECURITY: Exact match (===) — KHÔNG dùng includes() hay startsWith()
    const hasRole = requiredRoles.some((required) =>
      userRoles.some((userRole) => userRole === required),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Bạn không có quyền truy cập. Cần role: ${requiredRoles.join(' hoặc ')}`,
      );
    }

    return true;
  }
}
