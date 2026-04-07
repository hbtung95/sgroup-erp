/**
 * Premium Glass Card — SGDS Example
 *
 * A reusable card component with glassmorphism, gradient accent,
 * animated entry, and press feedback.
 *
 * Usage:
 *   <PremiumCard
 *     icon="trending-up"
 *     title="Monthly Revenue"
 *     value="$245,800"
 *     trend={{ value: 12.5, direction: 'up' }}
 *     onPress={() => navigate('RevenueDetail')}
 *   />
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, typography, spacing, radius, sgds } from '@/shared/theme/theme';

// ─── Types ──────────────────────────────────────────────
interface PremiumCardProps {
  icon: string;
  title: string;
  value: string;
  trend?: { value: number; direction: 'up' | 'down' };
  accentColor?: string;
  gradient?: string[];
  onPress?: () => void;
  delay?: number; // stagger delay in ms
}

// ─── Component ──────────────────────────────────────────
export const PremiumCard: React.FC<PremiumCardProps> = ({
  icon,
  title,
  value,
  trend,
  accentColor,
  gradient,
  onPress,
  delay = 0,
}) => {
  const colors = useTheme();
  const resolvedGradient = gradient || colors.gradientBrand;
  const resolvedAccent = accentColor || colors.brand;

  // ─── Entry Animation ───────────────────────────────
  const translateY = useSharedValue(24);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      opacity.value = withTiming(1, { duration: 400 });
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const entryStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // ─── Press Feedback ─────────────────────────────────
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  // ─── Render ─────────────────────────────────────────
  return (
    <Animated.View style={[entryStyle, pressStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${value}`}
        style={[
          styles.card,
          {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder,
          },
          Platform.OS === 'web' && sgds.glass,
          Platform.OS === 'web' && sgds.transition.fast,
          Platform.OS === 'web' && sgds.cursor,
        ]}
      >
        {/* Gradient accent bar at top */}
        <LinearGradient
          colors={resolvedGradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />

        {/* Header: Icon + Trend */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${resolvedAccent}15` }]}>
            {/* Use SGIcons or Lucide icon here */}
            <Text style={{ color: resolvedAccent, fontSize: 18 }}>📊</Text>
          </View>
          {trend && (
            <View style={[
              styles.trendBadge,
              { backgroundColor: trend.direction === 'up' ? colors.successBg : colors.dangerBg },
            ]}>
              <Text style={[
                typography.caption,
                { color: trend.direction === 'up' ? colors.success : colors.danger },
              ]}>
                {trend.direction === 'up' ? '▲' : '▼'} {trend.value}%
              </Text>
            </View>
          )}
        </View>

        {/* Label */}
        <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.md }]}>
          {title}
        </Text>

        {/* Value */}
        <Text style={[typography.h1, { color: colors.text, marginTop: spacing.xs }]}>
          {value}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
