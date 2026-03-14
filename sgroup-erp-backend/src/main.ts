import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor, TransformInterceptor } from './common/interceptors';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

const logger = new Logger('Bootstrap');

/**
 * Kiểm tra tất cả biến môi trường bắt buộc trước khi khởi động.
 * Fail fast — tránh để app chạy với cấu hình không an toàn.
 */
function validateEnvironment(): void {
  const required: Record<string, { minLength?: number; description: string }> = {
    DATABASE_URL: { description: 'PostgreSQL connection string' },
    JWT_SECRET: {
      minLength: 32,
      description: 'JWT signing secret (>= 32 chars). Generate: openssl rand -base64 48',
    },
  };

  const errors: string[] = [];

  for (const [key, config] of Object.entries(required)) {
    const value = process.env[key];
    if (!value) {
      errors.push(`  ❌ ${key} — chưa được set (${config.description})`);
      continue;
    }
    if (config.minLength && value.length < config.minLength) {
      errors.push(
        `  ❌ ${key} — quá ngắn (${value.length} ký tự, cần >= ${config.minLength})`,
      );
    }
  }

  if (errors.length > 0) {
    console.error('\n🚨 STARTUP VALIDATION FAILED — Các biến môi trường bắt buộc chưa đủ:\n');
    errors.forEach((e) => console.error(e));
    console.error('\nVui lòng copy .env.example → .env và điền đầy đủ giá trị.\n');
    process.exit(1);
  }

  // Cảnh báo nếu dùng default secret trông như dev value
  const jwtSecret = process.env.JWT_SECRET ?? '';
  if (jwtSecret.includes('sgroup') || jwtSecret.includes('dev') || jwtSecret.includes('secret')) {
    logger.warn(
      '⚠️  JWT_SECRET có vẻ là giá trị dev/test. Hãy thay bằng secret ngẫu nhiên trên production!',
    );
  }
}

async function bootstrap() {
  // Validate trước khi tạo app — fail nhanh nếu config thiếu
  validateEnvironment();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS: Whitelist chính xác — không dùng wildcard trên production
  const allowedOrigins: string[] = [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:19006',
  ];

  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
    logger.log(`CORS: Thêm FRONTEND_URL → ${process.env.FRONTEND_URL}`);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Mobile apps và Postman không gửi Origin header
      if (!origin) return callback(null, true);

      // Kiểm tra danh sách whitelist
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Dev only: cho phép *.vercel.app
      if (!isProduction && /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      // Production: chỉ cho phép FRONTEND_URL đã cấu hình
      if (isProduction && process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }

      logger.warn(`CORS blocked: ${origin}`);
      callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true, // Reject unknown properties thay vì chỉ strip
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.setGlobalPrefix('api');

  // Health check endpoint — không cần auth, cho load balancer / monitoring
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req, res) => {
    (res as any).status(200).json({
      status: 'ok',
      env: process.env.NODE_ENV || 'development',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // Swagger — chỉ expose trên non-production
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SGROUP ERP API')
      .setDescription('SGROUP ERP — API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger docs: http://localhost:3000/api/docs');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 SGROUP ERP Backend running on port ${port} (${process.env.NODE_ENV || 'development'})`);
  logger.log(`Health check: http://localhost:${port}/health`);
}

bootstrap();

