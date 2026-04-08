import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds, radius } from '../../theme/theme';

interface Props {
  progress: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  style?: ViewStyle;
}

const SZ = { sm: 4, md: 8, lg: 12 };

export function SGProgressBar({ progress, color, label, showPercentage = true, size = 'md', animated = true, style }: Props) {
  const c = useTheme();
  const w = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(Math.max(progress, 0), 100);
  const bar = color || c.brand;
  const h = SZ[size];

  useEffect(() => {
    if (animated) Animated.spring(w, { toValue: clamped, friction: 12, tension: 40, useNativeDriver: false }).start();
    else w.setValue(clamped);
  }, [clamped, animated]);

  return (
    <View style={[styles.wrap, style]}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && <Text style={[typography.caption, { color: c.textSecondary }]}>{label}</Text>}
          {showPercentage && <Text style={[typography.smallBold, { color: bar }]}>{Math.round(clamped)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height: h, borderRadius: h / 2, backgroundColor: c.bgTertiary }]}>
        <Animated.View style={[styles.fill, { height: h, borderRadius: h / 2, backgroundColor: bar,
          width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' }) as any },
          Platform.OS === 'web' && ({ boxShadow: `0 0 12px ${bar}40` } as any)]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  track: { overflow: 'hidden', position: 'relative' },
  fill: { position: 'absolute', left: 0, top: 0 },
});
