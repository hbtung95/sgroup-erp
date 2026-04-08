import React from 'react';
import { Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, sgds } from '../../theme/theme';

interface Props {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'ghost';
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const SZ = { sm: 28, md: 36, lg: 44 };
const RAD = { sm: 8, md: 10, lg: 12 };

export function SGIconButton({ icon, onPress, size = 'md', variant = 'default', color, disabled, style }: Props) {
  const c = useTheme();
  const s = SZ[size];
  const r = RAD[size];

  const bg = variant === 'filled' ? (color || c.brand)
    : variant === 'ghost' ? 'transparent'
    : c.bgTertiary;
  const hoverBg = variant === 'ghost' ? c.bgTertiary : variant === 'filled' ? (color || c.brand) : c.bgCardHover;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed, hovered }: any) => [
        styles.btn,
        { width: s, height: s, borderRadius: r, backgroundColor: hovered && !pressed ? hoverBg : bg, opacity: disabled ? 0.5 : pressed ? 0.7 : 1 },
        Platform.OS === 'web' && ({ ...sgds.transition.fast, ...sgds.cursor } as any),
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center' },
});
