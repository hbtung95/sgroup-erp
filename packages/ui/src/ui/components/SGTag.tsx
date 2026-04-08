import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, typography, sgds } from '../../theme/theme';

interface Props {
  label: string;
  color?: string;
  onClose?: () => void;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'solid' | 'soft' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function SGTag({ label, color, onClose, onPress, icon, variant = 'soft', size = 'md', style }: Props) {
  const c = useTheme();
  const clr = color || c.brand;
  const vs = variant === 'solid' ? { bg: clr, fg: '#fff', border: 'transparent' }
    : variant === 'outline' ? { bg: 'transparent', fg: clr, border: clr }
    : { bg: `${clr}15`, fg: clr, border: 'transparent' };
  const isSm = size === 'sm';

  const content = (
    <>
      {icon}
      <Text style={[isSm ? typography.caption : typography.smallBold, { color: vs.fg }]}>{label}</Text>
      {onClose && (
        <Pressable onPress={e => { e.stopPropagation?.(); onClose(); }}><X size={isSm ? 10 : 12} color={vs.fg} strokeWidth={2.5} /></Pressable>
      )}
    </>
  );

  const base = [styles.tag, { backgroundColor: vs.bg, borderColor: vs.border, borderWidth: variant === 'outline' ? 1 : 0,
    paddingHorizontal: isSm ? 8 : 10, paddingVertical: isSm ? 3 : 5 }, style];

  if (onPress) {
    return <Pressable onPress={onPress} style={[...base, Platform.OS === 'web' && (sgds.cursor as any)]}>{content}</Pressable>;
  }
  return <View style={base}>{content}</View>;
}

const styles = StyleSheet.create({
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9999, alignSelf: 'flex-start' },
});
