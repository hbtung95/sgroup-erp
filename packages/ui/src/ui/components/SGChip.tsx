import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, typography, sgds } from '../../theme/theme';

interface Props {
  label: string;
  color?: string;
  icon?: React.ReactNode;
  onRemove?: () => void;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function SGChip({ label, color, icon, onRemove, onPress, selected, disabled, style }: Props) {
  const c = useTheme();
  const clr = color || c.brand;
  const bg = selected ? `${clr}20` : c.bgTertiary;
  const textClr = selected ? clr : c.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ hovered }: any) => [styles.chip, {
        backgroundColor: hovered && onPress ? `${clr}15` : bg,
        borderColor: selected ? `${clr}40` : 'transparent',
        opacity: disabled ? 0.5 : 1,
      }, Platform.OS === 'web' && onPress && ({ ...sgds.transition.fast, ...sgds.cursor } as any), style]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[typography.small, { color: textClr, fontWeight: selected ? '700' : '600' }]}>{label}</Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8}
          style={[styles.removeBtn, Platform.OS === 'web' && (sgds.cursor as any)]}>
          <X size={12} color={c.textTertiary} strokeWidth={3} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  icon: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  removeBtn: { marginLeft: 2, padding: 2 },
});
