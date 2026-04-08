import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';
import { SGField } from './SGField';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  disabled?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  mono?: boolean;
  style?: ViewStyle;
}

export function SGInput({
  value, onChangeText, placeholder, label, hint, error, icon, secureTextEntry,
  disabled, keyboardType, mono = true, style,
}: Props) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);

  const webFocusStyle = Platform.OS === 'web' && focused ? {
    borderColor: c.accentCyan,
    backgroundColor: c.glass,
    boxShadow: `0 0 0 3px rgba(6, 182, 212, 0.2)`,
  } as any : {};

  return (
    <SGField label={label} hint={hint} error={error}>
      <View style={[
        styles.row, 
        { 
          backgroundColor: Platform.OS === 'web' ? 'rgba(0,0,0,0.1)' : c.bgInput, 
          borderColor: error ? c.danger : (focused ? c.accentCyan : c.borderStrong),
        },
        webFocusStyle,
        style
      ]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input, 
            { color: c.text }, 
            mono && { fontFamily: typography.mono.fontFamily },
            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.textDisabled}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </SGField>
  );
}

const styles = StyleSheet.create({
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderRadius: radius.md, 
    height: 48, 
    paddingHorizontal: spacing.base, 
    gap: 10,
    ...(Platform.OS === 'web' ? sgds.transition.fast : {}) as any 
  },
  icon: { width: 20, alignItems: 'center' },
  input: { 
    flex: 1, 
    fontSize: 14,
    paddingVertical: Platform.OS === 'android' ? 8 : 0,
  },
});
