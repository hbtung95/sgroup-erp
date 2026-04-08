import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, sgds, spacing } from '../../theme/theme';

interface Props { children: React.ReactNode; style?: ViewStyle; shadow?: boolean }

export function SGBottomBar({ children, style, shadow = true }: Props) {
  const c = useTheme();
  return (
    <View style={[styles.bar, { backgroundColor: c.bgTopBar, borderTopColor: c.border },
      Platform.OS === 'web' && ({ ...sgds.glass,
        boxShadow: shadow ? `0 -4px 20px ${c.shadow}` : 'none' } as any), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', padding: spacing.base, paddingHorizontal: spacing.xl, borderTopWidth: 1, gap: 12 },
});
