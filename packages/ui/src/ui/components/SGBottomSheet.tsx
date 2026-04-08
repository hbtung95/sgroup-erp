import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, Animated, StyleSheet, Platform, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: number | string;
}

export function SGBottomSheet({ visible, onClose, title, children, maxHeight = '80%' }: Props) {
  const c = useTheme();
  const slideY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, friction: 10, tension: 60, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else { slideY.setValue(Dimensions.get('window').height); fade.setValue(0); }
  }, [visible]);

  const close = () => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: Dimensions.get('window').height, duration: 250, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(onClose);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <Animated.View style={[styles.overlay, { backgroundColor: c.bgOverlay, opacity: fade },
        Platform.OS === 'web' && (sgds.glass as any)]}>
        <Pressable style={{ flex: 1 }} onPress={close} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { maxHeight: maxHeight as any, backgroundColor: c.bgSecondary, borderColor: c.border,
        transform: [{ translateY: slideY }] },
        Platform.OS === 'web' && ({ ...sgds.glass, boxShadow: '0 -10px 60px rgba(0,0,0,0.3)' } as any)]}>
        <View style={styles.handle}><View style={[styles.handleBar, { backgroundColor: c.textTertiary }]} /></View>
        {title && (
          <View style={[styles.header, { borderBottomColor: c.divider }]}>
            <Text style={[typography.h3, { color: c.text }]}>{title}</Text>
            <Pressable style={[styles.closeBtn, { backgroundColor: c.bgTertiary }]} onPress={close}>
              <X size={20} color={c.textTertiary} />
            </Pressable>
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderBottomWidth: 0, overflow: 'hidden' },
  handle: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handleBar: { width: 40, height: 4, borderRadius: 2, opacity: 0.3 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.base, borderBottomWidth: 1 },
  closeBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl },
});
