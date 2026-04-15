import type { AuthUser, UserRole } from '../auth/types';

export type AppModuleId =
  | 'exec'
  | 'sales'
  | 'mkt'
  | 'agency'
  | 'shomes'
  | 'project'
  | 'hr'
  | 'finance'
  | 'legal'
  | 'admin'
  | 'crm'
  | 'accounting';

export type LegacyModuleId = 'biz';
export type ModuleAccessId = AppModuleId | LegacyModuleId;
export type AppModuleStatus = 'active' | 'planned' | 'scaffold';

export interface AppModuleDefinition {
  id: AppModuleId;
  name: string;
  description: string;
  routeName?: string;
  basePath?: string;
  status: AppModuleStatus;
  requiredRoles?: readonly UserRole[];
  legacyAliases?: readonly LegacyModuleId[];
  legacySources?: readonly string[];
}

export const ACTIVE_APP_MODULE_IDS = ['hr', 'project', 'sales'] as const;
export type ActiveAppModuleId = typeof ACTIVE_APP_MODULE_IDS[number];

export const MODULE_LEGACY_ALIASES: Record<LegacyModuleId, AppModuleId> = {
  biz: 'sales',
};

export const APP_MODULES: readonly AppModuleDefinition[] = [
  {
    id: 'exec',
    name: 'Ban điều hành',
    description: 'KPI chiến lược, báo cáo tổng thể và ra quyết định.',
    status: 'planned',
  },
  {
    id: 'sales',
    name: 'Kinh doanh',
    description: 'CRM, pipeline, khách hàng và giao dịch bán hàng.',
    routeName: 'SalesModule',
    basePath: '/SalesModule',
    status: 'active',
    requiredRoles: ['admin', 'sales_manager', 'sales_director'],
    legacyAliases: ['biz'],
    legacySources: ['legacy-archive/core-web-host-features/sales'],
  },
  {
    id: 'mkt',
    name: 'Marketing',
    description: 'Campaign, lead attribution và ngân sách marketing.',
    status: 'planned',
  },
  {
    id: 'agency',
    name: 'Đại lý',
    description: 'Mạng lưới đối tác, chính sách bán và scorecard đại lý.',
    status: 'planned',
  },
  {
    id: 'shomes',
    name: 'S-Homes',
    description: 'Vận hành bất động sản, ticket và resident service.',
    status: 'planned',
  },
  {
    id: 'project',
    name: 'Dự án',
    description: 'Quản lý dự án BĐS, rổ hàng, pháp lý và báo cáo dự án.',
    routeName: 'ProjectModule',
    basePath: '/ProjectModule',
    status: 'active',
    requiredRoles: ['admin', 'sales_manager', 'sales_director'],
    legacySources: [
      'legacy-archive/core-web-host-features/project',
      'legacy-archive/modules-project-nextjs',
    ],
  },
  {
    id: 'hr',
    name: 'Nhân sự',
    description: 'Nhân sự, chấm công, lương thưởng, tuyển dụng và đào tạo.',
    routeName: 'HRModule',
    basePath: '/HRModule',
    status: 'active',
    requiredRoles: ['admin', 'hr'],
    legacySources: [
      'legacy-archive/core-web-host-features/hr',
      'legacy-archive/modules-hr-nextjs',
    ],
  },
  {
    id: 'finance',
    name: 'Tài chính & Kế toán',
    description: 'Dòng tiền, công nợ, đối soát và budget control.',
    status: 'planned',
  },
  {
    id: 'legal',
    name: 'Pháp lý & Hồ sơ',
    description: 'Quản trị hợp đồng, compliance và hồ sơ dự án.',
    status: 'planned',
  },
  {
    id: 'admin',
    name: 'Quản trị hệ thống',
    description: 'Tổ chức, phân quyền và vận hành hệ thống.',
    status: 'planned',
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Scaffold backend CRM, chưa sẵn sàng để public lên shell.',
    status: 'scaffold',
  },
  {
    id: 'accounting',
    name: 'Kế toán',
    description: 'Scaffold module accounting, đang chờ domain implementation.',
    status: 'scaffold',
  },
] as const;

const KNOWN_MODULE_IDS = new Set<AppModuleId>(APP_MODULES.map((module) => module.id));

export const ACTIVE_APP_MODULES = APP_MODULES.filter(
  (module): module is AppModuleDefinition & { id: ActiveAppModuleId } =>
    module.status === 'active',
);

export const APP_MODULE_NAME_MAP: Record<AppModuleId, string> = APP_MODULES.reduce(
  (acc, module) => {
    acc[module.id] = module.name;
    return acc;
  },
  {} as Record<AppModuleId, string>,
);

export function getAppModuleById(id: string): AppModuleDefinition | undefined {
  const normalizedId = MODULE_LEGACY_ALIASES[id as LegacyModuleId] ?? id;
  return APP_MODULES.find((module) => module.id === normalizedId);
}

export function normalizeModuleAccess(modules?: readonly string[] | null): AppModuleId[] {
  if (!modules?.length) return [];

  const normalized = new Set<AppModuleId>();

  for (const rawId of modules) {
    const canonicalId = MODULE_LEGACY_ALIASES[rawId as LegacyModuleId] ?? rawId;
    if (KNOWN_MODULE_IDS.has(canonicalId as AppModuleId)) {
      normalized.add(canonicalId as AppModuleId);
    }
  }

  return APP_MODULES
    .map((module) => module.id)
    .filter((moduleId) => normalized.has(moduleId));
}

export function normalizeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    modules: normalizeModuleAccess(user.modules),
  };
}

export function canAccessModule(
  user: Pick<AuthUser, 'role' | 'modules'> | null | undefined,
  module: Pick<AppModuleDefinition, 'id' | 'requiredRoles'>,
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const allowedModules = normalizeModuleAccess(user.modules);
  const roleAllowed =
    !module.requiredRoles?.length || module.requiredRoles.includes(user.role);

  return roleAllowed && allowedModules.includes(module.id);
}
