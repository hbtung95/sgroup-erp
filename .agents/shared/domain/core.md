---
name: Core System (Auth, Users, Organization)
description: Core entities — Authentication, User management, Branch/Team structure, Permissions
---

# Core System — SGROUP ERP

## Role Overview
Nền tảng chung cho toàn bộ ERP: quản lý user, tổ chức (branch/team), xác thực, phân quyền. Tất cả modules khác đều depend vào Core.

## Domain Entities

### User (Tài khoản đăng nhập)
```prisma
model User {
  id            String    @id @default(uuid(7))
  email         String    @unique
  phone         String    @unique
  passwordHash  String    @map("password_hash")
  staffId       String?   @unique @map("staff_id") // Link to HR Staff
  role          Role
  status        UserStatus // ACTIVE, LOCKED, DEACTIVATED
  lastLoginAt   DateTime? @map("last_login_at")
  failedAttempts Int      @default(0) @map("failed_attempts")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  @@map("users")
}

enum Role {
  SUPER_ADMIN
  CEO
  DIRECTOR
  BRANCH_MANAGER
  TEAM_LEAD
  SALES
  ACCOUNTANT
  HR_MANAGER
  VIEWER
}

enum UserStatus { ACTIVE LOCKED DEACTIVATED }
```

### Branch (Chi nhánh)
```prisma
model Branch {
  id          String    @id @default(uuid(7))
  code        String    @unique // "CN-HCM", "CN-HN", "CN-DN"
  name        String
  address     String?
  phone       String?
  managerId   String?   @map("manager_id") // BRANCH_MANAGER user
  status      String    // ACTIVE, INACTIVE
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  @@map("branches")
}
```

### Team (Nhóm kinh doanh)
```prisma
model Team {
  id          String    @id @default(uuid(7))
  code        String    @unique // "TEAM-HCM-A"
  name        String
  branchId    String    @map("branch_id")
  leaderId    String?   @map("leader_id") // TEAM_LEAD user
  status      String    // ACTIVE, INACTIVE
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")
  @@map("teams")
}
```

### Permission (Quyền chi tiết)
```prisma
model Permission {
  id          String   @id @default(uuid(7))
  role        Role
  module      String   // "crm", "hr", "commission", "accounting"
  action      String   // "read", "create", "update", "delete", "approve", "export"
  scope       String   // "own", "team", "branch", "all"
  @@unique([role, module, action])
  @@map("permissions")
}
```

## Auth Flow
```
Login (email+password)
  → Verify bcrypt hash
  → Check user status (ACTIVE only)
  → Check failed attempts (<5, else LOCK)
  → Generate JWT { userId, role, branchId, teamId }
  → Return access_token (15min) + refresh_token (7 days)

Refresh Token
  → Verify refresh_token + rotate (one-time use)
  → Return new access_token + new refresh_token

Logout
  → Blacklist refresh_token in Redis (TTL = remaining expiry)
```

## Organization Hierarchy
```
SGROUP (Company)
├── CN-HCM (Branch: Chi nhánh HCM)
│   ├── TEAM-HCM-A (Team Lead + 5 Sales)
│   └── TEAM-HCM-B (Team Lead + 4 Sales)
├── CN-HN (Branch: Chi nhánh Hà Nội)
│   └── TEAM-HN-A
├── CN-DN (Branch: Chi nhánh Đà Nẵng)
│   └── TEAM-DN-A
└── HQ (Headquarters: CEO, Directors, Accountant, HR)
```

## API Endpoints
```
POST   /api/auth/login              # Login
POST   /api/auth/refresh            # Refresh token
POST   /api/auth/logout             # Logout
GET    /api/auth/me                 # Current user profile

GET    /api/users                    # DS users (admin only)
POST   /api/users                    # Tạo user
PATCH  /api/users/:id               # Cập nhật (role, status)
POST   /api/users/:id/lock          # Lock user
POST   /api/users/:id/reset-password # Reset password

GET    /api/branches                 # DS chi nhánh
POST   /api/branches                # Tạo chi nhánh
GET    /api/teams                    # DS nhóm
POST   /api/teams                   # Tạo nhóm

GET    /api/permissions              # DS quyền theo role
```

## 🚨 MANDATORY RULES
- Password bcrypt 12 rounds minimum
- JWT access token 15 min TTL — NEVER longer
- Refresh token one-time use — rotate on every refresh
- Lock after 5 failed login attempts
- User CANNOT change own role
- SUPER_ADMIN can only be set via direct DB (not API)
- All `branch_id` and `team_id` flow from JWT claims into RLS context