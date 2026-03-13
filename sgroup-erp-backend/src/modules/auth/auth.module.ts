import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        // SECURITY: Bắt buộc có JWT_SECRET — không fallback về hardcoded value
        if (!secret) {
          throw new Error(
            '[AuthModule] JWT_SECRET chưa được cấu hình trong .env!\n' +
            'Vui lòng set JWT_SECRET với giá trị ngẫu nhiên >= 32 ký tự.\n' +
            'Gợi ý tạo: openssl rand -base64 48',
          );
        }

        if (secret.length < 32) {
          throw new Error(
            '[AuthModule] JWT_SECRET quá ngắn! Cần >= 32 ký tự để đảm bảo bảo mật.',
          );
        }

        return {
          secret,
          signOptions: {
            // Giảm từ 7d → 1d để giảm cửa sổ tấn công nếu token bị lộ
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
