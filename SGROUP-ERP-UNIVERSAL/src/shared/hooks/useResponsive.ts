import { useState, useEffect } from 'react';
import { Dimensions, Platform, useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  numColumns: (mobileCol?: number, tabletCol?: number, desktopCol?: number) => number;
  fontSize: (base: number) => number;
}

const BREAKPOINTS = { mobile: 0, tablet: 768, desktop: 1024, wide: 1440 };

function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.wide) return 'wide';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

/**
 * Responsive layout hook — detects screen size and provides helpers.
 * Usage:
 *   const { isMobile, numColumns } = useResponsive();
 *   <FlatList numColumns={numColumns(1, 2, 4)} />
 */
export function useResponsive(): ResponsiveState {
  const { width, height } = useWindowDimensions();
  const breakpoint = getBreakpoint(width);

  return {
    width,
    height,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'wide',
    isWide: breakpoint === 'wide',
    numColumns: (mobileCol = 1, tabletCol = 2, desktopCol = 4) => {
      if (breakpoint === 'mobile') return mobileCol;
      if (breakpoint === 'tablet') return tabletCol;
      return desktopCol;
    },
    fontSize: (base: number) => {
      if (breakpoint === 'mobile') return base * 0.85;
      if (breakpoint === 'tablet') return base * 0.95;
      return base;
    },
  };
}

/**
 * Hook to compute sidebar width based on screen.
 * On mobile: sidebar hidden (0), on tablet: slim (64px), on desktop: full (260px).
 */
export function useSidebarWidth(): number {
  const { breakpoint } = useResponsive();
  if (breakpoint === 'mobile') return 0;
  if (breakpoint === 'tablet') return 64;
  return 260;
}
