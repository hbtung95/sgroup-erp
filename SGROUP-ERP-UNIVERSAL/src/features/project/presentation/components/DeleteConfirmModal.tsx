import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { typography, sgds } from '../../../shared/theme/theme';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { SGButton } from '../../../shared/ui/components';
import { AlertTriangle, X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  visible, onClose, onConfirm, title = 'XÃ¡c nháº­n XÃ³a', message, confirmLabel = 'XÃ³a', isLoading = false,
}: Props) {
  const { colors, theme, isDark } = useAppTheme();

  const content = (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)', ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } : {}) } as any]}>
      <View style={[styles.modal, {
        backgroundColor: isDark ? colors.bgElevated : '#fff',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        ...(Platform.OS === 'web' ? sgds.glass : {}),
      } as any]}>
        <View style={styles.body}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2' }]}>
            <AlertTriangle size={32} color={colors.danger} />
          </View>
          <Text style={[typography.h3, { color: colors.text, marginTop: 20, textAlign: 'center' }]}>{title}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12, textAlign: 'center', lineHeight: 22 }]}>{message}</Text>
        </View>

        <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }]}>
          <SGButton title="Há»§y" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 12 }} />
          <TouchableOpacity
            onPress={onConfirm}
            disabled={isLoading}
            style={[styles.deleteBtn, { opacity: isLoading ? 0.6 : 1 }]}
          >
            <Text style={styles.deleteBtnText}>{isLoading ? 'Äang xÃ³a...' : confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    if (!visible) return null;
    return content;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center', zIndex: 10000,
    ...(Platform.OS === 'web' ? { position: 'fixed' } as any : {}),
  },
  modal: {
    width: '90%', maxWidth: 420,
    borderRadius: 20, borderWidth: 1, overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 24px 80px rgba(0,0,0,0.3)' } as any : { elevation: 20 }),
  },
  body: {
    padding: 32,
    alignItems: 'center',
  },
  iconBox: {
    width: 64, height: 64, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#EF4444', // matches colors.danger
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
});
