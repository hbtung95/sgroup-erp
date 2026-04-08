import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
  showRing?: boolean;
  color?: string;
  style?: ViewStyle;
}

const SZ = { sm: 32, md: 40, lg: 56, xl: 72 };
const STATUS_CLR = { online: '#22C55E', offline: '#94A3B8', busy: '#EF4444', away: '#F59E0B' };

export function SGAvatar({ name, imageUrl, size = 'md', status, showRing, color, style }: Props) {
  const c = useTheme();
  const s = SZ[size];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const bg = color || c.brand;

  return (
    <View style={[styles.wrap, { width: s + (showRing ? 6 : 0), height: s + (showRing ? 6 : 0) }, style]}>
      {showRing && (
        <View style={[styles.ring, { width: s + 6, height: s + 6, borderRadius: (s + 6) / 2, borderColor: bg }]} />
      )}
      <View style={[styles.avatar, { width: s, height: s, borderRadius: s / 2, backgroundColor: bg }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: s, height: s, borderRadius: s / 2 }} />
        ) : (
          <Text style={{ color: '#fff', fontSize: s * 0.36, fontWeight: '700' }}>{initials}</Text>
        )}
      </View>
      {status && (
        <View style={[styles.statusDot, {
          width: s * 0.28, height: s * 0.28, borderRadius: s * 0.14,
          backgroundColor: STATUS_CLR[status], borderColor: c.bg, borderWidth: 2,
        }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 2, opacity: 0.5 },
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  statusDot: { position: 'absolute', bottom: 0, right: 0 },
});
