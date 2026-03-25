import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  centerContent?: React.ReactNode;
  style?: ViewStyle;
}

export function SGCircularProgress({ progress, size = 80, strokeWidth = 8, color, label, centerContent, style }: Props) {
  const c = useTheme();
  const clamped = Math.min(Math.max(progress, 0), 100);
  const active = color || c.brand;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamped / 100) * circ;

  return (
    <View style={[styles.wrap, style]}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.bgTertiary} strokeWidth={strokeWidth} fill="none" />
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={active} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        </Svg>
        <View style={styles.center}>
          {centerContent || <Text style={[typography.bodyBold, { color: active, fontSize: size * 0.2 }]}>{Math.round(clamped)}%</Text>}
        </View>
      </View>
      {label && <Text style={[typography.caption, { color: c.textTertiary, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
