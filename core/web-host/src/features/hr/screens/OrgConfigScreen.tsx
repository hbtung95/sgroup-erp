 /**
 * OrgConfigScreen — Premium Department-Centric Org Configuration
 * Hierarchy: Department → Teams → Positions
 * Full CRUD for departments, teams, and positions
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import {
  Building, Briefcase, Plus, Pencil, Trash2, X, Users, Hash,
  ChevronDown, ChevronRight, UsersRound, Settings, Network, List
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { sgds } from '@sgroup/ui/src/theme/theme';
import { SGCard } from '@sgroup/ui/src/ui/components';
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
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('tree'); // Default to Tree View for premium feel
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
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: cText, fontWeight: '600',
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
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      {/* ── Modal ── */}
      <Modal visible={!!modalMode} transparent animationType="fade" onRequestClose={() => setModalMode(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalMode(null)}>
          <Pressable style={{ width: '90%', maxWidth: 480, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 28, padding: 32, ...(Platform.OS === 'web' ? { boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' } : {}) }} onPress={() => {}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>{getModalTitle()}</Text>
              <Pressable onPress={() => setModalMode(null)} style={{ padding: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 12 }}><X size={20} color={cSub} /></Pressable>
            </View>

            {/* Department form */}
            {modalMode?.includes('dept') && (
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên phòng ban *</Text>
                  <TextInput value={deptForm.name} onChangeText={v => setDeptForm(f => ({ ...f, name: v }))} placeholder="Phòng Kinh doanh" placeholderTextColor={cSub} style={inputStyle} />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mã phòng ban *</Text>
                  <TextInput value={deptForm.code} onChangeText={v => setDeptForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="SALES" placeholderTextColor={cSub} style={inputStyle} autoCapitalize="characters" />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mô tả</Text>
                  <TextInput value={deptForm.description} onChangeText={v => setDeptForm(f => ({ ...f, description: v }))} placeholder="Mô tả phòng ban" placeholderTextColor={cSub} style={[inputStyle, { minHeight: 80 }]} multiline />
                </View>
              </View>
            )}

            {/* Team form */}
            {modalMode?.includes('team') && (
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên team *</Text>
                  <TextInput value={teamForm.name} onChangeText={v => setTeamForm(f => ({ ...f, name: v }))} placeholder="Team KD Online" placeholderTextColor={cSub} style={inputStyle} />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mã team *</Text>
                  <TextInput value={teamForm.code} onChangeText={v => setTeamForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="KD-ONLINE" placeholderTextColor={cSub} style={inputStyle} autoCapitalize="characters" />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mô tả</Text>
                  <TextInput value={teamForm.description} onChangeText={v => setTeamForm(f => ({ ...f, description: v }))} placeholder="Mô tả team" placeholderTextColor={cSub} style={[inputStyle, { minHeight: 80 }]} multiline />
                </View>
              </View>
            )}

            {/* Position form */}
            {modalMode?.includes('pos') && (
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên chức vụ *</Text>
                  <TextInput value={posForm.name} onChangeText={v => setPosForm(f => ({ ...f, name: v }))} placeholder="Trưởng phòng" placeholderTextColor={cSub} style={inputStyle} />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mã chức vụ *</Text>
                  <TextInput value={posForm.code} onChangeText={v => setPosForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="MGR" placeholderTextColor={cSub} style={inputStyle} autoCapitalize="characters" />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Cấp bậc</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                    {LEVEL_OPTIONS.map(l => (
                      <Pressable key={l} onPress={() => setPosForm(f => ({ ...f, level: f.level === l ? '' : l }))} style={{
                        paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
                        backgroundColor: posForm.level === l ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                        borderWidth: 1, borderColor: posForm.level === l ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                      }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: posForm.level === l ? '#fff' : cText }}>{l}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Mô tả</Text>
                  <TextInput value={posForm.description} onChangeText={v => setPosForm(f => ({ ...f, description: v }))} placeholder="Mô tả chức vụ" placeholderTextColor={cSub} style={[inputStyle, { minHeight: 80 }]} multiline />
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 32 }}>
              <Pressable onPress={() => setModalMode(null)} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: cSub }}>Hủy Bỏ</Text>
              </Pressable>
              <Pressable onPress={handleSubmit} disabled={isPending} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', backgroundColor: isPending ? '#94a3b8' : getModalColor(), shadowColor: getModalColor(), shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>{isPending ? 'Đang lưu...' : (isEdit ? 'Cập Nhật' : 'Tạo Mới')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Main Content ── */}
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Premium Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <LinearGradient 
              colors={['#ec4899', '#f43f5e']} start={{x:0,y:0}} end={{x:1,y:1}}
              style={{ width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', 
                     shadowColor: '#ec4899', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}
            >
              <Settings size={28} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -1 }}>Cấu hình Tổ chức</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Phòng ban → Teams → Chức vụ</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable onPress={() => { setPosForm(EMPTY_POS); setModalMode('create_pos'); }} style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: '#8b5cf6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16,
              shadowColor: '#8b5cf6', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Plus size={16} color="#fff" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>CHỨC VỤ</Text>
            </Pressable>
            <Pressable onPress={() => { setDeptForm(EMPTY_DEPT); setModalMode('create_dept'); }} style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: '#ec4899', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16,
              shadowColor: '#ec4899', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Plus size={16} color="#fff" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>PHÒNG BAN</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* View Mode Toggle */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: -16 }}>
          <View style={{ flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 16, padding: 4 }}>
            <Pressable onPress={() => setViewMode('tree')} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: viewMode === 'tree' ? (isDark ? '#ec4899' : '#fff') : 'transparent', shadowColor: '#000', shadowOpacity: viewMode === 'tree' ? 0.05 : 0, shadowRadius: 4, elevation: viewMode === 'tree' ? 2 : 0, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Network size={16} color={viewMode === 'tree' ? (isDark ? '#fff' : '#ec4899') : cSub} />
              <Text style={{ fontSize: 13, fontWeight: '800', color: viewMode === 'tree' ? (isDark ? '#fff' : '#ec4899') : cSub }}>SƠ ĐỒ CÂY</Text>
            </Pressable>
            <Pressable onPress={() => setViewMode('list')} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: viewMode === 'list' ? (isDark ? '#ec4899' : '#fff') : 'transparent', shadowColor: '#000', shadowOpacity: viewMode === 'list' ? 0.05 : 0, shadowRadius: 4, elevation: viewMode === 'list' ? 2 : 0, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <List size={16} color={viewMode === 'list' ? (isDark ? '#fff' : '#ec4899') : cSub} />
              <Text style={{ fontSize: 13, fontWeight: '800', color: viewMode === 'list' ? (isDark ? '#fff' : '#ec4899') : cSub }}>DANH SÁCH</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ═══ Stats Overview ═══ */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'PHÒNG BAN', val: departments.length, icon: Building, color: '#ec4899', shadow: '#ec4899' },
            { label: 'TEAMS', val: departments.reduce((s: number, d: any) => s + (d.teams?.length || 0), 0), icon: UsersRound, color: '#3b82f6', shadow: '#3b82f6' },
            { label: 'CHỨC VỤ', val: positions.length, icon: Briefcase, color: '#8b5cf6', shadow: '#8b5cf6' },
          ].map((s, i) => (
            <LinearGradient
              key={i}
              colors={isDark ? ['rgba(30,41,59,0.7)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#ffffff']}
              style={{
                flex: 1, minWidth: 200, padding: 24, borderRadius: 24,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                shadowColor: isDark ? '#000' : s.shadow, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={22} color={s.color} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>{s.val}</Text>
              </View>
            </LinearGradient>
          ))}
        </Animated.View>

        {/* ═══ DEPARTMENTS — Expandable Cards ═══ */}
        {loadingDepts ? (
          <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#ec4899" /></View>
        ) : departments.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <SGCard variant="glass" style={{ padding: 40, alignItems: 'center', borderRadius: 24 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🏢</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: cSub }}>Chưa có phòng ban nào. Bấm "+ PHÒNG BAN" để khởi tạo.</Text>
            </SGCard>
          </Animated.View>
        ) : viewMode === 'tree' ? (
          /* ═══ TREE VIEW ═══ */
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
            <View style={{ alignItems: 'center', minWidth: '100%' }}>
              {/* Root Node (Company/CEO) Mock */}
              <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ alignItems: 'center', marginBottom: 32 }}>
                <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={{ paddingHorizontal: 32, paddingVertical: 16, borderRadius: 20, alignItems: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6, zIndex: 10 }}>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>SGroup Corporation</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{departments.length} Phòng ban • {positions.length} Chức vụ</Text>
                </LinearGradient>
                {/* Vertical line down from Root */}
                <View style={{ width: 2, height: 32, backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1', marginTop: -2 }} />
              </Animated.View>

              {/* Departments Row */}
              <View style={{ flexDirection: 'row', gap: 40, position: 'relative' }}>
                {/* Horizontal line connecting all departments */}
                {departments.length > 1 && (
                  <View style={{ position: 'absolute', top: -2, left: '50%', right: '50%', height: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                    transform: [{ translateX: '-50%' }, { scaleX: (departments.length - 1) / departments.length * 1.5 }] // Approx width
                  }} />
                )}
                
                {departments.map((dept: any, dIdx: number) => {
                  const deptTeams = dept.teams || [];
                  return (
                    <Animated.View entering={FadeInDown.delay(300 + dIdx * 100).duration(400)} key={dept.id} style={{ alignItems: 'center' }}>
                      {/* Vertical line to Department */}
                      <View style={{ width: 2, height: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1', marginTop: -16, marginBottom: 0 }} />
                      
                      {/* Department Node */}
                      <View style={{ width: 220, padding: 20, borderRadius: 20, backgroundColor: isDark ? 'rgba(236,72,153,0.1)' : '#fdf2f8', borderWidth: 1, borderColor: isDark ? 'rgba(236,72,153,0.3)' : '#fbcfe8', alignItems: 'center', marginBottom: deptTeams.length > 0 ? 32 : 0, shadowColor: '#ec4899', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 }}>
                        <Building size={24} color="#ec4899" style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 15, fontWeight: '800', color: cText, textAlign: 'center' }}>{dept.name}</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: 'rgba(236,72,153,0.15)', marginTop: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: '900', color: '#ec4899' }}>{dept.code}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: cSub, marginTop: 8 }}>{dept._count?.employees ?? 0} NS • {deptTeams.length} Teams</Text>
                      </View>

                      {/* Teams under Department */}
                      {deptTeams.length > 0 && (
                        <View style={{ alignItems: 'center' }}>
                           {/* Vertical line from Dept down */}
                           <View style={{ width: 2, height: 32, backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0', marginTop: -32 }} />
                           <View style={{ gap: 16 }}>
                             {deptTeams.map((t: any, tIdx: number) => (
                               <Animated.View entering={FadeInDown.delay(500 + tIdx * 50).duration(400)} key={t.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                 {/* Horizontal connector to team */}
                                 <View style={{ width: 24, height: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0', marginRight: 8, marginLeft: -32 }} />
                                 {/* Team Node */}
                                 <View style={{ width: 180, padding: 14, borderRadius: 16, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', borderWidth: 1, borderColor: isDark ? 'rgba(59,130,246,0.2)' : '#bfdbfe' }}>
                                   <Text style={{ fontSize: 13, fontWeight: '800', color: cText }}>{t.name}</Text>
                                   <Text style={{ fontSize: 11, fontWeight: '600', color: '#3b82f6', marginTop: 2 }}>{t.code}</Text>
                                 </View>
                               </Animated.View>
                             ))}
                           </View>
                           {/* Extend vertical line down alongside teams */}
                           <View style={{ position: 'absolute', left: -16, top: 0, bottom: 20, width: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0' }} />
                        </View>
                      )}
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        ) : (
          /* ═══ LIST VIEW (ACCORDION) ═══ */
          <View style={{ gap: 20 }}>
            {departments.map((dept: any, idx: number) => {
              const isExpanded = expandedDept === dept.id;
              const deptTeams = dept.teams || [];
              return (
                <Animated.View entering={FadeInDown.delay(200 + idx * 50).duration(400).springify()} key={dept.id} style={{ 
                  borderRadius: 24, overflow: 'hidden',
                  backgroundColor: isDark ? 'rgba(30,41,59,0.4)' : '#ffffff', 
                  borderWidth: 1, borderColor: isExpanded ? (isDark ? 'rgba(236,72,153,0.3)' : 'rgba(236,72,153,0.3)') : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                  shadowColor: '#ec4899', shadowOpacity: isExpanded ? 0.05 : 0, shadowRadius: 20,
                  ...(Platform.OS === 'web' && isExpanded ? { backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' } : {}),
                }}>
                  {/* Department Header — clickable to expand */}
                  <Pressable onPress={() => setExpandedDept(isExpanded ? null : dept.id)} style={{ padding: 24, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <LinearGradient 
                      colors={isExpanded ? ['#ec4899', '#f43f5e'] : (isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.05)'] : ['#fce7f3', '#fbcfe8'])} 
                      style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Building size={24} color={isExpanded ? "#fff" : "#ec4899"} />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>{dept.name}</Text>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: cSub, letterSpacing: 0.5 }}>{dept.code}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Users size={14} color={cSub} />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>{dept._count?.employees ?? 0} nhân sự</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <UsersRound size={14} color="#3b82f6" />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#3b82f6' }}>{deptTeams.length} teams</Text>
                        </View>
                        {dept.manager?.fullName && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Briefcase size={14} color="#f59e0b" />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#f59e0b' }}>TP: {dept.manager.fullName}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {/* Action buttons */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Pressable onPress={() => { setEditId(dept.id); setDeptForm({ name: dept.name, code: dept.code, description: dept.description || '' }); setModalMode('edit_dept'); }}
                        style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={16} color={cSub} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteDept(dept.id, dept.name)}
                        style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(244,63,94,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={16} color="#f43f5e" />
                      </Pressable>
                    </View>
                    <View style={{ marginLeft: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: isExpanded ? 'rgba(236,72,153,0.1)' : 'transparent', borderRadius: 16 }}>
                      {isExpanded ? <ChevronDown size={20} color="#ec4899" /> : <ChevronRight size={20} color={cSub} />}
                    </View>
                  </Pressable>

                  {/* Expanded content — Teams + Positions */}
                  {isExpanded && (
                    <View style={{ borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : '#f8fafc' }}>
                      {/* Teams Section */}
                      <View style={{ padding: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <UsersRound size={18} color="#3b82f6" />
                            <Text style={{ fontSize: 16, fontWeight: '900', color: cText }}>Các Team Trực Thuộc</Text>
                            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.15)' }}>
                              <Text style={{ fontSize: 11, fontWeight: '900', color: '#3b82f6' }}>{deptTeams.length}</Text>
                            </View>
                          </View>
                          <Pressable onPress={() => { setTeamForm({ ...EMPTY_TEAM, departmentId: dept.id }); setModalMode('create_team'); }} style={{
                            flexDirection: 'row', alignItems: 'center', gap: 6,
                            paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
                            backgroundColor: '#3b82f6', ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
                          }}>
                            <Plus size={14} color="#fff" />
                            <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>THÊM TEAM</Text>
                          </Pressable>
                        </View>

                        {deptTeams.length === 0 ? (
                          <View style={{ padding: 24, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.04)' : '#e2e8f0', alignItems: 'center', borderStyle: 'dashed' }}>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: cSub }}>Chưa có team nào trong phòng ban này</Text>
                          </View>
                        ) : (
                          <View style={{ gap: 12 }}>
                            {deptTeams.map((t: any) => (
                              <View key={t.id} style={{
                                flexDirection: 'row', alignItems: 'center', gap: 16,
                                padding: 16, borderRadius: 16, backgroundColor: isDark ? 'rgba(59,130,246,0.04)' : '#ffffff',
                                borderWidth: 1, borderColor: isDark ? 'rgba(59,130,246,0.12)' : '#e0e7ff',
                                shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.02, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
                              }}>
                                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(59,130,246,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                                  <UsersRound size={18} color="#3b82f6" />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{t.name}</Text>
                                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                      <Hash size={12} color={cSub} />
                                      <Text style={{ fontSize: 12, fontWeight: '700', color: cSub, letterSpacing: 0.5 }}>{t.code}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                      <Users size={12} color="#3b82f6" />
                                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#3b82f6' }}>{t._count?.employees ?? 0} thành viên</Text>
                                    </View>
                                  </View>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                  <Pressable onPress={() => { setEditId(t.id); setTeamForm({ name: t.name, code: t.code, departmentId: dept.id, description: t.description || '' }); setModalMode('edit_team'); }}
                                    style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                                    <Pencil size={14} color={cSub} />
                                  </Pressable>
                                  <Pressable onPress={() => handleDeleteTeam(t.id, t.name)}
                                    style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(244,63,94,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                                    <Trash2 size={14} color="#f43f5e" />
                                  </Pressable>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>

                      {/* Positions quick view */}
                      <View style={{ padding: 24, paddingTop: 8, paddingBottom: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                          <Briefcase size={16} color="#8b5cf6" />
                          <Text style={{ fontSize: 14, fontWeight: '900', color: cText }}>Hệ thống Chức vụ</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                          {positions.map((p: any) => {
                            const levelColors: Record<string, string> = { Staff: '#22c55e', Senior: '#3b82f6', Leader: '#8b5cf6', Manager: '#f59e0b', Director: '#ef4444' };
                            const lc = levelColors[p.level] || '#64748b';
                            return (
                              <View key={p.id} style={{
                                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                                backgroundColor: isDark ? 'rgba(139,92,246,0.06)' : '#ffffff',
                                borderWidth: 1, borderColor: isDark ? 'rgba(139,92,246,0.12)' : '#ede9fe',
                                flexDirection: 'row', alignItems: 'center', gap: 10,
                                shadowColor: '#000', shadowOpacity: isDark ? 0 : 0.02, shadowRadius: 4, elevation: 1,
                              }}>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: cText }}>{p.name}</Text>
                                {p.level && <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: `${lc}15` }}>
                                  <Text style={{ fontSize: 10, fontWeight: '900', color: lc, letterSpacing: 0.5 }}>{p.level.toUpperCase()}</Text>
                                </View>}
                              </View>
                            );
                          })}
                          {positions.length === 0 && <Text style={{ color: cSub, fontSize: 14, fontWeight: '600' }}>Chưa có chức vụ nào</Text>}
                        </ScrollView>
                      </View>
                    </View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* ═══ Positions Master List ═══ */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(139,92,246,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={22} color="#8b5cf6" />
              </View>
              <View>
                <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>Danh sách Chức vụ</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 2 }}>Toàn bộ các cấp bậc trong công ty</Text>
              </View>
            </View>
          </View>

          {loadingPos ? (
            <ActivityIndicator size="large" color="#8b5cf6" />
          ) : positions.length === 0 ? (
            <SGCard variant="glass" style={{ padding: 40, alignItems: 'center', borderRadius: 24 }}>
              <Briefcase size={40} color={cSub} style={{ marginBottom: 16, opacity: 0.5 }} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: cSub }}>Chưa có chức vụ nào. Bấm "+ CHỨC VỤ" ở trên.</Text>
            </SGCard>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              {positions.map((p: any) => {
                const levelColors: Record<string, string> = { Staff: '#22c55e', Senior: '#3b82f6', Leader: '#8b5cf6', Manager: '#f59e0b', Director: '#ef4444' };
                const lc = levelColors[p.level] || '#64748b';
                return (
                  <View key={p.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 16,
                    padding: 20, borderRadius: 20, backgroundColor: cardBg, 
                    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    flex: 1, minWidth: 280,
                    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
                  }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{p.name}</Text>
                        {p.level && <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: `${lc}15` }}>
                          <Text style={{ fontSize: 10, fontWeight: '900', color: lc, letterSpacing: 0.5 }}>{p.level.toUpperCase()}</Text>
                        </View>}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Hash size={14} color={cSub} />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, letterSpacing: 0.5 }}>{p.code}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Users size={14} color="#8b5cf6" />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#8b5cf6' }}>{p._count?.employees ?? 0} NV</Text>
                        </View>
                      </View>
                    </View>
                    <Pressable onPress={() => { setEditId(p.id); setPosForm({ name: p.name, code: p.code, level: p.level || '', description: p.description || '' }); setModalMode('edit_pos'); }}
                      style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                      <Pencil size={15} color={cSub} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
