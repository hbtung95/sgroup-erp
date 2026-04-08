import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds } from '../../theme/theme';

export type RadioOption = { label: string; value: string; description?: string };

interface Props {
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
  direction?: 'horizontal' | 'vertical';
  label?: string;
  disabled?: boolean;
  color?: string;
  style?: ViewStyle;
}

function Dot({ selected, color }: { selected: boolean; color: string }) {
  const scale = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: selected ? 1 : 0, friction: 6, tension: 120, useNativeDriver: true }).start();
  }, [selected]);
  return <Animated.View style={[styles.dot, { backgroundColor: color, transform: [{ scale }], opacity: scale }]} />;
}

export function SGRadioGroup({ options, value, onChange, direction = 'vertical', label, disabled, color, style }: Props) {
  const c = useTheme();
  const active = color || c.brand;

  return (
    <View style={[styles.wrap, style]}>
      {label && <Text style={[typography.label, { color: c.textSecondary, marginBottom: 12 }]}>{label}</Text>}
      <View style={[styles.list, direction === 'horizontal' && styles.horizontal]}>
        {options.map(opt => {
          const sel = opt.value === value;
          return (
            <Pressable key={opt.value}
              style={[styles.item, { opacity: disabled ? 0.5 : 1 }, Platform.OS === 'web' && (sgds.cursor as any)]}
              onPress={() => !disabled && onChange(opt.value)} disabled={disabled}>
              <View style={[styles.ring, { borderColor: sel ? active : c.border }]}>
                <Dot selected={sel} color={active} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: c.text, fontWeight: sel ? '600' : '400' }]}>{opt.label}</Text>
                {opt.description && <Text style={[typography.caption, { color: c.textTertiary, marginTop: 2 }]}>{opt.description}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  list: { gap: 8 },
  horizontal: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  ring: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
