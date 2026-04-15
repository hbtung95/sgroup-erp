// ═══════════════════════════════════════════════════════════
// @sgroup/api-client — Unified HTTP Client
// Centralized fetch wrapper with auth, error handling,
// and request/response interceptors.
// ═══════════════════════════════════════════════════════════

import type { ApiErrorResponse } from '@sgroup/types';

const AUTH_TOKEN_KEY = 'access_token';

/** Options for creating an API client instance */
export interface ApiClientOptions {
  /** Base URL for API requests (e.g. 'http://localhost:8082/api/v1') */
  readonly baseUrl: string;
  /** Optional custom function to retrieve auth token */
  readonly getToken?: () => string | null;
}

/**
 * Creates a typed, authenticated API client bound to a specific base URL.
 *
 * Usage:
 * ```ts
 * const api = createApiClient({ baseUrl: '/api/v1' });
 * const projects = await api.get<ApiResponse<Project[]>>('/projects');
 * ```
 */
export function createApiClient(options: ApiClientOptions) {
  const { baseUrl } = options;

  const getToken =
    options.getToken ?? (() => {
      try { return localStorage.getItem(AUTH_TOKEN_KEY); }
      catch { return null; }
    });

  function buildHeaders(custom?: HeadersInit): Record<string, string> {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(custom as Record<string, string> ?? {}),
    };
  }

  async function request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const url = `${baseUrl}${path}`;

    const response = await fetch(url, {
      ...init,
      headers: buildHeaders(init?.headers),
    });

    if (!response.ok) {
      const body: ApiErrorResponse | null = await response.json().catch(() => null);
      const message = body?.error?.message ?? `API Error ${response.status}`;
      throw new Error(message);
    }

    // 204 No Content
    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
  }

  return {
    /** Raw request — full control over method, body, headers */
    request,

    /** GET shorthand */
    get: <T>(path: string) => request<T>(path),

    /** POST shorthand */
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: 'POST',
        body: body != null ? JSON.stringify(body) : undefined,
      }),

    /** PUT shorthand */
    put: <T>(path: string, body?: unknown) =>
      request<T>(path, {
        method: 'PUT',
        body: body != null ? JSON.stringify(body) : undefined,
      }),

    /** DELETE shorthand */
    del: <T>(path: string) =>
      request<T>(path, { method: 'DELETE' }),
  };
}

/** Pre-configured client type for convenience */
export type ApiClient = ReturnType<typeof createApiClient>;
