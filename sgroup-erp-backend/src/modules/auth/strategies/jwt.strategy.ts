import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'sgroup-erp-dev-secret-key-2026',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        department: true,
        salesRole: true,
        teamId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị xóa');
    }

    // Look up SalesStaff ID if user is in Sales department
    let salesStaffId: string | null = null;
    if (user.department === 'SALES' || user.salesRole) {
      const staff = await this.prisma.salesStaff.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });
      salesStaffId = staff?.id || null;
    }

    return {
      ...user,
      salesStaffId,
    };
  }
}
