import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the current authenticated user from the request.
 * Usage: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);

/**
 * JWT Payload interface enriched with Sales-specific fields.
 */
export interface JwtPayload {
  sub: string;        // User ID
  email: string;
  role: string;       // Global role: admin, hr, employee
  name: string;
  department?: string;
  salesRole?: string; // sales, team_lead, sales_manager, sales_director, sales_admin
  teamId?: string;
  salesStaffId?: string;
}
