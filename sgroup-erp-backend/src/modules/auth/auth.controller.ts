import {
  Controller,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Đăng nhập — endpoint công khai, không cần JWT
   */
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  /**
   * Tạo user mới — CHỈ DÀNH CHO ADMIN + CHỈ TRONG DEVELOPMENT
   *
   * SECURITY FIX: Đã xóa @Public() — endpoint này yêu cầu JWT + role 'admin'.
   * Bên cạnh đó, AuthService.registerMockDev() cũng throw ForbiddenException
   * nếu NODE_ENV=production, tạo thành double-guard.
   */
  @ApiBearerAuth()
  @Roles('admin')
  @Post('register')
  @ApiOperation({
    summary: '[Dev only] Tạo user mới',
    description: 'Chỉ admin có thể gọi. Chỉ hoạt động trong môi trường development.',
  })
  register(
    @Body()
    body: {
      email: string;
      name: string;
      password: string;
      role?: string;
    },
  ) {
    return this.authService.registerMockDev(body);
  }

  /**
   * Đổi mật khẩu — yêu cầu JWT của chính user đó
   */
  @ApiBearerAuth()
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đổi mật khẩu tài khoản hiện tại' })
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
