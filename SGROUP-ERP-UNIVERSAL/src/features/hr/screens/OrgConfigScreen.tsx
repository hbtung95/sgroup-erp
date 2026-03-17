/**
 * OrgConfigScreen — Department & Position Configuration
 * CRUD management for departments and positions used across the HR module
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { Building, Briefcase, Plus, Pencil, Trash2, X, Users, Hash } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard } from '../../../shared/ui/components';
import type { HRRole } from '../HRSidebar';
import {
  useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment,
  usePositions, useCreatePosition, useUpdatePosition,
} from '../hooks/useHR';

type ModalMode = 'create_dept' | 'edit_dept' | 'create_pos' | 'edit_pos' | null;

const EMPTY_DEPT = { name: '', code: '', description: '' };
const EMPTY_POS = { name: '', code: '', level: '', description: '' };

const LEVEL_OPTIONS = ['Staff', 'Senior', 'Leader', 'Manager', 'Director'];

export function OrgConfigScreen({ userRole }: { userRole?: HRRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cBg = isDark ? theme.colors.background : theme.colors.backgroundAlt;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editId, setEditId] = useState('');
  const [deptForm, setDeptForm] = useState(EMPTY_DEPT);
  const [posForm, setPosForm] = useState(EMPTY_POS);

  // Data
  const { data: rawDepts, isLoading: loadingDepts } = useDepartments();
  const { data: rawPos, isLoading: loadingPos } = usePositions();
  const departments = Array.isArray(rawDepts) ? rawDepts : (rawDepts as any)?.data ?? [];
  const positions = Array.isArray(rawPos) ? rawPos : (rawPos as any)?.data ?? [];

  // Mutations
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();
  const createPos = useCreatePosition();
  const updatePos = useUpdatePosition();

  const inputStyle: any = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, color: cText,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  };

  const showAlert = (msg: string) => {
    Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thông báo', msg);
  };

  // Department handlers
  const handleDeptSubmit = async () => {
    if (!deptForm.name.trim() || !deptForm.code.trim()) { showAlert('Vui lòng nhập tên và mã phòng ban'); return; }
    try {
      if (modalMode === 'edit_dept') {
        await updateDept.mutateAsync({ id: editId, data: deptForm });
      } else {
        await createDept.mutateAsync(deptForm);
      }
      setDeptForm(EMPTY_DEPT);
      setModalMode(null);
    } catch (e: any) {
      showAlert(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteDept = async (id: string, name: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Xóa phòng ban "${name}"?`)) return;
    }
    try {
      await deleteDept.mutateAsync(id);
    } catch (e: any) {
      showAlert(e?.response?.data?.message || e?.message || 'Không thể xóa');
    }
  };

  // Position handlers
  const handlePosSubmit = async () => {
    if (!posForm.name.trim() || !posForm.code.trim()) { showAlert('Vui lòng nhập tên và mã chức vụ'); return; }
    try {
      if (modalMode === 'edit_pos') {
        await updatePos.mutateAsync({ id: editId, data: posForm });
      } else {
        await createPos.mutateAsync(posForm);
      }
      setPosForm(EMPTY_POS);
      setModalMode(null);
    } catch (e: any) {
      showAlert(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra');
    }
  };

  const isPending = createDept.isPending || updateDept.isPending || createPos.isPending || updatePos.isPending;

  const isDeptModal = modalMode === 'create_dept' || modalMode === 'edit_dept';
  const isPosModal = modalMode === 'create_pos' || modalMode === 'edit_pos';
  const isEdit = modalMode === 'edit_dept' || modalMode === 'edit_pos';

  return (
    <View style={{ flex: 1, backgroundColor: cBg }}>
      {/* ── Modal ── */}
      <Modal visible={!!modalMode} transparent animationType="fade" onRequestClose={() => setModalMode(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalMode(null)}>
          <Pressable style={{ width: '90%', maxWidth: 480, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 24, padding: 28, ...(Platform.OS === 'web' ? { boxShadow: '0 25px 50px rgba(0,0,0,0.25)' } : {}) }} onPress={() => {}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>
                {isDeptModal ? (isEdit ? 'Sửa phòng ban' : 'Thêm phòng ban') : (isEdit ? 'Sửa chức vụ' : 'Thêm chức vụ')}
              </Text>
              <Pressable onPress={() => setModalMode(null)} style={{ padding: 4 }}><X size={22} color={cSub} /></Pressable>
            </View>

            {isDeptModal && (
              <View style={{ gap: 14 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên phòng ban *</Text>
                  <TextInput value={deptForm.name} onChangeText={v => setDeptForm(f => ({ ...f, name: v }))} placeholder="Phòng Kinh doanh" placeholderTextColor={cSub} style={inputStyle} />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mã phòng ban *</Text>
                  <TextInput value={deptForm.code} onChangeText={v => setDeptForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="SALES" placeholderTextColor={cSub} style={inputStyle} autoCapitalize="characters" />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mô tả</Text>
                  <TextInput value={deptForm.description} onChangeText={v => setDeptForm(f => ({ ...f, description: v }))} placeholder="Mô tả ngắn về phòng ban" placeholderTextColor={cSub} style={[inputStyle, { minHeight: 60 }]} multiline />
                </View>
              </View>
            )}

            {isPosModal && (
              <View style={{ gap: 14 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên chức vụ *</Text>
                  <TextInput value={posForm.name} onChangeText={v => setPosForm(f => ({ ...f, name: v }))} placeholder="Trưởng phòng" placeholderTextColor={cSub} style={inputStyle} />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mã chức vụ *</Text>
                  <TextInput value={posForm.code} onChangeText={v => setPosForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="MGR" placeholderTextColor={cSub} style={inputStyle} autoCapitalize="characters" />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Cấp bậc</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {LEVEL_OPTIONS.map(l => (
                      <Pressable key={l} onPress={() => setPosForm(f => ({ ...f, level: f.level === l ? '' : l }))} style={{
                        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                        backgroundColor: posForm.level === l ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                        borderWidth: 1, borderColor: posForm.level === l ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: posForm.level === l ? '#fff' : cText }}>{l}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mô tả</Text>
                  <TextInput value={posForm.description} onChangeText={v => setPosForm(f => ({ ...f, description: v }))} placeholder="Mô tả chức vụ" placeholderTextColor={cSub} style={[inputStyle, { minHeight: 60 }]} multiline />
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <Pressable onPress={() => setModalMode(null)} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: cSub }}>Hủy</Text>
              </Pressable>
              <Pressable onPress={isDeptModal ? handleDeptSubmit : handlePosSubmit} disabled={isPending} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: isPending ? '#94a3b8' : (isDeptModal ? '#ec4899' : '#8b5cf6') }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{isPending ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 28, gap: 28, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={24} color="#8b5cf6" />
          </View>
          <View>
            <Text style={{ ...sgds.typo.h2, color: cText, letterSpacing: -0.5 }}>Cấu hình Tổ chức</Text>
            <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Quản lý phòng ban & chức vụ</Text>
          </View>
        </View>

        {/* ═══ DEPARTMENTS ═══ */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#ec489915', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={16} color="#ec4899" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>Phòng ban</Text>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#ec489915' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#ec4899' }}>{departments.length}</Text>
              </View>
            </View>
            <Pressable onPress={() => { setDeptForm(EMPTY_DEPT); setModalMode('create_dept'); }} style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: '#ec4899', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Plus size={14} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>THÊM</Text>
            </Pressable>
          </View>

          {loadingDepts ? (
            <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#ec4899" /></View>
          ) : departments.length === 0 ? (
            <SGCard variant="glass" style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🏢</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: cSub }}>Chưa có phòng ban nào</Text>
            </SGCard>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              {departments.map((d: any) => (
                <View key={d.id} style={{
                  flex: 1, minWidth: 280, maxWidth: 400, padding: 20, borderRadius: 20,
                  backgroundColor: cardBg, borderWidth: 1, borderColor,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{d.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Hash size={11} color={cSub} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{d.code}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable onPress={() => { setEditId(d.id); setDeptForm({ name: d.name, code: d.code, description: d.description || '' }); setModalMode('edit_dept'); }}
                        style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={14} color={cSub} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteDept(d.id, d.name)}
                        style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#ef444410', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={14} color="#ef4444" />
                      </Pressable>
                    </View>
                  </View>
                  {d.description ? <Text style={{ fontSize: 12, fontWeight: '600', color: cSub, marginBottom: 10 }}>{d.description}</Text> : null}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: borderColor }}>
                    <Users size={14} color="#ec4899" />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{d._count?.employees ?? 0} nhân viên</Text>
                    {d.manager?.fullName ? <Text style={{ fontSize: 12, color: cSub, marginLeft: 'auto' }}>TP: {d.manager.fullName}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ═══ POSITIONS ═══ */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#8b5cf615', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={16} color="#8b5cf6" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>Chức vụ</Text>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#8b5cf615' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#8b5cf6' }}>{positions.length}</Text>
              </View>
            </View>
            <Pressable onPress={() => { setPosForm(EMPTY_POS); setModalMode('create_pos'); }} style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: '#8b5cf6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Plus size={14} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>THÊM</Text>
            </Pressable>
          </View>

          {loadingPos ? (
            <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#8b5cf6" /></View>
          ) : positions.length === 0 ? (
            <SGCard variant="glass" style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💼</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: cSub }}>Chưa có chức vụ nào</Text>
            </SGCard>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              {positions.map((p: any) => {
                const levelColors: Record<string, string> = { Staff: '#22c55e', Senior: '#3b82f6', Leader: '#8b5cf6', Manager: '#f59e0b', Director: '#ef4444' };
                const lc = levelColors[p.level] || '#64748b';
                return (
                  <View key={p.id} style={{
                    flex: 1, minWidth: 250, maxWidth: 360, padding: 20, borderRadius: 20,
                    backgroundColor: cardBg, borderWidth: 1, borderColor,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{p.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Hash size={11} color={cSub} />
                            <Text style={{ fontSize: 11, fontWeight: '700', color: cSub }}>{p.code}</Text>
                          </View>
                          {p.level ? (
                            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: `${lc}15` }}>
                              <Text style={{ fontSize: 10, fontWeight: '800', color: lc }}>{p.level}</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      <Pressable onPress={() => { setEditId(p.id); setPosForm({ name: p.name, code: p.code, level: p.level || '', description: p.description || '' }); setModalMode('edit_pos'); }}
                        style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={14} color={cSub} />
                      </Pressable>
                    </View>
                    {p.description ? <Text style={{ fontSize: 12, fontWeight: '600', color: cSub, marginTop: 8 }}>{p.description}</Text> : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: borderColor }}>
                      <Users size={14} color="#8b5cf6" />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{p._count?.employees ?? 0} nhân viên</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
