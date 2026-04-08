import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface Props {
  label?: string;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function SGBadge({ label, variant = 'default', dot, size = 'md', style }: Props) {
  const c = useTheme();

  const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: c.successBg, text: c.success },
    warning: { bg: c.warningBg, text: c.warning },
    danger: { bg: c.dangerBg, text: c.danger },
    info: { bg: c.infoBg, text: c.info },
    default: { bg: c.bgTertiary, text: c.textSecondary },
  };

  const v = variantColors[variant];
  const isSm = size === 'sm';

  // Dot-only badge (no text)
  if (dot) {
    return (
      <View style={[styles.dotBadge, { width: isSm ? 8 : 10, height: isSm ? 8 : 10, borderRadius: 5, backgroundColor: v.text }, style]} />
    );
  }

  return (
    <View style={[styles.badge, {
      backgroundColor: v.bg,
      paddingHorizontal: isSm ? 8 : 10,
      paddingVertical: isSm ? 2 : 4,
    }, style]}>
      <Text style={[isSm ? typography.caption : { ...typography.caption, fontWeight: '600' as const }, { color: v.text }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dotBadge: {
    alignSelf: 'flex-start',
  },
});
