import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, typography, spacing } from '../../theme/theme';

interface Props {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  style?: ViewStyle;
}

export function SGPageHeader({ icon, iconColor, title, subtitle, rightContent, style }: Props) {
  const c = useTheme();
  const clr = iconColor || c.brand;

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.iconBox, { backgroundColor: `${clr}20` }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.h2, { color: c.text }]}>{title}</Text>
        {subtitle && <Text style={[typography.body, { color: c.textSecondary, marginTop: 2 }]}>{subtitle}</Text>}
      </View>
      {rightContent}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
