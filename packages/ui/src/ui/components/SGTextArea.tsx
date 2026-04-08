import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  style?: ViewStyle;
}

export function SGTextArea({
  value, onChangeText, placeholder, label, error, maxLength, rows = 4, disabled, style,
}: Props) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? c.danger : focused ? c.borderFocus : c.border;

  return (
    <View style={[styles.wrap, style]}>
      {label && <Text style={[typography.label, { color: c.textSecondary, marginBottom: 8 }]}>{label}</Text>}
      <TextInput
        style={[styles.input, {
          backgroundColor: c.bgInput, borderColor, color: c.text,
          height: rows * 24 + 28, opacity: disabled ? 0.5 : 1,
        }, Platform.OS === 'web' && ({ outlineStyle: 'none', ...sgds.transition.fast } as any)]}
        value={value}
        onChangeText={t => { if (maxLength && t.length > maxLength) return; onChangeText(t); }}
        placeholder={placeholder}
        placeholderTextColor={c.textTertiary}
        multiline numberOfLines={rows} textAlignVertical="top"
        editable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <View style={styles.footer}>
        {error ? <Text style={[typography.caption, { color: c.danger }]}>{error}</Text> : <View />}
        {maxLength != null && (
          <Text style={[typography.caption, { color: value.length >= maxLength ? c.danger : c.textTertiary }]}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.base },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.base, paddingVertical: 14, ...typography.body },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
});
