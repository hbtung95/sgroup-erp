import { Platform } from 'react-native';

const DEV_API_URL_WEB = 'http://localhost:3000/api';
const DEV_API_URL_NATIVE = 'http://10.0.2.2:3000/api';
const PROD_API_URL = 'https://sgroup-erp.onrender.com/api';

const __DEV__ = process.env.NODE_ENV !== 'production';

export const API_BASE_URL = __DEV__
  ? Platform.OS === 'web'
    ? DEV_API_URL_WEB
    : DEV_API_URL_NATIVE
  : PROD_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }
  return res.json() as Promise<T>;
}
