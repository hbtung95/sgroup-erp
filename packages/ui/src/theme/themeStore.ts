import { create } from 'zustand';
import { Platform } from 'react-native';

interface ThemeState {
  isDark: boolean;
  themeMode: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  setDark: (val: boolean) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}

// Simple web-only persist helpers
function loadThemePreference(): boolean {
  if (Platform.OS === 'web') {
    try {
      const stored = localStorage.getItem('sg-theme-dark');
      if (stored !== null) return stored === 'true';
    } catch {}
  }
  return true; // Default dark
}

function saveThemePreference(isDark: boolean) {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem('sg-theme-dark', String(isDark));
    } catch {}
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: loadThemePreference(),
  themeMode: 'dark',
  toggleTheme: () =>
    set((s) => {
      const next = !s.isDark;
      const themeName = next ? 'tahoe-dark' : 'tahoe-light';
      saveThemePreference(next);
      
      // Sync with HTML class for Tahoe UI compatibility
      if (Platform.OS === 'web') {
        const root = document.documentElement;
        root.classList.remove('sg-theme-dark', 'sg-theme-light');
        root.classList.add(next ? 'sg-theme-dark' : 'sg-theme-light');
        root.setAttribute('data-theme', next ? 'dark' : 'light');
        (window as any).SG_UI_CONFIG = { ...(window as any).SG_UI_CONFIG, theme: themeName };
        window.dispatchEvent(new Event('themechange'));
      }
      
      return { isDark: next, themeMode: next ? 'dark' : 'light' };
    }),
  setDark: (val: boolean) => {
    const themeName = val ? 'tahoe-dark' : 'tahoe-light';
    saveThemePreference(val);

    if (Platform.OS === 'web') {
      const root = document.documentElement;
      root.classList.remove('sg-theme-dark', 'sg-theme-light');
      root.classList.add(val ? 'sg-theme-dark' : 'sg-theme-light');
      (window as any).SG_UI_CONFIG = { ...(window as any).SG_UI_CONFIG, theme: themeName };
    }

    set({ isDark: val, themeMode: val ? 'dark' : 'light' });
  },
  setThemeMode: (mode: 'light' | 'dark' | 'system' | 'tahoe-light' | 'tahoe-dark') => {
    let resolvedIsDark = true;
    let resolvedMode: 'light' | 'dark' | 'system' = 'dark';

    if (mode === 'system') {
      const prefersDark =
        Platform.OS === 'web' &&
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      resolvedIsDark = prefersDark ?? true;
      resolvedMode = 'system';
    } else {
      resolvedIsDark = mode === 'dark' || mode === 'tahoe-dark';
      resolvedMode = resolvedIsDark ? 'dark' : 'light';
    }

    saveThemePreference(resolvedIsDark);
    
    if (Platform.OS === 'web') {
      const root = document.documentElement;
      root.classList.remove('sg-theme-dark', 'sg-theme-light');
      root.classList.add(resolvedIsDark ? 'sg-theme-dark' : 'sg-theme-light');
      (window as any).SG_UI_CONFIG = { ...(window as any).SG_UI_CONFIG, theme: resolvedIsDark ? 'tahoe-dark' : 'tahoe-light' };
    }

    set({ themeMode: resolvedMode, isDark: resolvedIsDark });
  },
}));
