import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showValue?: boolean;
  label?: string;
  style?: ViewStyle;
}

export function SGMiniChart({ data, color, height = 32, width, showValue, label, style }: Props) {
  const c = useTheme();
  const clr = color || c.brand;
  const maxVal = Math.max(...data, 1);
  const latest = data[data.length - 1] || 0;

  return (
    <View style={[styles.wrap, width ? { width } : { flex: 1 }, style]}>
      {label && <Text style={[typography.caption, { color: c.textTertiary, marginBottom: 4 }]}>{label}</Text>}
      <View style={[styles.row, { height }]}>
        {data.map((v, i) => (
          <View key={i} style={[styles.bar, {
            height: `${(v / maxVal) * 100}%` as any,
            backgroundColor: i === data.length - 1 ? clr : `${clr}50`,
            borderRadius: 2,
          }]} />
        ))}
      </View>
      {showValue && <Text style={[typography.caption, { color: clr, fontWeight: '800', marginTop: 4, textAlign: 'right' }]}>{latest}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { flex: 1, minWidth: 3 },
});
