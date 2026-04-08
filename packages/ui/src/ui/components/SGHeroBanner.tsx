import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  gradientColors?: readonly [string, string, ...string[]];
  icon?: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  badges?: { label: string; value: string }[];
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function SGHeroBanner({ gradientColors, icon, title, value, subtitle, badges, children, style }: Props) {
  const c = useTheme();
  const colors = gradientColors || (c.gradientBrand as any);

  return (
    <LinearGradient colors={colors as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[styles.banner, Platform.OS === 'web' && ({ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' } as any), style]}>
      <View style={styles.content}>
        <View style={styles.left}>
          {icon && <View style={styles.iconBox}>{icon}</View>}
          <View style={{ flex: 1 }}>
            <Text style={[typography.label, { color: 'rgba(255,255,255,0.7)', marginBottom: 12 }]}>{title}</Text>
            {badges && badges.length > 0 && (
              <View style={styles.badges}>
                {badges.map((b, i) => (
                  <View key={i} style={styles.badge}>
                    <Text style={styles.badgeLabel}>{b.label}: <Text style={styles.badgeValue}>{b.value}</Text></Text>
                  </View>
                ))}
              </View>
            )}
            {subtitle && <Text style={[typography.caption, { color: 'rgba(255,255,255,0.5)', marginTop: 8 }]}>{subtitle}</Text>}
          </View>
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
      {children && <View style={{ marginTop: 20 }}>{children}</View>}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: radius['2xl'], padding: spacing['2xl'], overflow: 'hidden' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 20, flex: 1 },
  iconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  badge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  badgeValue: { color: '#fff', fontWeight: '900' },
  value: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -2 },
});
