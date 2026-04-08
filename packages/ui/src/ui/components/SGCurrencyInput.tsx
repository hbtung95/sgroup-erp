import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';
import { useThemeStore } from '../../theme/themeStore';

/* ═══════════════════════════════════════════════════════════════════
   SGCurrencyInput — Specialized input for currency / large numbers
   Hero-size support for prominent data entry fields
   ═══════════════════════════════════════════════════════════════════ */

interface Props {
  value: number;
  onValueChange: (v: number) => void;
  label?: string;
  currency?: string;            // 'VND', 'USD', '$', '₫', or custom
  unit?: string;                // 'Tỷ', 'Triệu', '%', …
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  color?: string;
  min?: number;
  max?: number;
  precision?: number;
  disabled?: boolean;
  style?: ViewStyle;
}

const isWeb = Platform.OS === 'web';
const web = (s: any) => (isWeb ? s : {});
const webInput: any = isWeb ? { outlineStyle: 'none', outlineWidth: 0 } : {};

const SIZES = {
  sm:   { fontSize: 16,  unitSize: 12, labelSize: 10, py: 8,  px: 12, radius: 12, gap: 4  },
  md:   { fontSize: 24,  unitSize: 14, labelSize: 11, py: 12, px: 16, radius: 16, gap: 6  },
  lg:   { fontSize: 36,  unitSize: 16, labelSize: 12, py: 16, px: 20, radius: 20, gap: 8  },
  hero: { fontSize: 52,  unitSize: 20, labelSize: 12, py: 24, px: 28, radius: 24, gap: 10 },
};

export function SGCurrencyInput({
  value, onValueChange, label, currency, unit, placeholder,
  size = 'md', color, min, max, precision = 0, disabled, style,
}: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const clr = color || '#D42027';
  const sz = SIZES[size];

  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(String(value));

  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  const clamp = useCallback((n: number) => {
    let v = n;
    if (max != null) v = Math.min(v, max);
    if (min != null) v = Math.max(v, min);
    return parseFloat(v.toFixed(precision));
  }, [min, max, precision]);

  const handleText = (t: string) => {
    setText(t);
    const n = parseFloat(t.replace(/[^0-9.\-]/g, ''));
    if (!isNaN(n)) onValueChange(clamp(n));
  };

  const handleFocus = () => setFocused(true);

  const handleBlur = () => {
    setFocused(false);
    const n = parseFloat(text.replace(/[^0-9.\-]/g, ''));
    if (!isNaN(n)) {
      const clamped = clamp(n);
      onValueChange(clamped);
      setText(String(clamped));
    } else {
      setText(String(value));
    }
  };

  const isHero = size === 'hero' || size === 'lg';

  return (
    <View style={[styles.wrapper, {
      alignItems: isHero ? 'center' : 'flex-start',
      opacity: disabled ? 0.45 : 1,
    }, style]}>
      {/* Label */}
      {label && (
        <Text style={[typography.label, {
          color: colors.textTertiary, marginBottom: sz.gap,
          letterSpacing: isHero ? 2 : 1.2,
          fontSize: sz.labelSize,
        }]}>{label}</Text>
      )}

      {/* Input Area */}
      <View style={[styles.inputRow, {
        gap: sz.gap,
        paddingBottom: isHero ? 4 : 0,
        borderBottomWidth: focused ? 2.5 : 1.5,
        borderBottomColor: focused
          ? clr
          : (isDark ? `${clr}30` : `${clr}18`),
        ...web({
          transition: 'border-color 0.25s ease',
        }),
      }]}>
        {/* Currency prefix */}
        {currency && (
          <Text style={{
            fontSize: sz.fontSize * 0.55, fontWeight: '600',
            color: `${clr}66`, marginRight: 2,
            alignSelf: 'center',
          } as any}>{currency}</Text>
        )}

        {/* Text Input */}
        <TextInput
          style={[{
            fontSize: sz.fontSize, fontWeight: '800',
            color: clr, textAlign: 'center',
            minWidth: sz.fontSize * 2, padding: 0,
            paddingVertical: sz.py / 4,
            fontFamily: typography.body.fontFamily,
          }, webInput] as any}
          value={text}
          onChangeText={handleText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={`${clr}35`}
          keyboardType="numeric"
          selectTextOnFocus
          editable={!disabled}
        />

        {/* Unit suffix */}
        {unit && (
          <Text style={[
            isHero ? typography.h3 : typography.body,
            { color: colors.textTertiary, opacity: 0.5, fontWeight: '600' },
          ]}>{unit}</Text>
        )}
      </View>

      {/* Focus indicator glow (web only) */}
      {isWeb && focused && (
        <View style={{
          position: 'absolute', bottom: -2, left: '20%', right: '20%', height: 3,
          borderRadius: 2, backgroundColor: clr, opacity: 0.4,
          ...web({ filter: `blur(6px)` }),
        } as any} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative' },
  inputRow: { flexDirection: 'row', alignItems: 'baseline' },
});
