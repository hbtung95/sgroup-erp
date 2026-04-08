import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  direction?: 'horizontal' | 'vertical';
  spacing?: number;
  color?: string;
  label?: string;
  style?: ViewStyle;
}

export function SGDivider({ direction = 'horizontal', spacing: sp = 16, color, label, style }: Props) {
  const c = useTheme();
  const line = color || c.divider;

  if (direction === 'vertical')
    return <View style={[{ backgroundColor: line, width: 1, alignSelf: 'stretch', marginHorizontal: sp }, style]} />;

  if (label)
    return (
      <View style={[styles.labelRow, { marginVertical: sp }, style]}>
        <View style={[styles.line, { backgroundColor: line }]} />
        <Text style={[typography.label, { color: c.textTertiary }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: line }]} />
      </View>
    );

  return <View style={[{ backgroundColor: line, height: 1, width: '100%', marginVertical: sp }, style]} />;
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: 1 },
});
