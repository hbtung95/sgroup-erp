import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, Animated, ScrollView, StyleSheet, ViewStyle, Platform, LayoutChangeEvent } from 'react-native';
import { useTheme, typography, sgds, radius } from '../../theme/theme';

export type TabItem = { key: string; label: string; icon?: any; badge?: number };

interface Props {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: 'underline' | 'pill';
  scrollable?: boolean;
  style?: ViewStyle;
}

export function SGTabs({ tabs, activeKey, onChange, variant = 'underline', scrollable, style }: Props) {
  const c = useTheme();
  const indX = useRef(new Animated.Value(0)).current;
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});

  const onLayout = useCallback((key: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts(p => ({ ...p, [key]: { x, width } }));
  }, []);

  useEffect(() => {
    const l = layouts[activeKey];
    if (l && variant === 'underline') {
      Animated.spring(indX, { toValue: l.x, friction: 10, tension: 100, useNativeDriver: true }).start();
    }
  }, [activeKey, layouts]);

  const activeLayout = layouts[activeKey];

  const inner = (
    <View style={[styles.row, variant === 'pill' && styles.pillRow, variant === 'underline' && { borderBottomWidth: 1, borderBottomColor: c.divider }, style]}>
      {tabs.map(tab => {
        const active = tab.key === activeKey;
        const Icon = tab.icon;
        return (
          <Pressable key={tab.key} onLayout={onLayout(tab.key)}
            style={({ hovered }: any) => [styles.tab,
              variant === 'pill' && [styles.pillTab, active && { backgroundColor: `${c.brand}15` }, !active && hovered && { backgroundColor: c.bgTertiary }],
              Platform.OS === 'web' && (sgds.transition.fast as any)]}
            onPress={() => onChange(tab.key)}>
            {Icon && <Icon size={16} color={active ? c.brand : c.textTertiary} strokeWidth={active ? 2.5 : 1.5} />}
            <Text style={[typography.smallBold, { color: active ? c.brand : c.textSecondary, fontWeight: active ? '800' : '600' }]}>{tab.label}</Text>
            {tab.badge != null && tab.badge > 0 && (
              <View style={[styles.badge, { backgroundColor: active ? c.brand : c.textTertiary }]}>
                <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
      {variant === 'underline' && activeLayout && (
        <Animated.View style={[styles.indicator, { backgroundColor: c.brand, width: activeLayout.width, transform: [{ translateX: indX }] }]} />
      )}
    </View>
  );

  return scrollable ? <ScrollView horizontal showsHorizontalScrollIndicator={false}>{inner}</ScrollView> : inner;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', position: 'relative' },
  pillRow: { gap: 4, padding: 4, borderRadius: 14 },
  tab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16 },
  pillTab: { borderRadius: 10 },
  indicator: { position: 'absolute', bottom: 0, height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  badge: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
});
