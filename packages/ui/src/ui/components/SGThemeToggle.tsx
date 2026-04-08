/**
 * SGDS — SGThemeToggle
 * Premium animated dark/light theme toggle with pill-shaped slider.
 * Uses CSS transitions on web and Animated on native.
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme, sgds } from '../../theme/theme';
import { useThemeStore } from '../../theme/themeStore';

interface Props {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const SIZES = {
  sm: { track: { w: 52, h: 28 }, knob: 22, icon: 13, padding: 3 },
  md: { track: { w: 64, h: 34 }, knob: 26, icon: 15, padding: 4 },
};

export function SGThemeToggle({ size = 'md' }: Props) {
  const colors = useTheme();
  const { isDark, toggleTheme } = useThemeStore();
  const s = SIZES[size];

  // Animated value for knob position
  const slideAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  // Animated value for knob rotation (Sun spins)
  const rotateAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  // Animated value for scale bounce
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const toVal = isDark ? 1 : 0;

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: toVal,
        useNativeDriver: false,
        friction: 8,
        tension: 80,
      }),
      Animated.timing(rotateAnim, {
        toValue: toVal,
        duration: 400,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: false,
          friction: 4,
          tension: 100,
        }),
      ]),
    ]).start();
  }, [isDark]);

  const knobTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [s.padding, s.track.w - s.knob - s.padding],
  });

  const knobRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Track gradient colors
  const trackBg = isDark
    ? 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)'
    : 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)';

  const trackBgFallback = isDark ? '#1e293b' : '#fbbf24';

  // Knob styling
  const knobBg = isDark ? '#0f172a' : '#ffffff';
  const knobShadow = isDark
    ? '0 2px 8px rgba(99,102,241,0.4), 0 0 12px rgba(99,102,241,0.2)'
    : '0 2px 8px rgba(251,191,36,0.4), 0 0 12px rgba(249,115,22,0.2)';

  const iconColor = isDark ? '#a78bfa' : '#f59e0b';

  return (
    <Pressable
      onPress={toggleTheme}
      style={[
        Platform.OS === 'web' && (sgds.cursor as any),
      ]}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: s.track.w,
            height: s.track.h,
            borderRadius: s.track.h / 2,
            backgroundColor: trackBgFallback,
            borderColor: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(251,191,36,0.4)',
          },
          Platform.OS === 'web' && ({
            background: trackBg,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isDark
              ? 'inset 0 1px 3px rgba(0,0,0,0.3), 0 0 8px rgba(99,102,241,0.15)'
              : 'inset 0 1px 3px rgba(0,0,0,0.1), 0 0 8px rgba(251,191,36,0.2)',
          } as any),
          { transform: [{ scale: (scaleAnim as any) }] },
        ]}
      >
        {/* Decorative dots — stars in dark, rays in light */}
        {Platform.OS === 'web' && (
          <View style={styles.decorContainer} pointerEvents="none">
            {isDark ? (
              <>
                <View style={[styles.star, { top: 6, left: 10, width: 2, height: 2, opacity: 0.7 }]} />
                <View style={[styles.star, { top: 14, left: 16, width: 1.5, height: 1.5, opacity: 0.5 }]} />
                <View style={[styles.star, { top: 8, left: 22, width: 2.5, height: 2.5, opacity: 0.6 }]} />
              </>
            ) : (
              <>
                <View style={[styles.ray, { top: 4, right: 8, backgroundColor: 'rgba(255,255,255,0.5)' }]} />
                <View style={[styles.ray, { bottom: 4, right: 14, backgroundColor: 'rgba(255,255,255,0.3)' }]} />
              </>
            )}
          </View>
        )}

        {/* Knob */}
        <Animated.View
          style={[
            styles.knob,
            {
              width: s.knob,
              height: s.knob,
              borderRadius: s.knob / 2,
              backgroundColor: knobBg,
              transform: [
                { translateX: knobTranslateX },
                { rotate: knobRotate },
              ],
            },
            Platform.OS === 'web' && ({
              boxShadow: knobShadow,
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
            } as any),
          ]}
        >
          {isDark ? (
            <Moon size={s.icon} color={iconColor} strokeWidth={2.5} />
          ) : (
            <Sun size={s.icon} color={iconColor} strokeWidth={2.5} />
          )}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  knob: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  decorContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: '#e2e8f0',
  },
  ray: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 100,
  },
});
