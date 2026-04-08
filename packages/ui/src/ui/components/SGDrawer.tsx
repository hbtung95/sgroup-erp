import React, { useRef, useEffect } from 'react';
import { View, Pressable, Animated, StyleSheet, Platform, Dimensions } from 'react-native';
import { useTheme, sgds } from '../../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right';
  width?: number;
}

export function SGDrawer({ visible, onClose, children, side = 'right', width = 360 }: Props) {
  const c = useTheme();
  const slideX = useRef(new Animated.Value(side === 'right' ? width : -width)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideX, { toValue: 0, friction: 10, tension: 60, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX, { toValue: side === 'right' ? width : -width, duration: 250, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, { backgroundColor: c.bgOverlay, opacity: fade },
        Platform.OS === 'web' && (sgds.glass as any)]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.drawer, {
        width, backgroundColor: c.bgSecondary, borderColor: c.border,
        [side]: 0,
        transform: [{ translateX: slideX }],
      }, Platform.OS === 'web' && ({ boxShadow: side === 'right' ? '-8px 0 40px rgba(0,0,0,0.2)' : '8px 0 40px rgba(0,0,0,0.2)' } as any)]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  drawer: { position: 'absolute', top: 0, bottom: 0, borderWidth: 1, borderTopWidth: 0, borderBottomWidth: 0, zIndex: 1000 },
});
