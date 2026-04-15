import { create } from 'zustand';
import { AUTH_STORAGE_KEY, ACCESS_TOKEN_STORAGE_KEY } from './storage';
import type { AuthUser } from './types';
import { normalizeAuthUser } from '../modules/catalog';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  restore: () => void;
}

type StoredAuthState = {
  user: AuthUser;
  token: string;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: (user, token) => {
    const normalizedUser = normalizeAuthUser(user);
    set({ user: normalizedUser, token, isLoading: false, error: null });

    try {
      const payload: StoredAuthState = { user: normalizedUser, token };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    } catch {
      // Quota exceeded is non-fatal for the current session.
    }
  },

  logout: () => {
    set({ user: null, token: null, isLoading: false, error: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  restore: () => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<StoredAuthState>;
      if (!parsed.user || !parsed.token) return;

      set({
        user: normalizeAuthUser(parsed.user),
        token: parsed.token,
      });
    } catch {
      // Corrupt auth cache should not break the app shell.
    }
  },
}));
