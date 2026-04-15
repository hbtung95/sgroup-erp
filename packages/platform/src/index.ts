export { useAuthStore } from './auth/store';
export {
  AUTH_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
} from './auth/storage';
export type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  UserRole,
} from './auth/types';
export {
  APP_MODULES,
  ACTIVE_APP_MODULE_IDS,
  ACTIVE_APP_MODULES,
  APP_MODULE_NAME_MAP,
  canAccessModule,
  getAppModuleById,
  normalizeAuthUser,
  normalizeModuleAccess,
} from './modules/catalog';
export type {
  ActiveAppModuleId,
  AppModuleDefinition,
  AppModuleId,
  AppModuleStatus,
  ModuleAccessId,
} from './modules/catalog';
export {
  createModuleApiClient,
  getModuleApiBaseUrl,
  MODULE_API_BASE_URLS,
} from './http/moduleApi';
export type { ModuleApiId } from './http/moduleApi';

// ── Cross-Module Event Bus ──
export {
  eventBus,
  createEvent,
} from './events/event-bus';
export type { DomainEvent } from './events/event-bus';
