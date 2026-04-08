import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useTheme, sgds } from '../../theme/theme';

interface Props {
  count?: number;
  onPress?: () => void;
  maxCount?: number;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const SZ = { sm: 28, md: 36, lg: 44 };
const IC = { sm: 14, md: 18, lg: 22 };

export function SGNotificationBell({ count = 0, onPress, maxCount = 99, size = 'md', style }: Props) {
  const c = useTheme();
  const s = SZ[size];
  const ic = IC[size];
  const hasNotif = count > 0;
  const displayCount = count > maxCount ? `${maxCount}+` : String(count);

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: any) => [styles.btn, {
        width: s, height: s, borderRadius: s / 2.5,
        backgroundColor: hovered ? c.bgTertiary : 'transparent',
      }, Platform.OS === 'web' && ({ ...sgds.transition.fast, ...sgds.cursor } as any), style]}
    >
      <Bell size={ic} color={hasNotif ? c.brand : c.textSecondary} strokeWidth={hasNotif ? 2.5 : 1.5} />
      {hasNotif && (
        <View style={[styles.badge, size === 'sm' && styles.badgeSm]}>
          <Text style={[styles.badgeText, size === 'sm' && { fontSize: 8 }]}>{displayCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: '#fff' },
  badgeSm: { top: 0, right: 0, minWidth: 14, height: 14, borderRadius: 7 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
});
