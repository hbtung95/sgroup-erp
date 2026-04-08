export const ENV = {
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  APP_NAME: 'SGROUP ERP',
  APP_VERSION: '1.0.0',
} as const;

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;
