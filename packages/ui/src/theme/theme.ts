import { Platform } from 'react-native';
import { useThemeStore } from './themeStore';

// ══════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ══════════════════════════════════════════════════════════════════
const palette = {
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',

  // Brand & Accents (New from AppScript)
  brand50: '#EFF6FF',
  brand100: '#DBEAFE',
  brand200: '#BFDBFE',
  brand300: '#93C5FD',
  brand400: '#60A5FA',
  brand500: '#3B82F6',
  brand600: '#2563EB',
  brand700: '#1D4ED8',
  brand800: '#1E40AF',
  brand900: '#1E3A8A',

  // AppScript Tokens
  accentBlue: '#0ea5e9', // Sky Blue
  accentCyan: '#06b6d4', // Cyan
  accentIndigo: '#6366f1',
  accentPurple: '#a855f7',

  // Status
  green50: '#F0FDF4',
  green100: '#DCFCE7',
  green400: '#22C55E', // Khớp với --sg-status-success
  green500: '#16A34A',

  red50: '#FEF2F2',
  red100: '#FEE2E2',
  red400: '#EF4444', // Khớp với --sg-status-danger
  red500: '#DC2626',

  orange50: '#FFF7ED',
  orange100: '#FFEDD5',
  orange400: '#EAB308', // Khớp với --sg-status-warning
  orange500: '#D97706',

  // Dark backgrounds (Deep Dark)
  darkDeep: '#080a0f', // --sg-bg-base
  dark50: '#1A1F2E',
  dark100: '#151929',
  dark200: '#0F1323',
  dark300: '#0A0E1A',
};

// ══════════════════════════════════════════════════════════════════
// THEME TOKENS
// ══════════════════════════════════════════════════════════════════
export interface ThemeColors {
  // Backgrounds
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  bgCard: string;
  bgCardHover: string;
  bgInput: string;
  bgOverlay: string;
  bgSidebar: string;
  bgTopBar: string;
  bgElevated: string;
  bgGlow: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string; // Added to match CSS tokens
  textInverse: string;
  textOnBrand: string;

  // Borders
  border: string;
  borderLight: string;
  borderStrong: string; // Added to match CSS tokens
  borderFocus: string;
  divider: string;

  // Brand
  brand: string;
  brandLight: string;
  brandDark: string;

  // Status
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;

  // Accent
  accent: string;
  accentCyan: string;
  accentBg: string;
  purple: string;
  purpleBg: string;
  teal: string;
  tealBg: string;

  // Glass (AppScript specific)
  glass: string;
  glassHeavy: string;
  glassBorder: string;
  glassHover: string;

  // Gradients
  gradientBrand: string[];
  gradientAccent: string[]; // From AppScript
  gradientGold: string[];
  gradientSuccess: string[];
  gradientDanger: string[];
  gradientPurple: string[];
  gradientDark: string[];
  gradientSurface: string[];

  // Aurora
  aurora: string[];

  // Shadows
  shadow: string;
  shadowStrong: string;
  shadowGlow: string;
  cardGlow: string;
}

const darkColors: ThemeColors = {
  bg: palette.darkDeep,
  bgSecondary: 'rgba(20, 24, 35, 0.6)', // --sg-bg-glass
  bgTertiary: 'rgba(28, 32, 45, 0.8)', // --sg-bg-glass-heavy
  bgCard: 'rgba(255,255,255,0.04)',
  bgCardHover: 'rgba(35, 40, 55, 0.7)', // --sg-bg-glass-hover
  bgInput: 'rgba(255,255,255,0.06)',
  bgOverlay: 'rgba(0, 0, 0, 0.4)', // --sg-bg-overlay
  bgSidebar: palette.darkDeep,
  bgTopBar: 'rgba(8, 10, 15, 0.85)',
  bgElevated: 'rgba(28, 32, 45, 0.9)',
  bgGlow: 'rgba(14, 165, 233, 0.06)',

  text: palette.white, // --sg-text-primary
  textSecondary: palette.gray400, // --sg-text-secondary (#94a3b8)
  textTertiary: palette.gray500, // --sg-text-tertiary (#64748b)
  textDisabled: palette.gray600, // --sg-text-disabled (#475569)
  textInverse: palette.gray900,
  textOnBrand: palette.white,

  border: 'rgba(255, 255, 255, 0.08)', // --sg-border-subtle
  borderLight: 'rgba(255, 255, 255, 0.04)',
  borderStrong: 'rgba(255, 255, 255, 0.15)', // --sg-border-strong
  borderFocus: palette.accentBlue,
  divider: 'rgba(255, 255, 255, 0.06)',

  brand: palette.accentBlue,
  brandLight: '#38bdf8',
  brandDark: '#0284c7',

  success: palette.green400,
  successBg: 'rgba(34, 197, 94, 0.12)',
  warning: palette.orange400,
  warningBg: 'rgba(234, 179, 8, 0.12)',
  danger: palette.red400,
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  info: palette.accentBlue,
  infoBg: 'rgba(14, 165, 233, 0.12)',

  accent: palette.accentBlue,
  accentCyan: palette.accentCyan,
  accentBg: 'rgba(14, 165, 233, 0.15)',
  purple: palette.accentPurple,
  purpleBg: 'rgba(168, 85, 247, 0.12)',
  teal: palette.accentCyan,
  tealBg: 'rgba(6, 182, 212, 0.12)',

  glass: 'rgba(20, 24, 35, 0.6)',
  glassHeavy: 'rgba(28, 32, 45, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  glassHover: 'rgba(35, 40, 55, 0.7)',

  gradientBrand: [palette.accentBlue, palette.accentCyan], // --sg-accent-gradient
  gradientAccent: [palette.accentBlue, palette.accentCyan],
  gradientGold: ['#F59E0B', '#FBBF24'],
  gradientSuccess: ['#22c55e', '#4ade80'],
  gradientDanger: ['#ef4444', '#f87171'],
  gradientPurple: ['#6366f1', '#a855f7'],
  gradientDark: [palette.darkDeep, '#1c202d'],
  gradientSurface: ['rgba(14, 165, 233, 0.08)', 'rgba(99, 102, 241, 0.05)'],

  aurora: [
    'rgba(14, 165, 233, 0.15)', // --sg-aurora-1
    'rgba(99, 102, 241, 0.15)', // --sg-aurora-2
    'rgba(6, 182, 212, 0.1)',  // --sg-aurora-3
  ],

  shadow: 'rgba(0,0,0,0.4)',
  shadowStrong: 'rgba(0,0,0,0.6)',
  shadowGlow: 'rgba(14, 165, 233, 0.25)',
  cardGlow: 'rgba(14, 165, 233, 0.12)',
};

const lightColors: ThemeColors = {
  bg: '#f8fafc', // --sg-bg-base (light)
  bgSecondary: 'rgba(255, 255, 255, 0.7)', // --sg-bg-glass
  bgTertiary: 'rgba(255, 255, 255, 0.9)', // --sg-bg-glass-heavy
  bgCard: palette.white,
  bgCardHover: 'rgba(255, 255, 255, 0.95)', // --sg-bg-glass-hover
  bgInput: palette.gray100,
  bgOverlay: 'rgba(255, 255, 255, 0.5)', // --sg-bg-overlay
  bgSidebar: palette.white,
  bgTopBar: 'rgba(255,255,255,0.88)',
  bgElevated: palette.white,
  bgGlow: 'rgba(14, 165, 233, 0.04)',

  text: '#0f172a', // --sg-text-primary
  textSecondary: '#475569', // --sg-text-secondary
  textTertiary: '#94a3b8', // --sg-text-tertiary
  textDisabled: '#cbd5e1', // --sg-text-disabled
  textInverse: palette.white,
  textOnBrand: palette.white,

  border: 'rgba(0, 0, 0, 0.06)', // --sg-border-subtle
  borderLight: 'rgba(0, 0, 0, 0.03)',
  borderStrong: 'rgba(0, 0, 0, 0.12)', // --sg-border-strong
  borderFocus: '#0284c7', // --sg-accent-blue (light)
  divider: 'rgba(0, 0, 0, 0.06)',

  brand: '#0284c7',
  brandLight: '#0ea5e9',
  brandDark: '#0369a1',

  success: '#16a34a',
  successBg: '#f0fdf4',
  warning: '#d97706',
  warningBg: '#fffbeb',
  danger: '#dc2626',
  dangerBg: '#fef2f2',
  info: '#0284c7',
  infoBg: '#f0f9ff',

  accent: '#0284c7',
  accentCyan: '#0891b2',
  accentBg: 'rgba(14, 165, 233, 0.08)',
  purple: '#9333ea',
  purpleBg: '#f5f3ff',
  teal: '#0891b2',
  tealBg: '#ecfeff',

  glass: 'rgba(255, 255, 255, 0.7)',
  glassHeavy: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
  glassHover: 'rgba(255, 255, 255, 0.85)',

  gradientBrand: ['#0ea5e9', '#06b6d4'],
  gradientAccent: ['#0ea5e9', '#06b6d4'],
  gradientGold: ['#D97706', '#F59E0B'],
  gradientSuccess: ['#16a34a', '#22c55e'],
  gradientDanger: ['#dc2626', '#ef4444'],
  gradientPurple: ['#7c3aed', '#a855f7'],
  gradientDark: [palette.gray100, palette.white],
  gradientSurface: ['rgba(14, 165, 233, 0.04)', 'rgba(99, 102, 241, 0.03)'],

  aurora: [
    'rgba(14, 165, 233, 0.08)', // --sg-aurora-1 (light)
    'rgba(99, 102, 241, 0.06)', // --sg-aurora-2 (light)
    'rgba(6, 182, 212, 0.05)',  // --sg-aurora-3 (light)
  ],

  shadow: 'rgba(0,0,0,0.06)',
  shadowStrong: 'rgba(0,0,0,0.12)',
  shadowGlow: 'rgba(14, 165, 233, 0.15)',
  cardGlow: 'rgba(14, 165, 233, 0.08)',
};

// ══════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ══════════════════════════════════════════════════════════════════
const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
  mono: Platform.OS === 'web' ? "'JetBrains Mono', monospace" : 'SpaceMono_400Regular',
};

const getFont = (native: string) => Platform.OS === 'web' 
  ? `'Inter', 'Plus Jakarta Sans', system-ui, sans-serif` 
  : native;

export const typography = {
  hero: { fontSize: 42, fontWeight: '800' as const, lineHeight: 50, fontFamily: getFont(fonts.extraBold) },
  h1: { fontSize: 26, fontWeight: '700' as const, lineHeight: 32, letterSpacing: -0.26, fontFamily: getFont(fonts.bold) },
  h2: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, letterSpacing: -0.18, fontFamily: getFont(fonts.semiBold) },
  h3: { fontSize: 15, fontWeight: '600' as const, lineHeight: 21, fontFamily: getFont(fonts.semiBold) },
  h4: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20, fontFamily: getFont(fonts.semiBold) },
  body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21, fontFamily: getFont(fonts.regular) },
  bodyBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 21, fontFamily: getFont(fonts.semiBold) },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19, fontFamily: getFont(fonts.regular) },
  smallBold: { fontSize: 13, fontWeight: '600' as const, lineHeight: 19, fontFamily: getFont(fonts.semiBold) },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16, fontFamily: getFont(fonts.medium) },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const, fontFamily: getFont(fonts.semiBold) },
  micro: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1, textTransform: 'uppercase' as const, fontFamily: getFont(fonts.bold) },
  mono: { fontSize: 13, fontFamily: fonts.mono, letterSpacing: -0.26 },
};

// Font Weight Map for utility usage
export const fontWeight = {
  black: '900' as const,
  extrabold: '800' as const,
  bold: '700' as const,
  semibold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

// ══════════════════════════════════════════════════════════════════
// SPACING & RADIUS (Aligned with AppScript --sg-sp and --sg-radius)
// ══════════════════════════════════════════════════════════════════
export const spacing = {
  xs: 4,  // sg-sp-1
  sm: 8,  // sg-sp-2
  md: 12, // sg-sp-3
  base: 16, // sg-sp-4
  lg: 24, // sg-sp-5
  xl: 32, // sg-sp-6
  '2xl': 48, // sg-sp-8
  '3xl': 64,
  '4xl': 80,
};

export const radius = {
  xs: 6,
  sm: 8,  // sg-radius-sm
  md: 12, // sg-radius-md
  lg: 16, // sg-radius-lg
  xl: 24, // sg-radius-xl
  '2xl': 32, // sg-radius-2xl
  pill: 9999, // sg-radius-pill
};

// ══════════════════════════════════════════════════════════════════
// ANIMATIONS & PHYSICS (Aligned with AppScript)
// ══════════════════════════════════════════════════════════════════
export const animations = {
  ease: {
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    squish: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    snappy: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  },
  duration: {
    fast: 150,
    base: 300,
    slow: 500,
  }
};

// ══════════════════════════════════════════════════════════════════
// SGDS (SGroup Design System) SHORTCUTS
// ══════════════════════════════════════════════════════════════════
export const sgds = {
  glass: {
    ...(Platform.OS === 'web'
      ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }
      : {}),
  },
  transition: {
    fast: Platform.OS === 'web' ? { transition: `all ${animations.duration.fast}ms ${animations.ease.snappy}` } : {},
    normal: Platform.OS === 'web' ? { transition: `all ${animations.duration.base}ms ${animations.ease.smooth}` } : {},
    slow: Platform.OS === 'web' ? { transition: `all ${animations.duration.slow}ms ${animations.ease.smooth}` } : {},
  },
  cursor: Platform.OS === 'web' ? { cursor: 'pointer' as const } : {},
  typo: typography,
  spacing,
  radius,
  layout: {
    contentPadding: 32,
    sectionGap: 32,
  },
  sectionBase: (theme: any) => ({
    backgroundColor: theme?.colors?.bgCard || 'rgba(20,24,35,0.45)',
    borderRadius: 28,
    padding: 32,
    borderWidth: 1,
    borderColor: theme?.colors?.border || 'rgba(255,255,255,0.05)',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(32px) saturate(180%)',
      WebkitBackdropFilter: 'blur(32px) saturate(180%)',
    } : {}),
  }),
};

// ══════════════════════════════════════════════════════════════════
// HOOK
// ══════════════════════════════════════════════════════════════════
export function useTheme(): ThemeColors {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? darkColors : lightColors;
}

export { darkColors, lightColors, palette };
