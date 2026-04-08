import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds, radius } from '../../theme/theme';

type PillOption = { key: string; label: string; color?: string };

interface Props {
  options: PillOption[];
  activeKey: string;
  onChange: (key: string) => void;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function SGPillSelector({ options, activeKey, onChange, size = 'md', style }: Props) {
  const c = useTheme();
  const isSm = size === 'sm';

  return (
    <View style={[styles.row, style]}>
      {options.map(opt => {
        const active = opt.key === activeKey;
        const clr = opt.color || c.brand;
        return (
          <Pressable key={opt.key}
            style={({ hovered }: any) => [
              styles.pill,
              {
                backgroundColor: active ? `${clr}22` : hovered ? c.bgTertiary : 'transparent',
                paddingHorizontal: isSm ? 12 : 14,
                paddingVertical: isSm ? 5 : 7,
              },
              Platform.OS === 'web' && ({ ...sgds.transition.fast, ...sgds.cursor } as any),
            ]}
            onPress={() => onChange(opt.key)}
          >
            <Text style={[isSm ? typography.caption : typography.smallBold, {
              color: active ? clr : c.textTertiary,
              fontWeight: active ? '800' : '600',
            }]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pill: { borderRadius: 8 },
});
