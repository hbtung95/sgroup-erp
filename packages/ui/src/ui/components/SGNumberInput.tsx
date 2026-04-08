import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';
import { SGField } from './SGField';
import { SGStepper } from './SGStepper';

interface Props {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  hint?: string;
  error?: string;
  suffix?: string;
  mono?: boolean;
  style?: ViewStyle;
}

export function SGNumberInput({
  value, onChange, step = 1, min, max, label, hint, error, suffix, mono = true, style,
}: Props) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const clamp = (n: number) => {
    let res = n;
    if (min !== undefined && res < min) res = min;
    if (max !== undefined && res > max) res = max;
    return res;
  };

  const handleStep = (dir: number) => {
    const next = clamp(value + step * dir);
    // Handle floating point precision
    const precision = String(step).includes('.') ? String(step).split('.')[1].length : 0;
    onChange(Number(next.toFixed(precision)));
  };

  const isWeb = Platform.OS === 'web';
  
  const showStepper = isWeb && (focused || hovered);

  const content = (
    <View 
      {...(isWeb ? { 
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
        style: [
          styles.row,
          { backgroundColor: 'rgba(0,0,0,0.1)', borderColor: error ? c.danger : (focused ? c.accentCyan : c.borderStrong) },
          focused && { boxShadow: `0 0 0 3px rgba(6, 182, 212, 0.2)`, backgroundColor: c.glass },
          style
        ]
      } : { 
        style: [
          styles.row,
          { backgroundColor: c.bgInput, borderColor: error ? c.danger : (focused ? c.accentCyan : c.borderStrong) },
          style
        ]
      }) as any}
    >
      <TextInput
        style={[
          styles.input, 
          { color: c.text }, 
          mono && { fontFamily: typography.mono.fontFamily },
          isWeb && ({ outlineStyle: 'none' } as any)
        ]}
        value={String(value)}
        onChangeText={(t) => {
          const n = parseFloat(t);
          if (!isNaN(n)) onChange(clamp(n));
          else if (t === '') onChange(0);
        }}
        keyboardType="numeric"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {showStepper && (
        <SGStepper onStep={handleStep} onStop={() => {}} />
      )}

      {suffix && (
        <Text style={[styles.suffix, { color: c.textDisabled }]}>{suffix}</Text>
      )}
    </View>
  );

  if (label || hint || error) {
    return (
      <SGField label={label} hint={hint} error={error}>
        {content}
      </SGField>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderRadius: radius.md, 
    height: 48, 
    paddingHorizontal: spacing.base,
    position: 'relative',
    ...(Platform.OS === 'web' ? sgds.transition.fast : {}) as any 
  },
  input: { 
    flex: 1, 
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: Platform.OS === 'android' ? 8 : 0,
    textAlign: 'right',
    paddingRight: 35, // Space for stepper
  },
  suffix: {
    paddingLeft: 8,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  }
});
