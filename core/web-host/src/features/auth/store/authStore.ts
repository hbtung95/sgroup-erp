import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  restore: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'sgroup_auth';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  login: (user, token) => {
    set({ user, token, isLoading: false, error: null });
    // Persist to AsyncStorage for page reload survival
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token })).catch(() => {});
    AsyncStorage.setItem('access_token', token).catch(() => {});
  },
  logout: () => {
    set({ user: null, token: null, isLoading: false, error: null });
    AsyncStorage.removeItem(AUTH_STORAGE_KEY).catch(() => {});
    AsyncStorage.removeItem('access_token').catch(() => {});
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  restore: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const { user, token } = JSON.parse(raw);
        if (user && token) {
          set({ user, token });
        }
      }
    } catch {
      // Silently fail — user will need to re-login
    }
  },
}));
