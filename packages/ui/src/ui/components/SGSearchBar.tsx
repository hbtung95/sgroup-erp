import React, { useState, useRef } from 'react';
import { View, TextInput, Pressable, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  filters?: React.ReactNode;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export function SGSearchBar({ value, onChangeText, placeholder = 'Tìm kiếm...', onSubmit, filters, autoFocus, style }: Props) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  const ref = useRef<TextInput>(null);
  const borderColor = focused ? c.borderFocus : c.border;

  return (
    <View style={[styles.row, { backgroundColor: c.bgInput, borderColor },
      Platform.OS === 'web' && ({ ...sgds.transition.fast, boxShadow: focused ? `0 0 0 3px ${c.borderFocus}15` : 'none' } as any), style]}>
      <Search size={18} color={focused ? c.brand : c.textTertiary} strokeWidth={2} />
      <TextInput ref={ref}
        style={[styles.input, { color: c.text }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={c.textTertiary} onSubmitEditing={onSubmit} returnKeyType="search"
        autoFocus={autoFocus} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      {value.length > 0 && (
        <Pressable style={[styles.clear, { backgroundColor: c.bgTertiary }]}
          onPress={() => { onChangeText(''); ref.current?.focus(); }}>
          <X size={14} color={c.textTertiary} strokeWidth={2.5} />
        </Pressable>
      )}
      {filters}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: 14, height: 48, gap: 10 },
  input: { flex: 1, ...typography.body, paddingVertical: 0 },
  clear: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
