import React, { useRef, useEffect } from 'react';
import { View, Pressable, Animated, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme, sgds, radius } from '../../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  anchor: React.ReactNode;
  children: React.ReactNode;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  width?: number;
  style?: ViewStyle;
}

export function SGPopover({ visible, onClose, anchor, children, position = 'bottom-left', width = 240, style }: Props) {
  const c = useTheme();
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) Animated.spring(scale, { toValue: 1, friction: 10, tension: 100, useNativeDriver: true }).start();
    else scale.setValue(0);
  }, [visible]);

  const pos: ViewStyle = position === 'bottom-right' ? { top: '100%', right: 0, marginTop: 6 }
    : position === 'top-left' ? { bottom: '100%', left: 0, marginBottom: 6 }
    : position === 'top-right' ? { bottom: '100%', right: 0, marginBottom: 6 }
    : { top: '100%', left: 0, marginTop: 6 };

  const origin = position === 'bottom-right' ? 'top right' : position === 'top-left' ? 'bottom left'
    : position === 'top-right' ? 'bottom right' : 'top left';

  return (
    <View style={styles.wrap}>
      {anchor}
      {visible && (
        <>
          <Pressable style={styles.backdrop} onPress={onClose} />
          <Animated.View style={[styles.popover, { width, backgroundColor: c.bgSecondary, borderColor: c.border,
            transform: [{ scale }], opacity: scale }, pos,
            Platform.OS === 'web' && ({ transformOrigin: origin, ...sgds.glass, boxShadow: '0 12px 40px rgba(0,0,0,0.25)' } as any), style]}>
            {children}
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', zIndex: 100 },
  backdrop: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 },
  popover: { position: 'absolute', borderRadius: radius.xl, borderWidth: 1, overflow: 'hidden', zIndex: 100, padding: 6 },
});
