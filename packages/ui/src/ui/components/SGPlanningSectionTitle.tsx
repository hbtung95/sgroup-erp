import React from 'react';
import { Platform, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeStore } from '../../theme/themeStore';

type SGPlanningSectionTitleProps = {
  icon: React.ComponentType<any>;
  title: string;
  accent: string;
  subtitle?: string;
  badgeText?: string;
  style?: StyleProp<ViewStyle>;
};

const isWeb = Platform.OS === 'web';
const webOnly = <T extends object>(styles: T): T | {} => (isWeb ? styles : {});

export function SGPlanningSectionTitle({
  icon: Icon,
  title,
  accent,
  subtitle,
  badgeText = 'SECTION',
  style,
}: SGPlanningSectionTitleProps) {
  const { isDark } = useThemeStore();

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
            ...webOnly({ boxShadow: `0 10px 28px ${accent}33` }),
          }}
        >
          <Icon size={22} color="#FFFFFF" strokeWidth={2.5} />
        </View>

        <View>
          <Text style={{ fontSize: 10, fontWeight: '800', color: accent, letterSpacing: 1.8 }}>{badgeText}</Text>
          <Text style={{ fontSize: 24, fontWeight: '900', color: isDark ? '#FFFFFF' : '#0F172A' }}>{title}</Text>
          {subtitle ? <Text style={{ fontSize: 12, color: isDark ? '#94A3B8' : '#64748B' }}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}
