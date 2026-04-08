import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
  bold?: boolean;
  separator?: boolean;
  style?: ViewStyle;
}

export function SGMetricRow({ label, value, unit, icon, color, bold, separator = true, style }: Props) {
  const c = useTheme();
  const valColor = color || c.text;

  return (
    <View style={[styles.row, separator && { borderBottomWidth: 1, borderBottomColor: c.divider }, style]}>
      <View style={styles.left}>
        {icon && <View style={[styles.iconBox, { backgroundColor: `${valColor}12` }]}>{icon}</View>}
        <Text style={[typography.small, { color: c.textSecondary }]}>{label}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[bold ? typography.h3 : typography.bodyBold, { color: valColor }]}>{value}</Text>
        {unit && <Text style={[typography.caption, { color: c.textTertiary, marginLeft: 4 }]}>{unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  right: { flexDirection: 'row', alignItems: 'baseline' },
});
