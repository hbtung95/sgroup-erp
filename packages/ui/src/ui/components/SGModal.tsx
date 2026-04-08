import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, Animated, StyleSheet, Platform, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  width?: number;
  children: React.ReactNode;
}

export function SGModal({ visible, onClose, title, subtitle, width = 520, children }: Props) {
  const c = useTheme();
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 10, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else { scale.setValue(0.9); opacity.setValue(0); }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { backgroundColor: c.bgOverlay, opacity },
        Platform.OS === 'web' && (sgds.glass as any)]}>
        <Pressable style={styles.overlayPress} onPress={onClose} />
      </Animated.View>

      <View style={styles.center}>
        <Animated.View style={[styles.modal, {
          width: Math.min(width, Dimensions.get('window').width * 0.92),
          backgroundColor: c.bgSecondary, borderColor: c.border,
          transform: [{ scale }], opacity,
        }, Platform.OS === 'web' && ({ ...sgds.glass, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' } as any)]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              {title && <Text style={[typography.h3, { color: c.text }]}>{title}</Text>}
              {subtitle && <Text style={[typography.small, { color: c.textTertiary, marginTop: 4 }]}>{subtitle}</Text>}
            </View>
            <Pressable style={[styles.closeBtn, { backgroundColor: c.bgTertiary }]} onPress={onClose}>
              <X size={18} color={c.textTertiary} />
            </Pressable>
          </View>
          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  overlayPress: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modal: { borderWidth: 1, borderRadius: radius['2xl'], overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.xl, paddingBottom: 0 },
  closeBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl },
});
