import React, { useState, useRef } from 'react';
import { View, Pressable, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme, sgds } from '../../theme/theme';

interface Props {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  size?: number;
  color?: string;
  readOnly?: boolean;
  style?: ViewStyle;
}

export function SGRating({ value, onChange, max = 5, size = 24, color, readOnly, style }: Props) {
  const c = useTheme();
  const clr = color || '#f59e0b';
  const [hovered, setHovered] = useState(-1);
  const scales = useRef(new Array(max).fill(0).map(() => new Animated.Value(1))).current;

  const handlePress = (idx: number) => {
    if (readOnly) return;
    onChange?.(idx + 1);
    Animated.sequence([
      Animated.timing(scales[idx], { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scales[idx], { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <View style={[styles.row, style]}>
      {new Array(max).fill(0).map((_, i) => {
        const active = i < (hovered >= 0 ? hovered + 1 : value);
        return (
          <Animated.View key={i} style={{ transform: [{ scale: scales[i] }] }}>
            <Pressable
              onPress={() => handlePress(i)}
              disabled={readOnly}
              // @ts-ignore web events
              onMouseEnter={() => !readOnly && setHovered(i)}
              onMouseLeave={() => setHovered(-1)}
              style={Platform.OS === 'web' && !readOnly && ({ ...sgds.cursor } as any)}
            >
              <Star
                size={size}
                color={active ? clr : c.textTertiary}
                fill={active ? clr : 'none'}
                strokeWidth={active ? 0 : 1.5}
              />
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
