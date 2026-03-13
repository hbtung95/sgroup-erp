import { Platform } from 'react-native';

const DEV_API_URL_WEB = 'http://localhost:3000/api';
const DEV_API_URL_NATIVE = 'http://10.0.2.2:3000/api';
const PROD_API_URL = 'https://sgroup-erp.onrender.com/api';

// Detect dev/prod reliably: on web check hostname, on native check NODE_ENV
const isDevWeb = Platform.OS === 'web' && typeof window !== 'undefined'
  && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1');
const isDevNative = Platform.OS !== 'web' && process.env.NODE_ENV !== 'production';

export const API_BASE_URL = isDevWeb
  ? DEV_API_URL_WEB
  : isDevNative
    ? DEV_API_URL_NATIVE
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
    let message = `Lỗi ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.message) {
        message = typeof parsed.message === 'string' ? parsed.message : JSON.stringify(parsed.message);
      }
    } catch {
      if (errorBody) message = errorBody;
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
