import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, typography, sgds } from '../../theme/theme';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  separator?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function SGListItem({
  title, subtitle, icon, rightContent, onPress, showChevron = true, separator = true, disabled, style,
}: Props) {
  const c = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ hovered, pressed }: any) => [
        styles.row,
        separator && { borderBottomWidth: 1, borderBottomColor: c.divider },
        hovered && onPress && { backgroundColor: c.bgTertiary },
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.5 },
        Platform.OS === 'web' && onPress && ({ ...sgds.transition.fast, ...sgds.cursor } as any),
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.content}>
        <Text style={[typography.body, { color: c.text, fontWeight: '600' }]} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={[typography.caption, { color: c.textTertiary, marginTop: 2 }]} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {rightContent}
      {showChevron && onPress && <ChevronRight size={16} color={c.textTertiary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 4 },
  icon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
});
