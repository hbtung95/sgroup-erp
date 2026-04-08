import { Platform } from 'react-native';

export const ENV = {
  IS_WEB: Platform.OS === 'web',
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
  IS_DEV: process.env.NODE_ENV !== 'production',
  APP_NAME: 'SGROUP ERP',
  APP_VERSION: '1.0.0',
};

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export function isWeb(): boolean {
  return Platform.OS === 'web';
}

export function isNative(): boolean {
  return Platform.OS !== 'web';
}
