/**
 * CommandPalette — Ctrl+K spotlight-style search
 * Unified search across users, settings, flags, audit
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInUp } from 'react-native-reanimated';
import {
  Search, X, Users, Settings, Flag, FileText, ArrowRight, Command,
} from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { typography, spacing } from '@sgroup/ui/src/theme/theme';
import { useCommandSearch } from '../hooks/useAdmin';

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  user:    { icon: Users,    color: '#3b82f6', label: 'User' },
  setting: { icon: Settings, color: '#10b981', label: 'Setting' },
  flag:    { icon: Flag,     color: '#f59e0b', label: 'Flag' },
  audit:   { icon: FileText, color: '#8b5cf6', label: 'Audit' },
};

export function CommandPalette() {
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const { data, isLoading } = useCommandSearch(query);
  const results = data?.results ?? [];

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setVisible(v => !v);
      }
      if (e.key === 'Escape' && visible) {
        setVisible(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible]);

  useEffect(() => {
    if (visible) setTimeout(() => inputRef.current?.focus(), 100);
  }, [visible]);

  const close = () => { setVisible(false); setQuery(''); };

  if (Platform.OS !== 'web') return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Animated.View entering={SlideInUp.duration(200).springify()} style={styles.wrapper}>
          <Pressable style={[styles.palette, { backgroundColor: colors.bgCard, borderColor: colors.border }]} onPress={() => {}}>
            {/* Search Input */}
            <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
              <Search size={20} color={colors.accent} />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                placeholder="Tìm user, cài đặt, feature flag, audit log..."
                placeholderTextColor={colors.textDisabled}
                style={[styles.input, { color: colors.text }]}
                autoFocus
              />
              <View style={[styles.shortcutBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <Text style={[typography.micro, { color: colors.textDisabled }]}>ESC</Text>
              </View>
            </View>

            {/* Results */}
            <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
              {query.length < 2 ? (
                <View style={styles.hint}>
                  <Command size={28} color={colors.textDisabled} strokeWidth={1} />
                  <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 8 }]}>
                    Nhập ít nhất 2 ký tự để tìm kiếm
                  </Text>
                  <Text style={[typography.micro, { color: colors.textDisabled, marginTop: 4 }]}>
                    Tìm trong: Users • Settings • Feature Flags • Audit Logs
                  </Text>
                </View>
              ) : isLoading ? (
                <View style={styles.hint}>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>Đang tìm...</Text>
                </View>
              ) : results.length === 0 ? (
                <View style={styles.hint}>
                  <Text style={[typography.caption, { color: colors.textTertiary }]}>
                    Không tìm thấy kết quả cho "{query}"
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[typography.micro, { color: colors.textDisabled, padding: 12, paddingBottom: 4 }]}>
                    {results.length} KẾT QUẢ
                  </Text>
                  {results.map((item: any, i: number) => {
                    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.audit;
                    const IconComp = config.icon;
                    return (
                      <Animated.View key={`${item.type}-${item.id}`} entering={FadeInDown.delay(i * 25).duration(150)}>
                        <Pressable
                          style={({ hovered }: any) => [
                            styles.resultRow,
                            { borderBottomColor: `${colors.border}80` },
                            hovered && { backgroundColor: `${colors.accent}08` },
                          ]}
                        >
                          <View style={[styles.typeIcon, { backgroundColor: `${config.color}12` }]}>
                            <IconComp size={14} color={config.color} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[typography.smallBold, { color: colors.text }]} numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Text style={[typography.micro, { color: colors.textTertiary }]} numberOfLines={1}>
                              {item.subtitle}
                            </Text>
                          </View>
                          <View style={[styles.typeBadge, { backgroundColor: `${config.color}10` }]}>
                            <Text style={[typography.micro, { color: config.color, fontWeight: '700' }]}>{config.label}</Text>
                          </View>
                          {item.meta && (
                            <Text style={[typography.micro, { color: colors.textDisabled }]}>{item.meta}</Text>
                          )}
                          <ArrowRight size={12} color={colors.textDisabled} />
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <View style={styles.footerKeys}>
                <View style={[styles.keyBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[typography.micro, { color: colors.textDisabled }]}>↑↓</Text>
                </View>
                <Text style={[typography.micro, { color: colors.textDisabled }]}>Di chuyển</Text>
                <View style={[styles.keyBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[typography.micro, { color: colors.textDisabled }]}>↵</Text>
                </View>
                <Text style={[typography.micro, { color: colors.textDisabled }]}>Chọn</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 100, alignItems: 'center' },
  wrapper: { width: '100%', maxWidth: 640, alignItems: 'center' },
  palette: {
    width: '100%', borderRadius: 20, borderWidth: 1, overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 25px 60px rgba(0,0,0,0.3)' } : {}),
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1 },
  input: { flex: 1, fontSize: 16, padding: 0, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}) },
  shortcutBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  results: { maxHeight: 360 },
  hint: { alignItems: 'center', padding: 40 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 1 },
  typeIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  footer: { flexDirection: 'row', justifyContent: 'center', padding: 10, borderTopWidth: 1 },
  footerKeys: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keyBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
});
