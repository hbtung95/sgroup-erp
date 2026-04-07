---
name: Backend Development (NestJS / Prisma)
description: Skill for developing NestJS backend with Prisma ORM in the SGROUP ERP project
---

# Backend Development Skill — SGROUP ERP

## Tech Stack
- **Framework**: NestJS v11
- **ORM**: Prisma v6 with PostgreSQL
- **Authentication**: Passport.js + JWT
- **Validation**: class-validator + class-transformer
- **Security**: Helmet, bcrypt
- **Testing**: Jest + Supertest
- **Language**: TypeScript 5.7+

## Project Structure

```
src/
├── app.module.ts         # Root module
├── main.ts               # Bootstrap with global middleware
├── common/               # Shared utilities, guards, decorators
│   ├── guards/           # Auth guards (JwtAuthGuard, RolesGuard)
│   ├── decorators/       # Custom decorators (@CurrentUser, @Roles, @Public)
│   ├── filters/          # Exception filters (AllExceptionsFilter)
│   ├── interceptors/     # Response interceptors
│   └── pipes/            # Validation pipes
├── modules/              # Feature modules
│   ├── auth/             # Authentication (JWT login, register)
│   ├── ...               # Other modules
│   └── project/          # Example Clean Architecture module
│       ├── domain/       # Core Business Rules (Entities, Repository Interfaces)
│       ├── application/  # Use Cases, Application Services
│       ├── infrastructure/# Prisma Repositories, Third-party integrations
│       └── presentation/ # Controllers, DTOs
└── prisma/               # Prisma service and module

## Core Architecture Principle: Clean Architecture & Dependency Rule
1. **Dependency Inward:** Source code dependencies strictly point inward to the Domain layer. `Domain` -> `Application` <- `Infrastructure` & `Presentation`.
2. **Framework Independence:** Core business logic (Domain/Application) MUST NOT depend on NestJS or Prisma.
3. **Repository Pattern:** Services call DB through an Abstract Repository Interface defined in the Domain layer, implemented in Infrastructure.
```

## API Response Convention

### Standard Response Format
```typescript
// ✅ Consistent response format
// Paginated list
{
  "data": [...],
  "meta": { "total": 100, "page": 1, "pageSize": 20 }
}

// Single item
{
  "data": { ... }
}

// Error
{
  "error": {
    "code": 403,
    "message": "Access denied"
  }
}

// ⚠️ IMPORTANT: Some endpoints still return raw arrays.
// Frontend MUST handle BOTH formats:
// - Array directly: [item1, item2]
// - Wrapped: { data: [item1, item2] }
```

## Adapter / Repository Pattern (Multi-Datasource)

For modules that need to support both Google Sheets and PostgreSQL:

```typescript
// Abstract repository interface
export interface IStaffRepository {
  findAll(): Promise<Staff[]>;
  findById(id: string): Promise<Staff | null>;
  create(data: CreateStaffDto): Promise<Staff>;
  update(id: string, data: UpdateStaffDto): Promise<Staff>;
}

// Prisma adapter
@Injectable()
export class PrismaStaffRepository implements IStaffRepository {
  constructor(private prisma: PrismaService) {}
  async findAll() { return this.prisma.staff.findMany(); }
  // ...
}

// Google Sheets adapter
@Injectable()
export class SheetsStaffRepository implements IStaffRepository {
  constructor(private sheets: GoogleSheetsService) {}
  async findAll() { return this.sheets.getRange('Staff!A:Z'); }
  // ...
}

// Service uses abstraction
@Injectable()
export class StaffService {
  constructor(@Inject('STAFF_REPO') private repo: IStaffRepository) {}
  async findAll() { return this.repo.findAll(); }
}
```

## Module Pattern

### Module Definition
```typescript
import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
```

### Controller Pattern
```typescript
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll() {
    return this.salesService.findAll();
  }

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}
```

### Service Pattern
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.sale.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id } });
    if (!sale) throw new NotFoundException(`Sale ${id} not found`);
    return sale;
  }

  async create(dto: CreateSaleDto) {
    return this.prisma.sale.create({ data: dto });
  }
}
```

### DTO Validation
```typescript
import { IsString, IsNumber, IsOptional, IsEmail, Min } from 'class-validator';

export class CreateSaleDto {
  @IsString()
  customerId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
```

## Database (Prisma)

### Migration Commands
```bash
# Create migration
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

### Schema Conventions
- Use UUID v7 for primary keys: `id String @id @default(uuid())`
- Always include `createdAt` and `updatedAt` timestamps
- Use `@map` for snake_case database columns
- Use `@@map` for snake_case table names

## Error Handling
```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

// Use built-in exceptions
throw new NotFoundException('Resource not found');
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Not authorized');
throw new ForbiddenException('Access denied');
```

## Environment Variables
- Store in `.env` file (never commit)
- Access via `@nestjs/config` ConfigService
- Required vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`

## Don'ts
- ❌ Don't use raw SQL — always use Prisma client
- ❌ Don't skip validation — always use DTOs with class-validator
- ❌ Don't expose internal errors — use proper exception filters
- ❌ Don't hardcode secrets — use environment variables
- ❌ Don't skip authentication — use guards on all protected endpoints


## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/backend-architecture-rules.md`, `docs/architecture/api-architecture-rules.md`, and ADR-002 Database Standards. Any violation of the 6 Red Flags (e.g. `$transaction`, Prisma N+1, `UUIDv7`, `class-validator`) is forbidden.