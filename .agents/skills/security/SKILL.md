---
name: Security
description: Authentication, authorization, input validation, and security best practices for SGROUP ERP
---

# Security Skill — SGROUP ERP

## Authentication Architecture

### JWT-Based Auth Flow
```
Client                    Backend                      Database
  │                         │                             │
  │── POST /auth/login ────>│                             │
  │   (email, password)     │── Validate credentials ───>│
  │                         │<── User record ────────────│
  │                         │── Generate JWT             │
  │<── { access_token } ───│                             │
  │                         │                             │
  │── GET /api/* ──────────>│                             │
  │   Authorization: Bearer │── Verify JWT               │
  │                         │── Extract user from token   │
  │<── Response ───────────│                             │
```

### Password Hashing
```typescript
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// Hash password
const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

// Verify password
const isMatch = await bcrypt.compare(plainPassword, storedHash);
```

### JWT Configuration
```typescript
// auth.module.ts
JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get('JWT_SECRET'),
    signOptions: {
      expiresIn: config.get('JWT_EXPIRES_IN', '7d'),
      issuer: 'sgroup-erp',
    },
  }),
});
```

### Auth Guard
```typescript
// guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

### Role-Based Access Control (RBAC)
```typescript
// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Usage in controller
@Get('admin/dashboard')
@Roles('ADMIN', 'MANAGER')
getAdminDashboard() { ... }
```

## Input Validation

### DTO Validation Rules
```typescript
import {
  IsString, IsEmail, IsNumber, IsOptional,
  MinLength, MaxLength, Min, Max,
  IsEnum, IsUUID, IsDate, Matches,
  ValidateNested, IsArray
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value.trim()) // Sanitize
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
```

### Global Validation Pipe
```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  forbidNonWhitelisted: true, // Throw on unknown properties
  transform: true,           // Auto-transform types
  transformOptions: {
    enableImplicitConversion: true,
  },
}));
```

## Security Headers (Helmet)
```typescript
// main.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

## CORS Configuration
```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:8081',      // Dev frontend
    'https://erp.sgroup.vn',     // Production
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  maxAge: 3600,
});
```

## Rate Limiting
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// In app.module.ts
ThrottlerModule.forRoot([{
  ttl: 60000,    // 1 minute window
  limit: 100,    // 100 requests per window
}]);

// Auth endpoints - stricter
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
login() { ... }
```

## Security Checklist
- [ ] JWT secret is ≥256 bits and stored in env vars
- [ ] Passwords hashed with bcrypt (≥12 rounds)
- [ ] All inputs validated with class-validator DTOs
- [ ] Helmet middleware enabled
- [ ] CORS restricted to known origins
- [ ] Rate limiting on auth endpoints
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] No sensitive data in logs or error responses
- [ ] HTTPS enforced in production
- [ ] Secrets never committed to git (.env in .gitignore)
- [ ] Dependencies regularly audited (`npm audit`)


## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/security-architecture-rules.md`. RBAC/ABAC, Encryption (AES-256), Audit Trails, and PDPA masking are absolutely non-negotiable.