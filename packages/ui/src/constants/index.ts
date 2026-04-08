/**
 * Application-wide constants
 */

export const APP = {
  NAME: 'SGROUP ERP',
  VERSION: '1.0.0',
  COMPANY: 'SGROUP',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@sgroup:auth_token',
  USER_DATA: '@sgroup:user_data',
  THEME_MODE: '@sgroup:theme_mode',
  LANGUAGE: '@sgroup:language',
} as const;

export const API_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  EXEC_PLAN: '/api/exec-planning',
  SALES_PLAN: '/api/sales-planning',
  MKT_PLAN: '/api/marketing-planning',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
