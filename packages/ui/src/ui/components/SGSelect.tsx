import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal, StyleSheet, ViewStyle, Platform, Dimensions } from 'react-native';
import { ChevronDown, Check, Search, X } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

export type SelectOption = { label: string; value: string; description?: string };

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function SGSelect({
  options, value, onChange, placeholder = 'Chọn...', label, error,
  searchable, disabled, style,
}: Props) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = options.find(o => o.value === value);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q));
  }, [options, search]);

  const borderColor = error ? c.danger : open ? c.borderFocus : c.border;
  const w = Math.min(Dimensions.get('window').width * 0.92, 480);

  return (
    <View style={[styles.wrap, style]}>
      {label && <Text style={[typography.label, { color: c.textSecondary, marginBottom: 8 }]}>{label}</Text>}

      <Pressable
        style={[styles.trigger, { backgroundColor: c.bgInput, borderColor, opacity: disabled ? 0.5 : 1 },
          Platform.OS === 'web' && (sgds.transition.fast as any)]}
        onPress={() => !disabled && setOpen(true)} disabled={disabled}
      >
        <Text style={[typography.body, { flex: 1, color: selected ? c.text : c.textTertiary }]} numberOfLines={1}>
          {selected?.label || placeholder}
        </Text>
        <ChevronDown size={18} color={c.textTertiary} />
      </Pressable>

      {error && <Text style={[typography.caption, { color: c.danger, marginTop: 4 }]}>{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: c.bgOverlay }, Platform.OS === 'web' && (sgds.glass as any)]}
          onPress={() => { setOpen(false); setSearch(''); }} />
        <View style={styles.center}>
          <View style={[styles.dropdown, { width: w, backgroundColor: c.bgSecondary, borderColor: c.border },
            Platform.OS === 'web' && ({ backdropFilter: 'blur(40px)', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' } as any)]}>

            {searchable && (
              <View style={[styles.searchRow, { borderBottomColor: c.divider }]}>
                <Search size={16} color={c.textTertiary} />
                <TextInput style={[styles.searchInput, { color: c.text }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  placeholder="Tìm kiếm..." placeholderTextColor={c.textTertiary}
                  value={search} onChangeText={setSearch} autoFocus />
                {search.length > 0 && <Pressable onPress={() => setSearch('')}><X size={16} color={c.textTertiary} /></Pressable>}
              </View>
            )}

            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {filtered.length === 0 ? (
                <View style={styles.empty}><Text style={[typography.body, { color: c.textTertiary }]}>Không tìm thấy</Text></View>
              ) : filtered.map(opt => {
                const sel = opt.value === value;
                return (
                  <Pressable key={opt.value}
                    style={({ hovered }: any) => [styles.option,
                      sel && { backgroundColor: `${c.brand}10` },
                      !sel && hovered && { backgroundColor: c.bgTertiary },
                      Platform.OS === 'web' && (sgds.transition.fast as any)]}
                    onPress={() => { onChange(opt.value); setOpen(false); setSearch(''); }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.body, { color: sel ? c.brand : c.text, fontWeight: sel ? '700' : '400' }]}>{opt.label}</Text>
                      {opt.description && <Text style={[typography.caption, { color: c.textTertiary, marginTop: 2 }]}>{opt.description}</Text>}
                    </View>
                    {sel && <Check size={16} color={c.brand} strokeWidth={3} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.base },
  trigger: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, height: 48, paddingHorizontal: spacing.base, gap: 10 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dropdown: { borderWidth: 1, borderRadius: radius.xl, overflow: 'hidden', maxHeight: '70%' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.base, paddingVertical: 14, borderBottomWidth: 1 },
  searchInput: { flex: 1, ...typography.body, paddingVertical: 0 },
  list: { maxHeight: 360 },
  empty: { padding: 32, alignItems: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 12 },
});
