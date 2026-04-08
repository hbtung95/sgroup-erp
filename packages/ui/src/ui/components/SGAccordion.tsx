import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, ViewStyle, Platform, LayoutAnimation } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme, typography, sgds, radius } from '../../theme/theme';

interface Props {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SGAccordion({ title, icon, defaultOpen = false, children, style }: Props) {
  const c = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const rotate = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    const next = !open;
    if (Platform.OS !== 'web') LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(next);
    Animated.spring(rotate, { toValue: next ? 1 : 0, friction: 8, tension: 100, useNativeDriver: true }).start();
  };

  return (
    <View style={[styles.wrap, { borderColor: c.border }, style]}>
      <Pressable
        style={({ hovered }: any) => [styles.header,
          { backgroundColor: hovered ? c.bgTertiary : 'transparent' },
          Platform.OS === 'web' && ({ ...sgds.transition.fast, ...sgds.cursor } as any)]}
        onPress={toggle}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={[typography.bodyBold, { color: c.text, flex: 1 }]}>{title}</Text>
        <Animated.View style={{
          transform: [{ rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }],
        }}>
          <ChevronDown size={18} color={c.textTertiary} />
        </Animated.View>
      </Pressable>
      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: radius.xl, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingHorizontal: 20 },
  icon: { width: 24, alignItems: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
});
