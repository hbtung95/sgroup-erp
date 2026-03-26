import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class SecuritySessionRepository {
  private readonly logger = new Logger(SecuritySessionRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async getUserActiveSessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, deviceInfo: true, createdAt: true, expiresAt: true }
    });
  }

  async revokeSession(sessionId: string) {
    const token = await this.prisma.refreshToken.findUnique({ where: { id: sessionId } });
    if (!token) throw new NotFoundException('Session not found');

    await this.prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });

    this.logger.log(`Session revoked: ${sessionId}`);
    return { success: true };
  }

  async revokeAllUserSessions(userId: string) {
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    return { revoked: result.count };
  }
}
