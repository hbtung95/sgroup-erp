/**
 * BatchImportModal — CSV batch import users
 * Upload CSV → preview rows → confirm import
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal, ScrollView, TextInput } from 'react-native';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../../shared/theme/theme';
import { SGButton } from '../../../../shared/ui/components/SGButton';
import { useBatchImportUsers } from '../../hooks/useAdmin';
import { showToast } from '../../utils/adminUtils';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SAMPLE_CSV = `email,name,role,department
user1@sgroup.vn,Nguyễn Văn A,employee,SALES
user2@sgroup.vn,Trần Thị B,hr,HR
user3@sgroup.vn,Lê Văn C,sales,SALES`;

export function BatchImportModal({ visible, onClose }: Props) {
  const { colors } = useAppTheme();
  const [csvContent, setCsvContent] = useState('');
  const [result, setResult] = useState<any>(null);
  const importMut = useBatchImportUsers();

  const handleImport = async () => {
    if (!csvContent.trim()) return showToast('Vui lòng nhập nội dung CSV', 'warning');
    try {
      const res = await importMut.mutateAsync(csvContent);
      setResult(res);
      showToast(`Import hoàn tất: ${res.created} tạo, ${res.skipped} bỏ qua`, 'success');
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Lỗi import', 'error');
    }
  };

  const handleClose = () => {
    setCsvContent('');
    setResult(null);
    onClose();
  };

  // Preview parsed data
  const previewRows = csvContent.trim() ? csvContent.trim().split('\n').slice(0, 6) : [];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={[styles.content, { backgroundColor: colors.bgCard }]} onPress={() => {}}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Upload size={20} color={colors.accent} />
              <Text style={[typography.h4, { color: colors.text }]}>Import Users (CSV)</Text>
            </View>
            <Pressable onPress={handleClose} style={[styles.closeBtn, { backgroundColor: `${colors.danger}15` }]}>
              <X size={18} color={colors.danger} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {!result ? (
              <>
                {/* Instructions */}
                <View style={[styles.infoBox, { backgroundColor: `${colors.accent}08`, borderColor: `${colors.accent}20` }]}>
                  <FileText size={14} color={colors.accent} />
                  <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}>
                    CSV phải có cột <Text style={{ fontWeight: '800' }}>email</Text> và <Text style={{ fontWeight: '800' }}>name</Text>.
                    Cột tùy chọn: role, department. Mật khẩu mặc định: <Text style={{ fontFamily: 'monospace', fontWeight: '800' }}>Sgroup@2024!</Text>
                  </Text>
                </View>

                {/* Sample */}
                <Text style={[typography.label, { color: colors.textTertiary, marginTop: 12 }]}>MẪU CSV</Text>
                <Pressable
                  onPress={() => setCsvContent(SAMPLE_CSV)}
                  style={[styles.sampleBox, { backgroundColor: colors.bg, borderColor: colors.border }]}
                >
                  <Text style={[typography.caption, { color: colors.textDisabled, fontFamily: 'monospace', lineHeight: 18 }]}>
                    {SAMPLE_CSV}
                  </Text>
                  <Text style={[typography.micro, { color: colors.accent, textAlign: 'center', marginTop: 6 }]}>Nhấn để sử dụng mẫu này</Text>
                </Pressable>

                {/* Input area */}
                <Text style={[typography.label, { color: colors.textTertiary, marginTop: 16 }]}>NỘI DUNG CSV</Text>
                <TextInput
                  value={csvContent}
                  onChangeText={setCsvContent}
                  multiline
                  numberOfLines={8}
                  placeholder="Dán nội dung CSV tại đây..."
                  placeholderTextColor={colors.textDisabled}
                  style={[styles.textarea, {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.bg,
                  }]}
                />

                {/* Preview */}
                {previewRows.length > 1 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[typography.label, { color: colors.textTertiary }]}>
                      XEM TRƯỚC ({previewRows.length - 1} dòng)
                    </Text>
                    <View style={[styles.previewTable, { borderColor: colors.border }]}>
                      {previewRows.map((row, i) => (
                        <View key={i} style={[styles.previewRow, {
                          backgroundColor: i === 0 ? `${colors.accent}08` : 'transparent',
                          borderBottomWidth: i < previewRows.length - 1 ? 1 : 0,
                          borderBottomColor: colors.border,
                        }]}>
                          <Text
                            style={[i === 0 ? typography.label : typography.caption, {
                              color: i === 0 ? colors.accent : colors.textSecondary,
                              fontFamily: 'monospace',
                            }]}
                            numberOfLines={1}
                          >
                            {row}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <SGButton
                  title={`Import ${Math.max(previewRows.length - 1, 0)} users`}
                  onPress={handleImport}
                  loading={importMut.isPending}
                  icon={<Upload size={16} color="#fff" />}
                  disabled={previewRows.length <= 1}
                  style={{ marginTop: 20 }}
                />
              </>
            ) : (
              /* Results */
              <>
                <View style={styles.resultGrid}>
                  <ResultCard label="Tạo thành công" value={result.created} color={colors.success} icon={<CheckCircle size={18} color={colors.success} />} />
                  <ResultCard label="Bỏ qua" value={result.skipped} color={colors.warning} icon={<AlertCircle size={18} color={colors.warning} />} />
                  <ResultCard label="Tổng" value={result.total} color={colors.accent} icon={<FileText size={18} color={colors.accent} />} />
                </View>

                {result.defaultPassword && (
                  <View style={[styles.infoBox, { backgroundColor: `${colors.warning}08`, borderColor: `${colors.warning}20`, marginTop: 12 }]}>
                    <Text style={[typography.caption, { color: colors.warning }]}>
                      ⚠️ Mật khẩu mặc định: <Text style={{ fontWeight: '800', fontFamily: 'monospace' }}>{result.defaultPassword}</Text>
                    </Text>
                  </View>
                )}

                {result.errors?.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[typography.label, { color: colors.danger }]}>LỖI</Text>
                    {result.errors.map((e: string, i: number) => (
                      <Text key={i} style={[typography.caption, { color: colors.danger, marginTop: 4 }]}>• {e}</Text>
                    ))}
                  </View>
                )}

                <SGButton title="Đóng" variant="secondary" onPress={handleClose} style={{ marginTop: 20 }} />
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ResultCard({ label, value, color, icon }: any) {
  return (
    <View style={[styles.resultItem, { borderColor: `${color}20` }]}>
      {icon}
      <Text style={[typography.h3, { color }]}>{value}</Text>
      <Text style={[typography.caption, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { width: '90%', maxWidth: 600, maxHeight: '90%', borderRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  closeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingBottom: 20 },
  infoBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'flex-start' },
  sampleBox: { padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 6 },
  textarea: {
    borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 13,
    fontFamily: 'monospace', textAlignVertical: 'top', minHeight: 120, marginTop: 6,
  },
  previewTable: { borderWidth: 1, borderRadius: 10, overflow: 'hidden', marginTop: 6 },
  previewRow: { padding: 8, paddingHorizontal: 12 },
  resultGrid: { flexDirection: 'row', gap: 12 },
  resultItem: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 4 },
});
