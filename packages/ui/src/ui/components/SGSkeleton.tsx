import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../theme/theme';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  variant?: 'text' | 'rect' | 'circle';
  count?: number;
  gap?: number;
  style?: ViewStyle;
}

function Item({ width, height, borderRadius, variant, style }: Omit<Props, 'count' | 'gap'>) {
  const c = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: false }),
      Animated.timing(anim, { toValue: 0, duration: 1200, useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const v = { text: { w: width || '100%', h: height || 14, r: borderRadius ?? 6 },
    rect: { w: width || '100%', h: height || 80, r: borderRadius ?? 12 },
    circle: { w: width || 48, h: height || 48, r: borderRadius ?? 9999 } }[variant || 'rect'];

  return (
    <Animated.View style={[{ width: v.w as any, height: v.h, borderRadius: v.r,
      backgroundColor: anim.interpolate({ inputRange: [0, 1], outputRange: [c.bgTertiary, c.bgInput] }) as any }, style]} />
  );
}

export function SGSkeleton({ width, height, borderRadius, variant = 'rect', count = 1, gap = 12, style }: Props) {
  if (count <= 1) return <Item width={width} height={height} borderRadius={borderRadius} variant={variant} style={style} />;
  return (
    <View style={{ gap }}>
      {new Array(count).fill(0).map((_, i) => (
        <Item key={i} width={width} height={height} borderRadius={borderRadius} variant={variant} style={style} />
      ))}
    </View>
  );
}
