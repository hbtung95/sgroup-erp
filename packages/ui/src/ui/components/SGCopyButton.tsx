import React, { useState, useEffect, useRef } from 'react';
import { Pressable, Text, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTheme, typography, sgds } from '../../theme/theme';

interface Props {
  text: string;
  label?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function SGCopyButton({ text, label, size = 'md', style }: Props) {
  const c = useTheme();
  const [copied, setCopied] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const handleCopy = async () => {
    try { await Clipboard.setStringAsync(text); } catch { /* clipboard unavailable */ }
    setCopied(true);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => { if (copied) { const t = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(t); } }, [copied]);

  const isSm = size === 'sm';
  const Icon = copied ? Check : Copy;
  const clr = copied ? c.success : c.textSecondary;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={handleCopy}
        style={({ hovered }: any) => [styles.btn, {
          backgroundColor: hovered ? c.bgTertiary : 'transparent',
          paddingHorizontal: label ? (isSm ? 10 : 14) : (isSm ? 6 : 8),
          paddingVertical: isSm ? 4 : 6,
        }, Platform.OS === 'web' && ({ ...sgds.transition.fast, ...sgds.cursor } as any), style]}>
        <Icon size={isSm ? 13 : 15} color={clr} strokeWidth={2.5} />
        {label && <Text style={[isSm ? typography.caption : typography.small, { color: clr, fontWeight: '600' }]}>{copied ? 'Đã sao chép' : label}</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8 },
});
