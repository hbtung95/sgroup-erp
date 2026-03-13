import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_REPOSITORY } from '../../common/database/repository-tokens';
import { IUserRepository } from '../../common/database/entity-repositories';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY) private userRepo: IUserRepository,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(email: string, pass: string) {
    // SECURITY: Tránh timing attack — luôn so sánh bcrypt dù user không tồn tại
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      // Chạy bcrypt dummy để tránh timing-based user enumeration
      await bcrypt.compare(pass, '$2b$12$dummyhashtopreventtimingattacks0000000000');
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // SECURITY: CHỈ so sánh bcrypt — KHÔNG fallback plaintext bất kỳ hoàn cảnh nào
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      this.logger.warn(`Login failed for email: ${email}`);
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Lấy tên team nếu user thuộc sales team
    let teamName: string | null = null;
    if (user.teamId) {
      try {
        const team = await this.prisma.salesTeam.findUnique({
          where: { id: user.teamId },
          select: { name: true },
        });
        teamName = team?.name ?? null;
      } catch {
        /* team lookup optional — không block login */
      }
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      department: user.department,
      salesRole: user.salesRole,
      teamId: user.teamId,
    };

    this.logger.log(`Login success: ${email} (role=${user.role})`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        salesRole: user.salesRole,
        teamId: user.teamId,
        teamName,
      },
    };
  }

  /**
   * Tạo user mới — CHỈ DÙNG trong môi trường development.
   * Production: endpoint này được bảo vệ bởi @Roles('admin') ở controller.
   */
  async registerMockDev(data: {
    email: string;
    name: string;
    password?: string;
    role?: string;
  }) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(
        'Endpoint này không khả dụng trong môi trường production',
      );
    }

    if (!data.password || data.password.length < 8) {
      throw new ForbiddenException(
        'Mật khẩu phải có ít nhất 8 ký tự',
      );
    }

    const hashed = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    return this.userRepo.create({
      email: data.email,
      name: data.name,
      role: data.role || 'employee',
      password: hashed,
    } as any);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    // SECURITY: CHỈ bcrypt compare — KHÔNG fallback plaintext
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
    }

    if (newPassword.length < 8) {
      throw new ForbiddenException('Mật khẩu mới phải có ít nhất 8 ký tự');
    }

    const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.userRepo.update(userId, { password: hashed } as any);

    this.logger.log(`Password changed for userId: ${userId}`);
    return { message: 'Đổi mật khẩu thành công' };
  }
}
