import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme, typography, sgds, radius } from '../../theme/theme';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function SGCheckbox({ checked, onChange, label, disabled, color, style }: Props) {
  const c = useTheme();
  const scale = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const active = color || c.brand;

  useEffect(() => {
    Animated.spring(scale, { toValue: checked ? 1 : 0, friction: 6, tension: 100, useNativeDriver: true }).start();
  }, [checked]);

  return (
    <Pressable
      style={[styles.row, { opacity: disabled ? 0.5 : 1 }, Platform.OS === 'web' && (sgds.cursor as any), style]}
      onPress={() => !disabled && onChange(!checked)} disabled={disabled}
    >
      <View style={[styles.box, { borderColor: checked ? active : c.border, backgroundColor: checked ? active : 'transparent' }]}>
        <Animated.View style={{ transform: [{ scale }], opacity: scale }}>
          <Check size={14} color="#fff" strokeWidth={3} />
        </Animated.View>
      </View>
      {label && <Text style={[typography.body, { color: c.text }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
