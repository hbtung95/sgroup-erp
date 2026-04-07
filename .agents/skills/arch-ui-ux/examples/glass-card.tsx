/**
 * SGDS Glass Card Pattern — Example
 *
 * Demonstrates the standard glass card with glow, gradient accent,
 * and spring press animation following SGDS Pro Max guidelines.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp } from 'lucide-react-native';
import { useAppTheme } from '@/shared/theme/useAppTheme';
import { typography, spacing, radius, sgds } from '@/shared/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassStatCard = ({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) => {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        {
          backgroundColor: colors.glass,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          borderRadius: radius.lg,
          padding: spacing.lg,
          ...sgds.glass,
          ...sgds.transition.fast,
        },
      ]}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.successBg,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: radius.pill,
        }}>
          <TrendingUp size={12} color={colors.success} strokeWidth={2} />
          <Text style={[typography.micro, { color: colors.success, marginLeft: 4 }]}>
            {change}
          </Text>
        </View>
      </View>

      <Text style={[typography.h1, { color: colors.text, marginTop: spacing.md }]}>
        {value}
      </Text>

      {/* Subtle gradient accent line at bottom */}
      <LinearGradient
        colors={colors.gradientBrand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          height: 2,
          borderRadius: 1,
          marginTop: spacing.lg,
          opacity: 0.6,
        }}
      />
    </AnimatedPressable>
  );
};
