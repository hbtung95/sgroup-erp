/**
 * Admin Module — Type Definitions
 * Centralized types for all admin screens
 */

/** User entity from API */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  salesRole?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  loginCount?: number;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
  passwordChangedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

/** Audit log entry from API */
export interface AuditLog {
  id: string;
  action: string;
  resource?: string;
  method?: string;
  userName?: string;
  requestBody?: string;
  responseStatus?: string;
  duration?: number;
  ip?: string;
  userAgent?: string;
  errorMessage?: string;
  createdAt: string;
}

/** System setting from API */
export interface SystemSetting {
  key: string;
  label: string;
  value: string;
  valueType: 'string' | 'number' | 'boolean';
  description: string;
  group: string;
}

/** Health check item from API */
export interface HealthCheck {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  latency: number;
}

/** Health response from API */
export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  checks: HealthCheck[];
}

/** Activity trend data point */
export interface ActivityTrendItem {
  date: string;
  count: number;
}

/** Admin stats from API */
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  lockedUsers: number;
  totalDepartments: number;
  totalTeams: number;
  totalPositions: number;
  totalEmployees: number;
  recentAuditCount: number;
  recentUsers: AdminUser[];
  roleDistribution: Array<{ role: string; count: number }>;
  deptDistribution: Array<{
    id: string;
    name: string;
    code: string;
    _count?: { employees?: number; teams?: number };
  }>;
  activityTrend: ActivityTrendItem[];
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}

/** Web-only Pressable state (RN doesn't type 'hovered' officially) */
export interface PressableStateWeb {
  pressed: boolean;
  hovered?: boolean;
}
