import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters';
import { LoggingInterceptor, TransformInterceptor } from './common/interceptors';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // CORS: Allow localhost (dev) + Vercel/Custom domains (production)
  const allowedOrigins = [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:19006',
  ];
  // Add production frontend URL from env if set
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);
      // Allow listed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any *.vercel.app subdomain
      if (/\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(null, false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());
  app.setGlobalPrefix('api');

  // Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SGROUP ERP API')
    .setDescription('Sales Module API — Customers, Deals, Teams, Reports')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 SGROUP ERP Backend running on port ${port} (${process.env.NODE_ENV || 'development'})`);
}
bootstrap();

