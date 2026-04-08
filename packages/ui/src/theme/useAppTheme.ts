/**
 * Bridge hook to avoid circular dependency between theme.ts and themeStore.ts
 * Pages that need both `theme` colors and `isDark` should use this hook.
 */
import { useTheme } from './theme';
import { useThemeStore } from './themeStore';

export function useAppTheme() {
  const colors = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  // Map flat ThemeColors to the theme.colors structure used by pages
  const theme = {
    colors: {
      background: colors.bg,
      backgroundAlt: colors.bgSecondary,
      backgroundCard: colors.bgCard,
      textPrimary: colors.text,
      textSecondary: colors.textSecondary,
      textTertiary: colors.textTertiary,
      borderSubtle: colors.border,
      borderLight: colors.borderLight,
      accentCyan: colors.brand,
      accentBlue: colors.accent,
      accentGreen: colors.success,
      accentRed: colors.danger,
      accentPurple: colors.purple,
    },
  };

  return { theme, isDark, toggleTheme, colors };
}
