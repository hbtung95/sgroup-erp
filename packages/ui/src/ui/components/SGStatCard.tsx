import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing, animations } from '../../theme/theme';

interface Props {
  icon?: React.ReactNode;
  iconColor?: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  compact?: boolean;
  gradient?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function SGStatCard({ icon, iconColor, label, value, unit, trend, compact, gradient, onPress, style }: Props) {
  const c = useTheme();
  const isDark = c.bg === '#080a0f' || c.bg === '#0A0E1A' || c.bg.startsWith('rgba') || c.bg.startsWith('#0');
  const trendUp = trend != null && trend > 0;
  const trendDown = trend != null && trend < 0;
  const trendColor = trendUp ? c.success : trendDown ? c.danger : c.textTertiary;
  const TrendIcon = trendUp ? TrendingUp : trendDown ? TrendingDown : Minus;
  const clr = iconColor || c.brand;

  // Premium gradient colors for each card based on accent
  const getGradientColors = (): [string, string] => {
    if (isDark) {
      return [`${clr}18`, `${clr}06`];
    }
    return [`${clr}0A`, `${clr}04`];
  };

  const getBorderGlow = () => {
    if (isDark) return `${clr}30`;
    return `${clr}20`;
  };

  const webEffects = Platform.OS === 'web' ? {
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    transition: `all 400ms ${animations.ease.elastic}`,
    cursor: onPress ? 'pointer' : 'default',
  } : {};

  const webHoverEffects = Platform.OS === 'web' ? {
    transform: [{ translateY: -4 }, { scale: 1.02 }],
  } : {};

  const content = (
    <>
      {/* Decorative accent bar at top */}
      <LinearGradient
        colors={[clr, `${clr}60`] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentBar}
      />

      {/* Top row: icon + trend */}
      <View style={styles.topRow}>
        {icon && (
          <LinearGradient
            colors={isDark ? [`${clr}30`, `${clr}12`] as any : [`${clr}18`, `${clr}08`] as any}
            style={[styles.iconBox, { borderColor: `${clr}20` }]}
          >
            {icon}
          </LinearGradient>
        )}
        {trend != null && (
          <View style={[styles.trendBadge, { backgroundColor: `${trendColor}15`, borderColor: `${trendColor}20` }]}>
            <TrendIcon size={11} color={trendColor} strokeWidth={2.5} />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trendUp ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
      </View>

      {/* Value — large & prominent */}
      <View style={styles.valueSection}>
        <Text style={[styles.valueText, { color: gradient ? '#fff' : c.text }]}>
          {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
        </Text>
        {unit && (
          <Text style={[styles.unitText, { color: gradient ? 'rgba(255,255,255,0.65)' : c.textTertiary }]}>
            {unit}
          </Text>
        )}
      </View>

      {/* Label — below value */}
      <Text
        style={[styles.labelText, { color: gradient ? 'rgba(255,255,255,0.8)' : c.textSecondary }]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Bottom decorative glow dot */}
      {Platform.OS === 'web' && (
        <View
          style={[styles.glowDot, {
            backgroundColor: clr,
            // @ts-ignore
            boxShadow: `0 0 20px 6px ${clr}30`,
          }] as any}
        />
      )}
    </>
  );

  const baseStyle: ViewStyle[] = [
    styles.card,
    {
      borderColor: getBorderGlow(),
      backgroundColor: isDark ? 'rgba(15, 19, 30, 0.7)' : '#fff',
    },
    Platform.OS === 'web' ? ({
      ...webEffects,
      boxShadow: isDark
        ? `0 4px 24px rgba(0,0,0,0.3), 0 0 40px ${clr}08, inset 0 1px 0 ${clr}10`
        : `0 4px 20px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.02), 0 0 30px ${clr}06`,
    } as any) : {},
    style as ViewStyle,
  ].filter(Boolean);

  if (gradient) {
    const gColors = isDark ? [`${clr}40`, `${clr}15`] : [`${clr}25`, `${clr}08`];
    const wrapper = (inner: React.ReactNode) => onPress
      ? <Pressable onPress={onPress}>{inner}</Pressable>
      : <>{inner}</>;
    return wrapper(
      <LinearGradient colors={gColors as any} style={[...baseStyle, { borderColor: `${clr}40` }]}>
        {content}
      </LinearGradient>
    );
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ hovered }: any) => [
          ...baseStyle,
          hovered ? {
            ...webHoverEffects,
            borderColor: `${clr}40`,
            ...(Platform.OS === 'web' ? {
              boxShadow: isDark
                ? `0 8px 32px rgba(0,0,0,0.4), 0 0 60px ${clr}15, inset 0 1px 0 ${clr}20`
                : `0 8px 30px rgba(0,0,0,0.08), 0 0 40px ${clr}12`,
            } as any : {}),
          } : {},
        ]}
      >
        <LinearGradient colors={getGradientColors() as any} style={styles.gradientOverlay}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <View style={baseStyle}>
      <LinearGradient colors={getGradientColors() as any} style={styles.gradientOverlay}>
        {content}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientOverlay: {
    padding: 22,
    gap: 10,
    borderRadius: 21,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  valueSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  valueText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    fontFamily: Platform.OS === 'web' ? "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" : 'PlusJakartaSans_800ExtraBold',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'web' ? "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" : 'PlusJakartaSans_700Bold',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? "'Inter', system-ui, sans-serif" : 'PlusJakartaSans_700Bold',
  },
  glowDot: {
    position: 'absolute',
    bottom: -4,
    right: 30,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
});
