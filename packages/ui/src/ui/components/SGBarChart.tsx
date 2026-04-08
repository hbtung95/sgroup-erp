import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, typography, radius } from '../../theme/theme';

// === Vertical grouped bars (cashflow-style) ===
type BarGroup = { label: string; values: { value: number; color: string }[] };

interface GroupedBarProps {
  data: BarGroup[];
  height?: number;
  legend?: { label: string; color: string }[];
  style?: ViewStyle;
}

export function SGBarChart({ data, height = 80, legend, style }: GroupedBarProps) {
  const c = useTheme();
  const maxVal = Math.max(...data.flatMap(g => g.values.map(v => Math.abs(v.value))), 1);

  return (
    <View style={style}>
      <View style={[styles.chartRow, { height: height + 40 }]}>
        {data.map((group, i) => (
          <View key={i} style={styles.barGroup}>
            <View style={[styles.barsWrap, { height }]}>
              {group.values.map((v, j) => (
                <View key={j} style={[styles.bar, {
                  height: `${(Math.abs(v.value) / maxVal) * 100}%` as any,
                  backgroundColor: v.color,
                }]} />
              ))}
            </View>
            <Text style={[typography.caption, { color: c.textSecondary, marginTop: 8, textAlign: 'center', fontWeight: '800' }]}>
              {group.label}
            </Text>
          </View>
        ))}
      </View>
      {legend && (
        <View style={styles.legend}>
          {legend.map((l, i) => (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={[typography.caption, { color: c.textSecondary, fontWeight: '600' }]}>{l.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// === Stacked horizontal bar (OPEX proportion-style) ===
type StackItem = { value: number; color: string; label?: string };

interface StackedBarProps {
  items: StackItem[];
  height?: number;
  style?: ViewStyle;
}

export function SGStackedBar({ items, height = 40, style }: StackedBarProps) {
  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <View style={[styles.stackedRow, { height, borderRadius: height / 2 }, style]}>
      {items.map((item, i) => {
        const pct = (item.value / total) * 100;
        return (
          <View key={i} style={{ flex: pct, backgroundColor: item.color, alignItems: 'center', justifyContent: 'center' }}>
            {pct >= 8 && <Text style={styles.stackLabel}>{Math.round(pct)}%</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chartRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  barGroup: { flex: 1, minWidth: 50, alignItems: 'center' },
  barsWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, width: '100%' },
  bar: { flex: 1, borderRadius: 6, minWidth: 8 },
  legend: { flexDirection: 'row', gap: 20, justifyContent: 'center', marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  stackedRow: { flexDirection: 'row', overflow: 'hidden' },
  stackLabel: { fontSize: 10, fontWeight: '800', color: '#fff' },
});
