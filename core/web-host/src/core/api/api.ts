const DEV_API_URL = '/api'; // Proxied by Vite dev server
const PROD_API_URL = 'https://sgroup-erp.onrender.com/api';

const isDev = typeof window !== 'undefined'
  && (window.location?.hostname === 'localhost' || window.location?.hostname === '127.0.0.1');

export const API_BASE_URL = isDev ? DEV_API_URL : PROD_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Attach token if available
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

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
    
    // Auto-logout on 401
    if (res.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('sgroup_auth');
    }
    
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
