/**
 * OrgConfigScreen — Department-Centric Org Configuration
 * Hierarchy: Department → Teams → Positions
 * Full CRUD for departments, teams, and positions
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import {
  Building, Briefcase, Plus, Pencil, Trash2, X, Users, Hash,
  ChevronDown, ChevronRight, UsersRound,
} from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard } from '../../../shared/ui/components';
import type { HRRole } from '../HRSidebar';
import {
  useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment,
  usePositions, useCreatePosition, useUpdatePosition,
  useCreateTeam, useUpdateTeam, useDeleteTeam,
} from '../hooks/useHR';

type ModalMode = 'create_dept' | 'edit_dept' | 'create_team' | 'edit_team' | 'create_pos' | 'edit_pos' | null;

const EMPTY_DEPT = { name: '', code: '', description: '' };
const EMPTY_TEAM = { name: '', code: '', departmentId: '', description: '' };
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
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [deptForm, setDeptForm] = useState(EMPTY_DEPT);
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM);
  const [posForm, setPosForm] = useState(EMPTY_POS);

  // Data — departments include teams via backend
  const { data: rawDepts, isLoading: loadingDepts } = useDepartments();
  const { data: rawPos, isLoading: loadingPos } = usePositions();
  const departments = Array.isArray(rawDepts) ? rawDepts : (rawDepts as any)?.data ?? [];
  const positions = Array.isArray(rawPos) ? rawPos : (rawPos as any)?.data ?? [];

  // Mutations
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
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

  const isPending = createDept.isPending || updateDept.isPending || createTeam.isPending || updateTeam.isPending || createPos.isPending || updatePos.isPending;

  // ── Handlers ──
  const handleDeptSubmit = async () => {
    if (!deptForm.name.trim() || !deptForm.code.trim()) { showAlert('Vui lòng nhập tên và mã phòng ban'); return; }
    try {
      if (modalMode === 'edit_dept') await updateDept.mutateAsync({ id: editId, data: deptForm });
      else await createDept.mutateAsync(deptForm);
      setDeptForm(EMPTY_DEPT); setModalMode(null);
    } catch (e: any) { showAlert(e?.response?.data?.message || e?.message || 'Lỗi'); }
  };

  const handleTeamSubmit = async () => {
    if (!teamForm.name.trim() || !teamForm.code.trim()) { showAlert('Vui lòng nhập tên và mã team'); return; }
    try {
      if (modalMode === 'edit_team') await updateTeam.mutateAsync({ id: editId, data: { name: teamForm.name, code: teamForm.code, description: teamForm.description } });
      else await createTeam.mutateAsync(teamForm);
      setTeamForm(EMPTY_TEAM); setModalMode(null);
    } catch (e: any) { showAlert(e?.response?.data?.message || e?.message || 'Lỗi'); }
  };

  const handlePosSubmit = async () => {
    if (!posForm.name.trim() || !posForm.code.trim()) { showAlert('Vui lòng nhập tên và mã chức vụ'); return; }
    try {
      if (modalMode === 'edit_pos') await updatePos.mutateAsync({ id: editId, data: posForm });
      else await createPos.mutateAsync(posForm);
      setPosForm(EMPTY_POS); setModalMode(null);
    } catch (e: any) { showAlert(e?.response?.data?.message || e?.message || 'Lỗi'); }
  };

  const handleDeleteDept = async (id: string, name: string) => {
    if (Platform.OS === 'web' && !window.confirm(`Xóa phòng ban "${name}"? Tất cả team bên trong cũng sẽ bị xóa.`)) return;
    try { await deleteDept.mutateAsync(id); } catch (e: any) { showAlert(e?.response?.data?.message || 'Không thể xóa'); }
  };

  const handleDeleteTeam = async (id: string, name: string) => {
    if (Platform.OS === 'web' && !window.confirm(`Xóa team "${name}"?`)) return;
    try { await deleteTeam.mutateAsync(id); } catch (e: any) { showAlert(e?.response?.data?.message || 'Không thể xóa'); }
  };

  // ── Modal Content ──
  const getModalTitle = () => {
    switch (modalMode) {
      case 'create_dept': return 'Thêm phòng ban';
      case 'edit_dept': return 'Sửa phòng ban';
      case 'create_team': return 'Thêm team';
      case 'edit_team': return 'Sửa team';
      case 'create_pos': return 'Thêm chức vụ';
      case 'edit_pos': return 'Sửa chức vụ';
      default: return '';
    }
  };

  const getModalColor = () => {
    if (modalMode?.includes('dept')) return '#ec4899';
    if (modalMode?.includes('team')) return '#3b82f6';
    return '#8b5cf6';
  };

  const handleSubmit = () => {
    if (modalMode?.includes('dept')) return handleDeptSubmit();
    if (modalMode?.includes('team')) return handleTeamSubmit();
    return handlePosSubmit();
  };

  const isEdit = modalMode?.startsWith('edit');

  return (
    <View style={{ flex: 1, backgroundColor: cBg }}>
      {/* ── Modal ── */}
      <Modal visible={!!modalMode} transparent animationType="fade" onRequestClose={() => setModalMode(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalMode(null)}>
          <Pressable style={{ width: '90%', maxWidth: 480, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 24, padding: 28, ...(Platform.OS === 'web' ? { boxShadow: '0 25px 50px rgba(0,0,0,0.25)' } : {}) }} onPress={() => {}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>{getModalTitle()}</Text>
              <Pressable onPress={() => setModalMode(null)} style={{ padding: 4 }}><X size={22} color={cSub} /></Pressable>
            </View>

            {/* Department form */}
            {modalMode?.includes('dept') && (
              <View style={{ gap: 14 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Tên phòng ban *</Text>
                  <TextInput value={deptForm.name} onChangeText={v => setDeptForm(f => ({ ...f, name: v }))} placeholder="Phòng Kinh doanh" placeholderTextColor={cSub} style={inputStyle} />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Mã phòng ban *</Text>
                  <TextInput value={deptForm.code} onChangeText={v => setDeptForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="SALES" placeholderTextColor={cSub} style={inputStyle} autoCapitalize="characters" />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Mô tả</Text>
                  <TextInput value={deptForm.description} onChangeText={v => setDeptForm(f => ({ ...f, description: v }))} placeholder="Mô tả phòng ban" placeholderTextColor={cSub} style={[inputStyle, { minHeight: 60 }]} multiline />
                </View>
              </View>
            )}

            {/* Team form */}
            {modalMode?.includes('team') && (
              <View style={{ gap: 14 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Tên team *</Text>
                  <TextInput value={teamForm.name} onChangeText={v => setTeamForm(f => ({ ...f, name: v }))} placeholder="Team KD Online" placeholderTextColor={cSub} style={inputStyle} />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Mã team *</Text>
                  <TextInput value={teamForm.code} onChangeText={v => setTeamForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="KD-ONLINE" placeholderTextColor={cSub} style={inputStyle} autoCapitalize="characters" />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Mô tả</Text>
                  <TextInput value={teamForm.description} onChangeText={v => setTeamForm(f => ({ ...f, description: v }))} placeholder="Mô tả team" placeholderTextColor={cSub} style={[inputStyle, { minHeight: 60 }]} multiline />
                </View>
              </View>
            )}

            {/* Position form */}
            {modalMode?.includes('pos') && (
              <View style={{ gap: 14 }}>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Tên chức vụ *</Text>
                  <TextInput value={posForm.name} onChangeText={v => setPosForm(f => ({ ...f, name: v }))} placeholder="Trưởng phòng" placeholderTextColor={cSub} style={inputStyle} />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Mã chức vụ *</Text>
                  <TextInput value={posForm.code} onChangeText={v => setPosForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="MGR" placeholderTextColor={cSub} style={inputStyle} autoCapitalize="characters" />
                </View>
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Cấp bậc</Text>
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
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase' }}>Mô tả</Text>
                  <TextInput value={posForm.description} onChangeText={v => setPosForm(f => ({ ...f, description: v }))} placeholder="Mô tả chức vụ" placeholderTextColor={cSub} style={[inputStyle, { minHeight: 60 }]} multiline />
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <Pressable onPress={() => setModalMode(null)} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: cSub }}>Hủy</Text>
              </Pressable>
              <Pressable onPress={handleSubmit} disabled={isPending} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: isPending ? '#94a3b8' : getModalColor() }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{isPending ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mới')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Main Content ── */}
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={24} color="#8b5cf6" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Cấu hình Tổ chức</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Phòng ban → Teams → Chức vụ</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={() => { setPosForm(EMPTY_POS); setModalMode('create_pos'); }} style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: '#8b5cf6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Plus size={14} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>CHỨC VỤ</Text>
            </Pressable>
            <Pressable onPress={() => { setDeptForm(EMPTY_DEPT); setModalMode('create_dept'); }} style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: '#ec4899', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Plus size={14} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>PHÒNG BAN</Text>
            </Pressable>
          </View>
        </View>

        {/* ═══ Stats Overview ═══ */}
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'PHÒNG BAN', val: departments.length, icon: Building, color: '#ec4899' },
            { label: 'TEAMS', val: departments.reduce((s: number, d: any) => s + (d.teams?.length || 0), 0), icon: UsersRound, color: '#3b82f6' },
            { label: 'CHỨC VỤ', val: positions.length, icon: Briefcase, color: '#8b5cf6' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, minWidth: 180, padding: 20, borderRadius: 20, backgroundColor: cardBg, borderWidth: 1, borderColor }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={18} color={s.color} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: cSub }}>{s.label}</Text>
              </View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: cText }}>{s.val}</Text>
            </View>
          ))}
        </View>

        {/* ═══ DEPARTMENTS — Expandable Cards ═══ */}
        {loadingDepts ? (
          <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#ec4899" /></View>
        ) : departments.length === 0 ? (
          <SGCard variant="glass" style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🏢</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: cSub }}>Chưa có phòng ban nào. Bấm "+ PHÒNG BAN" để bắt đầu.</Text>
          </SGCard>
        ) : (
          <View style={{ gap: 14 }}>
            {departments.map((dept: any) => {
              const isExpanded = expandedDept === dept.id;
              const deptTeams = dept.teams || [];
              return (
                <View key={dept.id} style={{ borderRadius: 20, backgroundColor: cardBg, borderWidth: 1, borderColor, overflow: 'hidden' }}>
                  {/* Department Header — clickable to expand */}
                  <Pressable onPress={() => setExpandedDept(isExpanded ? null : dept.id)} style={{ padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#ec489915', alignItems: 'center', justifyContent: 'center' }}>
                      <Building size={20} color="#ec4899" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 17, fontWeight: '800', color: cText }}>{dept.name}</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: cSub }}>{dept.code}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>{dept._count?.employees ?? 0} nhân viên</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#3b82f6' }}>{deptTeams.length} teams</Text>
                        {dept.manager?.fullName && <Text style={{ fontSize: 12, fontWeight: '600', color: '#f59e0b' }}>TP: {dept.manager.fullName}</Text>}
                      </View>
                    </View>
                    {/* Action buttons */}
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Pressable onPress={() => { setEditId(dept.id); setDeptForm({ name: dept.name, code: dept.code, description: dept.description || '' }); setModalMode('edit_dept'); }}
                        style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={13} color={cSub} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteDept(dept.id, dept.name)}
                        style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#ef444410', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={13} color="#ef4444" />
                      </Pressable>
                    </View>
                    {isExpanded ? <ChevronDown size={18} color={cSub} /> : <ChevronRight size={18} color={cSub} />}
                  </Pressable>

                  {/* Expanded content — Teams + Positions */}
                  {isExpanded && (
                    <View style={{ borderTopWidth: 1, borderTopColor: borderColor }}>
                      {/* Teams Section */}
                      <View style={{ padding: 20, paddingTop: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <UsersRound size={15} color="#3b82f6" />
                            <Text style={{ fontSize: 13, fontWeight: '800', color: cText }}>Teams</Text>
                            <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: '#3b82f615' }}>
                              <Text style={{ fontSize: 10, fontWeight: '800', color: '#3b82f6' }}>{deptTeams.length}</Text>
                            </View>
                          </View>
                          <Pressable onPress={() => { setTeamForm({ ...EMPTY_TEAM, departmentId: dept.id }); setModalMode('create_team'); }} style={{
                            flexDirection: 'row', alignItems: 'center', gap: 4,
                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                            backgroundColor: '#3b82f6', ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
                          }}>
                            <Plus size={12} color="#fff" />
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>THÊM TEAM</Text>
                          </Pressable>
                        </View>

                        {deptTeams.length === 0 ? (
                          <View style={{ padding: 16, borderRadius: 14, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fafbfd', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>Chưa có team nào trong phòng ban này</Text>
                          </View>
                        ) : (
                          <View style={{ gap: 8 }}>
                            {deptTeams.map((t: any) => (
                              <View key={t.id} style={{
                                flexDirection: 'row', alignItems: 'center', gap: 12,
                                padding: 14, borderRadius: 14, backgroundColor: isDark ? 'rgba(59,130,246,0.06)' : '#eff6ff',
                                borderWidth: 1, borderColor: isDark ? 'rgba(59,130,246,0.12)' : '#dbeafe',
                              }}>
                                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#3b82f615', alignItems: 'center', justifyContent: 'center' }}>
                                  <UsersRound size={14} color="#3b82f6" />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{t.name}</Text>
                                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>#{t.code}</Text>
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#3b82f6' }}>{t._count?.employees ?? 0} thành viên</Text>
                                  </View>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 6 }}>
                                  <Pressable onPress={() => { setEditId(t.id); setTeamForm({ name: t.name, code: t.code, departmentId: dept.id, description: t.description || '' }); setModalMode('edit_team'); }}
                                    style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#fff', alignItems: 'center', justifyContent: 'center' }}>
                                    <Pencil size={12} color={cSub} />
                                  </Pressable>
                                  <Pressable onPress={() => handleDeleteTeam(t.id, t.name)}
                                    style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#ef444410', alignItems: 'center', justifyContent: 'center' }}>
                                    <Trash2 size={12} color="#ef4444" />
                                  </Pressable>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>

                      {/* Positions quick view */}
                      <View style={{ padding: 20, paddingTop: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <Briefcase size={15} color="#8b5cf6" />
                          <Text style={{ fontSize: 13, fontWeight: '800', color: cText }}>Chức vụ áp dụng</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                          {positions.map((p: any) => {
                            const levelColors: Record<string, string> = { Staff: '#22c55e', Senior: '#3b82f6', Leader: '#8b5cf6', Manager: '#f59e0b', Director: '#ef4444' };
                            const lc = levelColors[p.level] || '#64748b';
                            return (
                              <View key={p.id} style={{
                                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                                backgroundColor: isDark ? 'rgba(139,92,246,0.06)' : '#f5f3ff',
                                borderWidth: 1, borderColor: isDark ? 'rgba(139,92,246,0.12)' : '#ede9fe',
                                flexDirection: 'row', alignItems: 'center', gap: 6,
                              }}>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: cText }}>{p.name}</Text>
                                {p.level && <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: `${lc}15` }}>
                                  <Text style={{ fontSize: 9, fontWeight: '800', color: lc }}>{p.level}</Text>
                                </View>}
                              </View>
                            );
                          })}
                          {positions.length === 0 && <Text style={{ color: cSub, fontSize: 12 }}>Chưa có chức vụ nào</Text>}
                        </ScrollView>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ═══ Positions Master List ═══ */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#8b5cf615', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={16} color="#8b5cf6" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '900', color: cText }}>Danh sách Chức vụ</Text>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#8b5cf615' }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#8b5cf6' }}>{positions.length}</Text>
              </View>
            </View>
          </View>

          {loadingPos ? (
            <ActivityIndicator size="large" color="#8b5cf6" />
          ) : positions.length === 0 ? (
            <SGCard variant="glass" style={{ padding: 30, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: cSub }}>Chưa có chức vụ nào. Bấm "+ CHỨC VỤ" ở trên.</Text>
            </SGCard>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {positions.map((p: any) => {
                const levelColors: Record<string, string> = { Staff: '#22c55e', Senior: '#3b82f6', Leader: '#8b5cf6', Manager: '#f59e0b', Director: '#ef4444' };
                const lc = levelColors[p.level] || '#64748b';
                return (
                  <View key={p.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    padding: 14, borderRadius: 14, backgroundColor: cardBg, borderWidth: 1, borderColor,
                    minWidth: 200,
                  }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{p.name}</Text>
                        {p.level && <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: `${lc}15` }}>
                          <Text style={{ fontSize: 9, fontWeight: '800', color: lc }}>{p.level}</Text>
                        </View>}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>#{p.code}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#8b5cf6' }}>{p._count?.employees ?? 0} NV</Text>
                      </View>
                    </View>
                    <Pressable onPress={() => { setEditId(p.id); setPosForm({ name: p.name, code: p.code, level: p.level || '', description: p.description || '' }); setModalMode('edit_pos'); }}
                      style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                      <Pencil size={13} color={cSub} />
                    </Pressable>
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
