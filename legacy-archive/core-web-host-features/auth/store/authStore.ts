import { create } from 'zustand';
import { AuthUser } from '../types';

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

const AUTH_STORAGE_KEY = 'sgroup_auth';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: (user, token) => {
    set({ user, token, isLoading: false, error: null });
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
      localStorage.setItem('access_token', token);
    } catch { /* quota exceeded — non-critical */ }
  },

  logout: () => {
    set({ user: null, token: null, isLoading: false, error: null });
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('access_token');
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  restore: () => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const { user, token } = JSON.parse(raw);
        if (user && token) set({ user, token });
      }
    } catch {
      // Silently fail — user will need to re-login
    }
  },
}));
