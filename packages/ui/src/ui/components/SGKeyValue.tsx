import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  label: string;
  value: string | number | React.ReactNode;
  color?: string;
  separator?: boolean;
  style?: ViewStyle;
}

export function SGKeyValue({ label, value, color, separator = true, style }: Props) {
  const c = useTheme();
  return (
    <View style={[styles.row, separator && { borderBottomWidth: 1, borderBottomColor: c.divider }, style]}>
      <Text style={[typography.small, { color: c.textSecondary, flex: 1 }]}>{label}</Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={[typography.bodyBold, { color: color || c.text, textAlign: 'right' }]}>{value}</Text>
      ) : value}
    </View>
  );
}

interface GroupProps { children: React.ReactNode; title?: string; style?: ViewStyle }

export function SGKeyValueGroup({ children, title, style }: GroupProps) {
  const c = useTheme();
  return (
    <View style={style}>
      {title && <Text style={[typography.label, { color: c.textTertiary, marginBottom: 12 }]}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, gap: 16 },
});
