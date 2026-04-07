/**
 * SGDS Animated Staggered List — Example
 *
 * Demonstrates list items that animate in with a staggered delay,
 * following SGDS Pro Max animation guidelines.
 */
import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '@/shared/theme/useAppTheme';
import { typography, spacing, radius, sgds } from '@/shared/theme/theme';

interface ListItem {
  id: string;
  title: string;
  subtitle: string;
}

const AnimatedListItem = ({ item, index }: { item: ListItem; index: number }) => {
  const { colors } = useAppTheme();
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 50; // 50ms stagger between items
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 90 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          backgroundColor: colors.glass,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          borderRadius: radius.md,
          padding: spacing.base,
          marginBottom: spacing.sm,
          ...sgds.glass,
        },
      ]}
    >
      <Text style={[typography.h3, { color: colors.text }]}>{item.title}</Text>
      <Text style={[typography.small, { color: colors.textSecondary, marginTop: spacing.xs }]}>
        {item.subtitle}
      </Text>
    </Animated.View>
  );
};

export const AnimatedList = ({ data }: { data: ListItem[] }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => <AnimatedListItem item={item} index={index} />}
      contentContainerStyle={{ padding: spacing.base }}
    />
  );
};
