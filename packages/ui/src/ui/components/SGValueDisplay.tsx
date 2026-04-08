import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  value: string | number;
  unit?: string;
  label?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'left' | 'center' | 'right';
  style?: ViewStyle;
}

const SZ = { sm: 18, md: 24, lg: 36, xl: 52 };
const UZ = { sm: 10, md: 12, lg: 14, xl: 18 };

export function SGValueDisplay({ value, unit, label, color, size = 'md', align = 'left', style }: Props) {
  const c = useTheme();
  const fs = SZ[size];
  const us = UZ[size];
  const clr = color || c.text;

  return (
    <View style={[{ alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }, style]}>
      {label && (
        <Text style={[typography.label, { color: c.textTertiary, marginBottom: size === 'xl' ? 12 : 8 }]}>
          {label}
        </Text>
      )}
      <View style={styles.row}>
        <Text style={{ fontSize: fs, fontWeight: '900', color: clr, letterSpacing: fs >= 36 ? -1 : 0 }}>
          {value}
        </Text>
        {unit && (
          <Text style={{ fontSize: us, fontWeight: '700', color: c.textTertiary, marginLeft: 6, marginBottom: fs >= 36 ? 8 : 2 }}>
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline' },
});
