import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, typography } from '../../theme/theme';

type Segment = { value: number; color: string; label?: string };

interface Props {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  showLegend?: boolean;
  style?: ViewStyle;
}

export function SGDonutChart({ segments, size = 160, strokeWidth = 18, centerLabel, centerValue, showLegend, style }: Props) {
  const c = useTheme();
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;

  return (
    <View style={[styles.wrap, style]}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={c.bgTertiary} strokeWidth={strokeWidth} />
          {/* Segments */}
          {segments.map((seg, i) => {
            const pct = seg.value / total;
            const dashLen = pct * circumference;
            const dashGap = circumference - dashLen;
            const rotation = offset * 360 - 90;
            offset += pct;
            return (
              <Circle key={i} cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={seg.color} strokeWidth={strokeWidth}
                strokeDasharray={`${dashLen} ${dashGap}`}
                strokeLinecap="round"
                transform={`rotate(${rotation} ${size / 2} ${size / 2})`} />
            );
          })}
        </Svg>
        {/* Center text */}
        {(centerLabel || centerValue) && (
          <View style={styles.center}>
            {centerValue && <Text style={[styles.centerVal, { color: c.text }]}>{centerValue}</Text>}
            {centerLabel && <Text style={[typography.caption, { color: c.textTertiary }]}>{centerLabel}</Text>}
          </View>
        )}
      </View>
      {/* Legend */}
      {showLegend && (
        <View style={styles.legend}>
          {segments.map((seg, i) => (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: seg.color }]} />
              <Text style={[typography.caption, { color: c.textSecondary }]}>
                {seg.label || `Item ${i + 1}`}
              </Text>
              <Text style={[typography.caption, { color: c.text, fontWeight: '700', marginLeft: 4 }]}>
                {Math.round((seg.value / total) * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 20 },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  centerVal: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  legend: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
