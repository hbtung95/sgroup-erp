import { createApiClient } from '@sgroup/api-client';

export type ModuleApiId = 'hr' | 'project' | 'sales' | 'crm' | 'accounting';

export const MODULE_API_BASE_URLS: Record<ModuleApiId, string> = {
  hr: '/api/hr/v1',
  project: '/api/project/v1',
  sales: '/api/sales/v1',
  crm: '/api/crm/v1',
  accounting: '/api/accounting/v1',
};

export function getModuleApiBaseUrl(moduleId: ModuleApiId): string {
  return MODULE_API_BASE_URLS[moduleId];
}

export function createModuleApiClient(moduleId: ModuleApiId) {
  return createApiClient({
    baseUrl: getModuleApiBaseUrl(moduleId),
  });
}
