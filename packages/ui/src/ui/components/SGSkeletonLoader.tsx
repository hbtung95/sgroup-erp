/**
 * SGSkeletonLoader — Shimmer skeleton loading component for tables and cards
 * Usage:
 *   <SGSkeletonLoader rows={5} columns={4} />
 *   <SGSkeletonLoader type="card" count={3} />
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, Platform } from 'react-native';

type Props = {
  type?: 'table' | 'card' | 'stat';
  rows?: number;
  columns?: number;
  count?: number;
  isDark?: boolean;
};

function ShimmerBar({ width, height = 14, isDark = false, delay = 0 }: { width: number | string; height?: number; isDark?: boolean; delay?: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.7, duration: 800, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        width: width as any,
        height,
        borderRadius: 8,
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        opacity: anim,
      }}
    />
  );
}

export function SGSkeletonLoader({ type = 'table', rows = 5, columns = 4, count = 3, isDark = false }: Props) {
  const bg = isDark ? 'rgba(20,24,35,0.45)' : '#fff';
  const border = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  if (type === 'stat') {
    return (
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        {new Array(count).fill(0).map((_, i) => (
          <View key={i} style={{
            flex: 1, minWidth: 200, padding: 24, borderRadius: 20,
            backgroundColor: bg, borderWidth: 1, borderColor: border,
          }}>
            <ShimmerBar width={80} height={12} isDark={isDark} delay={i * 100} />
            <View style={{ height: 12 }} />
            <ShimmerBar width={120} height={32} isDark={isDark} delay={i * 100 + 50} />
            <View style={{ height: 8 }} />
            <ShimmerBar width={60} height={10} isDark={isDark} delay={i * 100 + 100} />
          </View>
        ))}
      </View>
    );
  }

  if (type === 'card') {
    return (
      <View style={{ gap: 12 }}>
        {new Array(count).fill(0).map((_, i) => (
          <View key={i} style={{
            padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
            backgroundColor: bg, borderWidth: 1, borderColor: border,
          }}>
            <View style={{
              width: 52, height: 52, borderRadius: 16,
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            }} />
            <View style={{ flex: 1, gap: 8 }}>
              <ShimmerBar width="60%" height={16} isDark={isDark} delay={i * 80} />
              <ShimmerBar width="40%" height={12} isDark={isDark} delay={i * 80 + 40} />
            </View>
            <ShimmerBar width={70} height={24} isDark={isDark} delay={i * 80 + 80} />
          </View>
        ))}
      </View>
    );
  }

  // Table skeleton
  return (
    <View style={{
      borderRadius: 16, overflow: 'hidden',
      backgroundColor: bg, borderWidth: 1, borderColor: border,
    }}>
      {/* Header row */}
      <View style={{
        flexDirection: 'row', padding: 16, gap: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
        borderBottomWidth: 1, borderBottomColor: border,
      }}>
        {new Array(columns).fill(0).map((_, i) => (
          <ShimmerBar key={i} width={`${Math.floor(100 / columns)}%`} height={12} isDark={isDark} delay={i * 50} />
        ))}
      </View>
      {/* Data rows */}
      {new Array(rows).fill(0).map((_, r) => (
        <View key={r} style={{
          flexDirection: 'row', padding: 16, gap: 16,
          borderBottomWidth: r < rows - 1 ? 1 : 0, borderBottomColor: border,
        }}>
          {new Array(columns).fill(0).map((_, c) => (
            <ShimmerBar
              key={c}
              width={`${Math.floor(100 / columns)}%`}
              height={14}
              isDark={isDark}
              delay={r * 60 + c * 30}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
