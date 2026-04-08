/**
 * KeyboardShortcutsPanel — Press '?' to show shortcut overlay
 * Web-only — registers global keyboard listener
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { Keyboard, X, Search, Command } from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { typography, spacing, sgds } from '@sgroup/ui/src/theme/theme';

interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { keys: ['?'], description: 'Hiện bảng phím tắt', category: 'Chung' },
  { keys: ['Esc'], description: 'Đóng modal / panel', category: 'Chung' },
  // Admin
  { keys: ['Ctrl', 'K'], description: 'Tìm kiếm nhanh', category: 'Tìm kiếm' },
  { keys: ['Ctrl', 'Shift', 'F'], description: 'Tìm kiếm toàn hệ thống', category: 'Tìm kiếm' },
  // Actions
  { keys: ['Ctrl', 'N'], description: 'Tạo mới (trong context hiện tại)', category: 'Hành động' },
  { keys: ['Ctrl', 'S'], description: 'Lưu thay đổi', category: 'Hành động' },
  { keys: ['Ctrl', 'Z'], description: 'Hoàn tác', category: 'Hành động' },
  { keys: ['Ctrl', 'Enter'], description: 'Xác nhận / Submit form', category: 'Hành động' },
  { keys: ['Del'], description: 'Xóa item đã chọn', category: 'Hành động' },
  // Navigation
  { keys: ['Alt', '1'], description: 'Tổng quan (Dashboard)', category: 'Điều hướng' },
  { keys: ['Alt', '2'], description: 'Quản lý User', category: 'Điều hướng' },
  { keys: ['Alt', '3'], description: 'Cài đặt hệ thống', category: 'Điều hướng' },
  { keys: ['Alt', '4'], description: 'Nhật ký hệ thống', category: 'Điều hướng' },
  // Table
  { keys: ['↑', '↓'], description: 'Di chuyển trong danh sách', category: 'Bảng dữ liệu' },
  { keys: ['Space'], description: 'Chọn / bỏ chọn item', category: 'Bảng dữ liệu' },
  { keys: ['Ctrl', 'A'], description: 'Chọn tất cả', category: 'Bảng dữ liệu' },
  { keys: ['Enter'], description: 'Mở chi tiết item', category: 'Bảng dữ liệu' },
];

export function KeyboardShortcutsPanel() {
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (e: any) => {
      // '?' key (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') return;
        e.preventDefault();
        setVisible(v => !v);
      }
      // Escape to close
      if (e.key === 'Escape' && visible) {
        setVisible(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible]);

  if (Platform.OS !== 'web') return null;

  // Group shortcuts by category
  const grouped: Record<string, ShortcutItem[]> = {};
  SHORTCUTS.forEach(s => {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
        <Animated.View entering={SlideInDown.duration(300).springify()}>
          <Pressable
            style={[styles.panel, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.headerLeft}>
                <View style={[styles.iconBox, { backgroundColor: `${colors.accent}12` }]}>
                  <Keyboard size={18} color={colors.accent} />
                </View>
                <View>
                  <Text style={[typography.h4, { color: colors.text }]}>Phím tắt</Text>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    Nhấn <Text style={{ fontWeight: '800' }}>?</Text> để bật/tắt
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => setVisible(false)} style={[styles.closeBtn, { backgroundColor: `${colors.danger}12` }]}>
                <X size={16} color={colors.danger} />
              </Pressable>
            </View>

            {/* Shortcut Categories */}
            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              {Object.entries(grouped).map(([category, items], ci) => (
                <Animated.View key={category} entering={FadeIn.delay(ci * 50).duration(200)}>
                  <Text style={[typography.label, { color: colors.accent, marginBottom: 8, marginTop: ci > 0 ? 16 : 0 }]}>
                    {category.toUpperCase()}
                  </Text>
                  {items.map((shortcut, si) => (
                    <View
                      key={si}
                      style={[styles.shortcutRow, {
                        borderBottomWidth: si < items.length - 1 ? 1 : 0,
                        borderBottomColor: `${colors.border}80`,
                      }]}
                    >
                      <View style={styles.keysRow}>
                        {shortcut.keys.map((key, ki) => (
                          <React.Fragment key={ki}>
                            {ki > 0 && <Text style={[typography.micro, { color: colors.textDisabled }]}>+</Text>}
                            <View style={[styles.keyBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                              <Text style={[typography.smallBold, { color: colors.text, fontSize: 11 }]}>{key}</Text>
                            </View>
                          </React.Fragment>
                        ))}
                      </View>
                      <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}>
                        {shortcut.description}
                      </Text>
                    </View>
                  ))}
                </Animated.View>
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text style={[typography.micro, { color: colors.textDisabled }]}>
                💡 Phím tắt chỉ hoạt động khi không đang gõ trong ô nhập liệu
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  panel: {
    width: 560, maxHeight: 600, borderRadius: 20, borderWidth: 1, overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 20px 60px rgba(0,0,0,0.25)' } : {}),
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, maxHeight: 440 },
  shortcutRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
  keysRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 120 },
  keyBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1,
    ...(Platform.OS === 'web' ? { boxShadow: '0 1px 2px rgba(0,0,0,0.1)' } : {}),
  },
  footer: { padding: 14, borderTopWidth: 1, alignItems: 'center' },
});
