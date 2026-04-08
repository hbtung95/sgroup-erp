import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  targetDate: Date;
  format?: 'dhms' | 'hms' | 'ms';
  onComplete?: () => void;
  color?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

function pad(n: number) { return n.toString().padStart(2, '0'); }

export function SGCountdown({ targetDate, format = 'dhms', onComplete, color, size = 'md', style }: Props) {
  const c = useTheme();
  const clr = color || c.brand;
  const isSm = size === 'sm';
  const pulse = useRef(new Animated.Value(1)).current;

  const calcRemaining = () => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, total: diff };
  };

  const [time, setTime] = useState(calcRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = calcRemaining();
      setTime(next);
      if (next.total <= 0) { clearInterval(interval); onComplete?.(); }
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    if (time.total <= 60000 && time.total > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.05, duration: 500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [time.total <= 60000]);

  const segments: { value: string; label: string }[] = [];
  if (format === 'dhms') segments.push({ value: pad(time.d), label: 'Ngày' });
  if (format !== 'ms') segments.push({ value: pad(time.h), label: 'Giờ' });
  segments.push({ value: pad(time.m), label: 'Phút' }, { value: pad(time.s), label: 'Giây' });

  return (
    <Animated.View style={[styles.row, { transform: [{ scale: pulse }] }, style]}>
      {segments.map((seg, i) => (
        <React.Fragment key={seg.label}>
          <View style={[styles.block, { backgroundColor: `${clr}10`, borderColor: `${clr}20` },
            isSm && { paddingHorizontal: 8, paddingVertical: 6 }]}>
            <Text style={{ fontSize: isSm ? 18 : 28, fontWeight: '900', color: clr, fontVariant: ['tabular-nums'] }}>{seg.value}</Text>
            <Text style={[typography.caption, { color: c.textTertiary, marginTop: 2, fontSize: isSm ? 9 : 10 }]}>{seg.label}</Text>
          </View>
          {i < segments.length - 1 && <Text style={{ fontSize: isSm ? 18 : 28, fontWeight: '900', color: c.textTertiary }}>:</Text>}
        </React.Fragment>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  block: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
});
