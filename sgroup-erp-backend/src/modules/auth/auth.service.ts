import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_REPOSITORY } from '../../common/database/repository-tokens';
import { IUserRepository } from '../../common/database/entity-repositories';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private userRepo: IUserRepository,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.userRepo.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại trong hệ thống');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
       // Support legacy plain text passwords during dev phase if bcrypt fails
      if (pass !== user.password) {
        throw new UnauthorizedException('Mật khẩu không chính xác');
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
      }
    };
  }

  async registerMockDev(data: any) {
    // DEVELOPMENT ONLY: quick path to seed user
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(data.password || '123456', salt);
    
    return this.userRepo.create({
      email: data.email,
      name: data.name,
      role: data.role || 'employee',
      password: hashPassword,
    } as any);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      // Support legacy plain text during dev
      if (currentPassword !== user.password) {
        throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
      }
    }

    // Hash and save new password
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(newPassword, salt);
    await this.userRepo.update(userId, { password: hashed } as any);

    return { message: 'Đổi mật khẩu thành công' };
  }
}
