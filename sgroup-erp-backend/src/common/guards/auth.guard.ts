import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';

/**
 * ⚠️  DEPRECATED — KHÔNG SỬ DỤNG GUARD NÀY
 *
 * Guard này là skeleton placeholder và LUÔN LUÔN cho phép tất cả requests đi qua.
 * Nó KHÔNG thực hiện bất kỳ authentication nào.
 *
 * Guard chính xác phải dùng:
 *  - JwtAuthGuard (src/common/guards/jwt-auth.guard.ts) — đã được register
 *    làm APP_GUARD global trong app.module.ts
 *
 * File này được giữ lại để tránh lỗi import, nhưng sẽ throw lỗi nếu
 * ai cố tình inject/sử dụng nó (trừ trên local dev).
 *
 * @deprecated Dùng JwtAuthGuard thay thế
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Cảnh báo to rõ ràng trong logs nếu guard này được gọi
    this.logger.error(
      '🚨 SECURITY WARNING: AuthGuard (skeleton) đang được sử dụng!\n' +
      `   Route: ${request.method} ${request.url}\n` +
      '   Guard này KHÔNG authenticate — tất cả requests bị ALLOW.\n' +
      '   Hãy kiểm tra lại tại sao JwtAuthGuard không được áp dụng cho route này.',
    );

    // Trong production: từ chối để tránh lộ endpoint không protected
    if (process.env.NODE_ENV === 'production') {
      this.logger.error(
        '🚨 PRODUCTION BLOCK: Skeleton AuthGuard bị gọi trên production — DENIED.',
      );
      return false;
    }

    // Dev/test: cho qua nhưng vẫn cảnh báo
    return true;
  }
}
