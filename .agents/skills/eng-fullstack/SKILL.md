---
name: Full-Stack Developer
description: End-to-end feature development patterns combining frontend, backend, and database for SGROUP ERP
---

# Full-Stack Developer Skill — SGROUP ERP

## Role Overview
The Full-stack Dev builds features end-to-end across the React Native frontend, NestJS backend, and PostgreSQL database.

## End-to-End Feature Development Flow

### Vertical Slice Pattern
Build one complete feature slice at a time:
```
1. Database   → Prisma schema + migration
2. Backend    → Service + Controller + DTOs
3. Frontend   → Store + Screen + Components
4. Integration → Connect frontend ↔ backend
5. Testing    → Unit + Integration tests
```

### Example: Build "Create Lead" Feature

#### Step 1: Database (Prisma Schema)
```prisma
model Lead {
  id          String     @id @default(uuid())
  name        String
  phone       String
  email       String?
  source      LeadSource
  status      LeadStatus @default(NEW)
  estimatedValue Decimal? @map("estimated_value")
  assignedToId String    @map("assigned_to_id")
  assignedTo   User      @relation(fields: [assignedToId], references: [id])
  notes       String?
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  @@map("leads")
}

enum LeadSource { WEB CALL REFERRAL EVENT SOCIAL_MEDIA }
enum LeadStatus { NEW CONTACTED QUALIFIED PROPOSAL NEGOTIATION WON LOST }
```

#### Step 2: Backend (NestJS)
```typescript
// dto/create-lead.dto.ts
export class CreateLeadDto {
  @IsString() @MinLength(2) name: string;
  @IsString() phone: string;
  @IsEmail() @IsOptional() email?: string;
  @IsEnum(LeadSource) source: LeadSource;
  @IsNumber() @IsOptional() estimatedValue?: number;
  @IsString() @IsOptional() notes?: string;
}

// leads.service.ts
@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: { ...dto, assignedToId: userId },
    });
  }

  async findAll(userId: string, filters?: LeadFilters) {
    return this.prisma.lead.findMany({
      where: { assignedToId: userId, ...filters },
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { name: true } } },
    });
  }
}

// leads.controller.ts
@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query() filters: LeadFilters) {
    return this.leadsService.findAll(user.id, filters);
  }
}
```

#### Step 3: Frontend (React Native)
```typescript
// stores/useLeadStore.ts
interface LeadStore {
  leads: Lead[];
  loading: boolean;
  fetchLeads: () => Promise<void>;
  createLead: (data: CreateLeadInput) => Promise<void>;
}

export const useLeadStore = create<LeadStore>((set) => ({
  leads: [],
  loading: false,
  fetchLeads: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/leads');
      set({ leads: data, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  createLead: async (input) => {
    const { data } = await api.post('/leads', input);
    set((state) => ({ leads: [data, ...state.leads] }));
  },
}));

// screens/CreateLeadScreen.tsx
export const CreateLeadScreen: React.FC = () => {
  const { createLead } = useLeadStore();
  const [form, setForm] = useState<CreateLeadInput>(initialForm);

  const handleSubmit = async () => {
    try {
      await createLead(form);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo lead');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SGInput label="Tên khách hàng" value={form.name} required />
      <SGInput label="Số điện thoại" value={form.phone} keyboardType="phone-pad" />
      <SGSelect label="Nguồn" options={LEAD_SOURCES} value={form.source} />
      <SGButton title="Tạo Lead" onPress={handleSubmit} />
    </ScrollView>
  );
};
```

## Data Flow Architecture
```
[User Action]
     │
     ▼
[React Component] ──dispatch──> [Zustand Store]
                                      │
                                      ▼
                                [Axios API Call]
                                      │
                                      ▼
                          [NestJS Controller] ──validate──> [DTO]
                                      │
                                      ▼
                          [NestJS Service] ──business logic──>
                                      │
                                      ▼
                          [Prisma Client] ──SQL──> [PostgreSQL]
                                      │
                                      ▼
                          [Response] ──JSON──> [Zustand Store]
                                      │
                                      ▼
                          [React re-render] ──UI Update──> [User sees result]
```

## Cross-Cutting Patterns

### API Client Setup
```typescript
// src/shared/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);
```

### Error Handling Pattern
```typescript
// Backend: Consistent error responses
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException
      ? exception.getStatus() : 500;
    
    response.status(status).json({
      error: {
        code: status,
        message: exception instanceof HttpException
          ? exception.message : 'Internal server error',
      },
    });
  }
}

// Frontend: User-friendly error display
const handleApiError = (error: AxiosError) => {
  const message = error.response?.data?.error?.message || 'Đã có lỗi xảy ra';
  Alert.alert('Lỗi', message);
};
```

### Type Sharing Strategy
```
// Shared types between frontend and backend
// Option 1: Duplicate types (simple, current approach)
// Frontend: src/features/sales/types/lead.ts
// Backend:  src/modules/sales/dto/lead.dto.ts

// Option 2: Shared package (future)
// packages/shared-types/lead.ts
// ├── imported by frontend
// └── imported by backend
```

## Checklist for Every Feature
- [ ] Database schema designed with indexes
- [ ] Migration created and tested
- [ ] Backend service with business logic
- [ ] Backend controller with validation (DTOs)
- [ ] Frontend store with API integration
- [ ] Frontend screen with error handling
- [ ] Loading and empty states
- [ ] TypeScript types match between FE/BE
- [ ] Works on both web and mobile
- [ ] ErrorBoundary wraps the feature module
- [ ] API response normalized with `Array.isArray()` guards
- [ ] 401/403 errors handled gracefully

## Error Flow Architecture

```
[User Action]
     │
     ▼
[React Component] ──dispatch──> [Zustand Store]
                                      │
                                      ▼
                                [Axios API Call]
                                      │
                          ┌───────────┼───────────────┐
                          ▼           ▼               ▼
                       [200 OK]   [401 Unauth]   [403 Forbidden]
                          │           │               │
                          ▼           ▼               ▼
                    [Normalize     [Auto logout    [Show "Access
                     response]     via Axios       Denied" UI]
                          │        interceptor]
                          ▼
                    [Array.isArray  
                     guard]         [500 Server]   [Network Error]
                          │              │               │
                          ▼              ▼               ▼
                    [Update Store] [Show error     [Show "Không có
                          │         toast/banner]   kết nối" + retry]
                          ▼
                    [React re-render] ──> [User sees result]
```

### Defensive Frontend Integration Pattern

```typescript
// ✅ ALWAYS normalize API response in store
fetchStaff: async () => {
  set({ loading: true, error: null });
  try {
    const { data: raw } = await api.get('/sales-ops/staff');
    // CRITICAL: Handle both array and { data: array } formats
    const staff = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
    set({ staff, loading: false });
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) return; // Axios interceptor handles logout
    if (status === 403) {
      set({ error: 'Bạn không có quyền truy cập', loading: false });
      return;
    }
    set({ error: error?.message ?? 'Đã có lỗi xảy ra', loading: false });
  }
},
```

## Common Integration Bugs

| Bug | FE or BE? | Root Cause | Fix |
|-----|-----------|-----------|-----|
| `X.map is not a function` | FE | API format changed, no `Array.isArray` | Normalize response |
| 403 on valid user | BE | Role guard too strict | Check `@Roles()` decorator |
| Token expired loop | FE | 401 not clearing token | Add Axios interceptor |
| Data shows for wrong user | BE | Missing `where: { userId }` filter | Add user scope to query |
| Empty page, no error | FE | Error swallowed in catch | Show `SGEmptyState` on error |
| Duplicate entries | BE | No unique constraint | Add `@unique` in Prisma schema |
| Slow page load | BE | N+1 query | Use `include` in Prisma |

## 🚨 MANDATORY ARCHITECTURE RULES
**CRITICAL:** You MUST read and strictly adhere to the `docs/architecture/api-architecture-rules.md` along with the backend and frontend rules when building full-stack features. The API responses, RESTful conventions, DTO formats, and versioning rules are non-negotiable.

