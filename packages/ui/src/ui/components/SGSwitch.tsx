import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor 
} from 'react-native-reanimated';
import { useTheme, typography, sgds, radius } from '../../theme/theme';

interface Props {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
}

const SZ = { 
  sm: { w: 32, h: 20, thumb: 14, off: 3 }, 
  md: { w: 48, h: 28, thumb: 22, off: 3 }, 
  lg: { w: 56, h: 32, thumb: 26, off: 3 } 
};

export function SGSwitch({ value, onValueChange, label, description, disabled, size = 'md', color, style }: Props) {
  const c = useTheme();
  const anim = useSharedValue(value ? 1 : 0);
  const s = SZ[size];
  const active = color || c.brand;
  const travel = s.w - s.thumb - s.off * 2;

  useEffect(() => {
    anim.value = withSpring(value ? 1 : 0, {
      damping: 12,
      stiffness: 120,
      mass: 0.8,
    });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        anim.value,
        [0, 1],
        [c.borderStrong, active]
      ),
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: anim.value * travel + s.off }],
    };
  });

  return (
    <Pressable 
      style={[styles.row, { opacity: disabled ? 0.5 : 1 }, Platform.OS === 'web' && (sgds.cursor as any), style]}
      onPress={() => !disabled && onValueChange(!value)} 
      disabled={disabled}
    >
      <Animated.View style={[
        styles.track, 
        trackStyle,
        { width: s.w, height: s.h, borderRadius: 999 },
        Platform.OS === 'web' && ({ 
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          transition: 'background-color 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        } as any)
      ]}>
        <Animated.View style={[
          styles.thumb, 
          thumbStyle,
          { width: s.thumb, height: s.thumb, borderRadius: 999 },
          Platform.OS === 'web' && ({ 
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          } as any)
        ]} />
      </Animated.View>
      {(label || description) && (
        <View style={{ flex: 1, marginLeft: 12 }}>
          {label && <Text style={[typography.bodyBold, { color: c.text }]}>{label}</Text>}
          {description && <Text style={[typography.small, { color: c.textSecondary, marginTop: 2 }]}>{description}</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  track: { justifyContent: 'center', position: 'relative' },
  thumb: { backgroundColor: '#fff', elevation: 2 },
});
