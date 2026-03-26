---
name: Testing
description: Testing skill for React Native frontend and NestJS backend in SGROUP ERP
---

# Testing Skill — SGROUP ERP

## Overview
Comprehensive testing strategies for both the React Native frontend and NestJS backend.

## Frontend Testing (React Native / Expo)

### Setup
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

### Component Testing Pattern
```tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeTruthy();
  });

  it('calls onPress when button is pressed', () => {
    const onPress = jest.fn();
    render(<MyComponent title="Test" onPress={onPress} />);
    fireEvent.press(screen.getByTestId('action-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Testing Pattern
```tsx
import { renderHook, act } from '@testing-library/react-native';
import { useSalesStore } from '../useSalesStore';

describe('useSalesStore', () => {
  beforeEach(() => {
    useSalesStore.setState({ items: [] }); // Reset store
  });

  it('adds item correctly', () => {
    const { result } = renderHook(() => useSalesStore());
    act(() => {
      result.current.addItem({ id: '1', name: 'Test' });
    });
    expect(result.current.items).toHaveLength(1);
  });
});
```

### Zustand Store Testing
```tsx
import { useSalesStore } from '../useSalesStore';

// Direct store testing (without hooks)
describe('SalesStore', () => {
  beforeEach(() => {
    useSalesStore.setState({ items: [], loading: false });
  });

  it('should add and remove items', () => {
    const { addItem, removeItem } = useSalesStore.getState();
    addItem({ id: '1', name: 'Item 1' });
    expect(useSalesStore.getState().items).toHaveLength(1);
    
    removeItem('1');
    expect(useSalesStore.getState().items).toHaveLength(0);
  });
});
```

## Backend Testing (NestJS)

### Unit Test Pattern
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SalesService', () => {
  let service: SalesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: PrismaService,
          useValue: {
            sale: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return all sales', async () => {
    const mockSales = [{ id: '1', amount: 100 }];
    (prisma.sale.findMany as jest.Mock).mockResolvedValue(mockSales);
    
    const result = await service.findAll();
    expect(result).toEqual(mockSales);
  });

  it('should throw NotFoundException for non-existent sale', async () => {
    (prisma.sale.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(service.findOne('invalid-id')).rejects.toThrow();
  });
});
```

### E2E Test Pattern
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Sales (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    authToken = loginResponse.body.access_token;
  });

  it('/sales (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Test Commands

```bash
# Frontend
cd SGROUP-ERP-UNIVERSAL
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report

# Backend
cd sgroup-erp-backend
npm test                    # Unit tests
npm run test:watch          # Watch mode
npm run test:cov            # Coverage
npm run test:e2e            # E2E tests
```

## Coverage Targets
| Area | Target |
|---|---|
| Services / Business Logic | ≥ 80% |
| Controllers / Routes | ≥ 70% |
| UI Components | ≥ 60% |
| Utility Functions | ≥ 90% |

## Testing Best Practices
1. **Arrange-Act-Assert** — Structure every test clearly
2. **One assertion per test** — Keep tests focused
3. **Descriptive names** — `it('should return empty array when no sales exist')`
4. **Mock external deps** — Don't hit real databases or APIs
5. **Test behavior, not implementation** — Focus on inputs/outputs
6. **Reset state** — Use `beforeEach` to reset stores and mocks


## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/test-architecture-rules.md`. Follow the Testing Pyramid, Testcontainers DB isolation, and coverage targets. No flaky test bypassing.