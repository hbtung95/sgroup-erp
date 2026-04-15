import {
  APP_MODULES,
  APP_MODULE_NAME_MAP,
} from '@sgroup/platform';

export {
  APP_MODULES as ERP_MODULES,
  ACTIVE_APP_MODULES,
  getAppModuleById,
  normalizeModuleAccess,
} from '@sgroup/platform';
export type {
  AppModuleDefinition as ErpModuleDefinition,
  AppModuleId as ErpModuleId,
  UserRole,
} from '@sgroup/platform';

export const ALL_MODULE_IDS = APP_MODULES.map((moduleItem) => moduleItem.id);
export const ERP_MODULE_NAME_MAP = APP_MODULE_NAME_MAP;

export const ROLE_LABELS = {
  admin: 'Quản trị viên',
  hr: 'Quản lý nhân sự',
  employee: 'Nhân viên',
  sales_manager: 'Trưởng phòng KD',
  sales_director: 'Giám đốc KD',
};
