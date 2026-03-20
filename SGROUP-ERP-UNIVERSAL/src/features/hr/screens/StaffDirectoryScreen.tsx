/**
 * StaffDirectoryScreen — Premium HR Staff Directory page
 * Features: stat cards, search/filter, modern staff cards, EDIT modal, TEAM selector
 * Now connected to real database via HR API
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Platform, TextInput, ActivityIndicator, Modal, Alert, TouchableOpacity } from 'react-native';
import {
  UserCog, Plus, Users, Target, Search, Filter, Mail, Hash, Phone, Building, Star, X, Pencil, UsersRound, ArrowRightLeft, History, Laptop, CheckCircle, Clock, Check, LayoutGrid, List
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import { LinearGradient } from 'expo-linear-gradient';
import type { HRRole } from '../HRSidebar';
import { useEmployees, useHRDashboard, useCreateEmployee, useUpdateEmployee, useDepartments, usePositions, useTeams, useTransferHistory } from '../hooks/useHR';

const fmt = (n: number) => n.toLocaleString('vi-VN');

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'ACTIVE', label: 'Đang làm' },
  { key: 'PROBATION', label: 'Thử việc' },
  { key: 'ON_LEAVE', label: 'Đang nghỉ' },
  { key: 'TERMINATED', label: 'Đã nghỉ' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Đang làm', color: '#10b981' },
  { value: 'PROBATION', label: 'Thử việc', color: '#3b82f6' },
  { value: 'ON_LEAVE', label: 'Đang nghỉ', color: '#f59e0b' },
  { value: 'TERMINATED', label: 'Đã nghỉ', color: '#ef4444' },
];

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'Director': { label: 'Giám đốc', color: '#ef4444', bg: '#ef444410' },
  'Manager': { label: 'Quản lý', color: '#f59e0b', bg: '#f59e0b10' },
  'Leader': { label: 'Trưởng nhóm', color: '#8b5cf6', bg: '#8b5cf610' },
  'Senior': { label: 'Senior', color: '#3b82f6', bg: '#3b82f610' },
  'Staff': { label: 'Nhân viên', color: '#22c55e', bg: '#22c55e10' },
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function nameToColor(name: string) {
  const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1', '#f43f5e'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const EMPTY_FORM = { fullName: '', englishName: '', email: '', phone: '', departmentId: '', positionId: '', teamId: '', status: 'ACTIVE' };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function StaffDirectoryScreen({ userRole }: { userRole?: HRRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cBg = isDark ? theme.colors.background : theme.colors.backgroundAlt;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal state: 'create' | 'edit' | null
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);

  const canEdit = userRole === 'admin' || userRole === 'hr_manager' || userRole === 'hr_director';

  // Data hooks
  const { data: dashboardData } = useHRDashboard();
  const { data: employeesData, isLoading, error } = useEmployees({
    search: searchText || undefined,
    status: activeFilter !== 'all' ? activeFilter : undefined,
  });
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: rawDepts } = useDepartments();
  const { data: rawPositions } = usePositions();
  const deptOptions = Array.isArray(rawDepts) ? rawDepts : (rawDepts as any)?.data ?? [];
  const posOptions = Array.isArray(rawPositions) ? rawPositions : (rawPositions as any)?.data ?? [];

  // Teams — filtered by selected department
  const { data: rawTeams } = useTeams(form.departmentId || undefined);
  const teamOptions = useMemo(() => {
    const list = Array.isArray(rawTeams) ? rawTeams : (rawTeams as any)?.data ?? [];
    return list;
  }, [rawTeams]);

  // Transfer history for the employee being edited
  const { data: rawTransfers } = useTransferHistory(editId || undefined);
  const transfers = useMemo(() => Array.isArray(rawTransfers) ? rawTransfers : [], [rawTransfers]);

  // Reset teamId when department changes
  const handleDeptChange = useCallback((deptId: string) => {
    setForm(f => ({
      ...f,
      departmentId: f.departmentId === deptId ? '' : deptId,
      teamId: f.departmentId === deptId ? f.teamId : '', // reset team when dept changes
    }));
  }, []);

  const rawList = employeesData?.data ?? employeesData;
  const employees = Array.isArray(rawList) ? rawList : [];
  const total = employeesData?.meta?.total || employees.length;

  const db = (dashboardData as any)?.data ?? dashboardData ?? {};

  const statCards = [
    { label: 'Tổng nhân sự', value: db?.totalEmployees ?? 0, icon: Users, color: '#ec4899', gradient: ['#ec4899', '#be185d'] },
    { label: 'Phòng ban', value: db?.departmentCount ?? 0, icon: Building, color: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'] },
    { label: 'Thử việc', value: db?.probationEmployees ?? 0, icon: Star, color: '#f59e0b', gradient: ['#f59e0b', '#d97706'] },
    { label: 'Nghỉ phép', value: db?.onLeaveCount ?? 0, icon: Target, color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
  ];

  const showAlert = (msg: string) => {
    Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thông báo', msg);
  };

  // Open CREATE modal
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModalMode('create');
  };

  // Open EDIT modal
  const openEdit = (staff: any) => {
    setForm({
      fullName: staff.fullName || '',
      englishName: staff.englishName || '',
      email: staff.email || '',
      phone: staff.phone || '',
      departmentId: staff.departmentId || staff.department?.id || '',
      positionId: staff.positionId || staff.position?.id || '',
      teamId: staff.teamId || '',
      status: staff.status || 'ACTIVE',
    });
    setEditId(staff.id);
    setModalMode('edit');
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim()) {
      showAlert('Vui lòng nhập họ tên nhân viên');
      return;
    }

    const payload: any = {
      fullName: form.fullName,
      englishName: form.englishName || null,
      email: form.email || null,
      phone: form.phone || null,
      departmentId: form.departmentId || null,
      positionId: form.positionId || null,
      teamId: form.teamId || null,
    };

    try {
      if (modalMode === 'edit' && editId) {
        payload.status = form.status;
        await updateEmployee.mutateAsync({ id: editId, data: payload });
        showAlert('Cập nhật thành công!');
      } else {
        await createEmployee.mutateAsync(payload);
        showAlert('Tạo hồ sơ thành công!');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setModalMode(null);
    } catch (e: any) {
      showAlert(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra');
    }
  };

  const isSaving = createEmployee.isPending || updateEmployee.isPending;

  const inputStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: cText,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  };

  const LIST_COLUMNS: any = [
    { key: 'name', title: 'HỌ TÊN', flex: 2.5, minWidth: 280, render: (_: any, staff: any) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 10 }}>
        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: nameToColor(staff.fullName || '') + '20', alignItems: 'center', justifyContent: 'center' }}>
           <Text style={{ fontSize: 12, fontWeight: '800', color: nameToColor(staff.fullName || '') }}>{getInitials(staff.fullName || '')}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: cText }} numberOfLines={2}>{staff.fullName}</Text>
          <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{staff.employeeCode}</Text>
        </View>
      </View>
    ) },
    { key: 'role', title: 'CHỨC VỤ / PHÒNG BAN / TEAM', flex: 2.2, minWidth: 220, render: (_: any, staff: any) => (
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }} numberOfLines={2}>{staff.position?.name || 'Nhân viên'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, color: cSub }}>{staff.department?.name || '—'}</Text>
          {staff.team?.name ? (
            <>
              <Text style={{ fontSize: 12, color: cSub, marginHorizontal: 4 }}>•</Text>
              <Text style={{ fontSize: 12, color: '#6366f1', fontWeight: '600' }}>{staff.team.name}</Text>
            </>
          ) : null}
        </View>
      </View>
    ) },
    { key: 'contact', title: 'LIÊN HỆ', flex: 2, minWidth: 260, render: (_: any, staff: any) => (
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={{ fontSize: 13, color: cText }} numberOfLines={2}>{staff.email || '—'}</Text>
        <Text style={{ fontSize: 12, color: cSub, marginTop: 2 }}>{staff.phone || '—'}</Text>
      </View>
    ) },
    { key: 'status', title: 'TRẠNG THÁI', flex: 1, minWidth: 120, align: 'center', render: (_: any, staff: any) => {
      const color = staff.status === 'ACTIVE' ? '#16a34a' : staff.status === 'PROBATION' ? '#2563eb' : '#d97706';
      const bg = staff.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : staff.status === 'PROBATION' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)';
      const label = staff.status === 'ACTIVE' ? 'ĐANG LÀM' : staff.status === 'PROBATION' ? 'THỬ VIỆC' : staff.status === 'ON_LEAVE' ? 'ĐANG NGHỈ' : staff.status;
      return (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: bg, alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: color }} numberOfLines={1}>{label}</Text>
        </View>
      );
    } },
    { key: 'action', title: '', flex: 0.5, minWidth: 60, align: 'center', render: (_: any, staff: any) => canEdit ? (
      <TouchableOpacity onPress={() => openEdit(staff)} style={{ padding: 8 }}>
        <Pencil size={16} color={cSub} />
      </TouchableOpacity>
    ) : null }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: cBg }}>
      {/* ── CREATE / EDIT Employee Modal ── */}
      <Modal visible={modalMode !== null} transparent animationType="fade" onRequestClose={() => setModalMode(null)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setModalMode(null)}
        >
          <Pressable
            style={{
              width: '90%', maxWidth: 520, backgroundColor: isDark ? '#1e293b' : '#fff',
              borderRadius: 24, padding: 28, maxHeight: '90%',
              ...(Platform.OS === 'web' ? { boxShadow: '0 25px 50px rgba(0,0,0,0.25)' } : {}),
            }}
            onPress={() => {}} // prevent close on inner press
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>
                  {modalMode === 'edit' ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ nhân viên'}
                </Text>
                <Pressable onPress={() => setModalMode(null)} style={{ padding: 4 }}>
                  <X size={22} color={cSub} />
                </Pressable>
              </View>

              <View style={{ gap: 14 }}>
                {/* Full Name */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Họ và tên *</Text>
                  <TextInput value={form.fullName} onChangeText={v => setForm(f => ({ ...f, fullName: v }))} placeholder="Nguyễn Văn A" placeholderTextColor={cSub} style={inputStyle} />
                </View>

                {/* English Name */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tên tiếng Anh</Text>
                  <TextInput value={form.englishName} onChangeText={v => setForm(f => ({ ...f, englishName: v }))} placeholder="Nguyen Van A" placeholderTextColor={cSub} style={inputStyle} />
                </View>

                {/* Department */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Phòng ban</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {deptOptions.map((d: any) => (
                      <Pressable key={d.id} onPress={() => handleDeptChange(d.id)} style={{
                        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                        backgroundColor: form.departmentId === d.id ? '#ec4899' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                        borderWidth: 1, borderColor: form.departmentId === d.id ? '#ec4899' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: form.departmentId === d.id ? '#fff' : cText }}>{d.name}</Text>
                      </Pressable>
                    ))}
                    {deptOptions.length === 0 && <Text style={{ color: cSub, fontSize: 12 }}>Chưa có phòng ban</Text>}
                  </ScrollView>
                </View>

                {/* Team — only show when a department is selected and has teams */}
                {form.departmentId && teamOptions.length > 0 && (
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      <UsersRound size={11} color={cSub} /> Team
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                      <Pressable onPress={() => setForm(f => ({ ...f, teamId: '' }))} style={{
                        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                        backgroundColor: !form.teamId ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                        borderWidth: 1, borderColor: !form.teamId ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: !form.teamId ? '#fff' : cText }}>Không chọn</Text>
                      </Pressable>
                      {teamOptions.map((t: any) => (
                        <Pressable key={t.id} onPress={() => setForm(f => ({ ...f, teamId: f.teamId === t.id ? '' : t.id }))} style={{
                          paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                          backgroundColor: form.teamId === t.id ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                          borderWidth: 1, borderColor: form.teamId === t.id ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                        }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: form.teamId === t.id ? '#fff' : cText }}>{t.name}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Position */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Chức vụ</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {posOptions.map((p: any) => (
                      <Pressable key={p.id} onPress={() => setForm(f => ({ ...f, positionId: f.positionId === p.id ? '' : p.id }))} style={{
                        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                        backgroundColor: form.positionId === p.id ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                        borderWidth: 1, borderColor: form.positionId === p.id ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                      }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: form.positionId === p.id ? '#fff' : cText }}>{p.name}</Text>
                      </Pressable>
                    ))}
                    {posOptions.length === 0 && <Text style={{ color: cSub, fontSize: 12 }}>Chưa có chức vụ</Text>}
                  </ScrollView>
                </View>

                {/* Email */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</Text>
                  <TextInput value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="email@sgroup.vn" placeholderTextColor={cSub} style={inputStyle} keyboardType="email-address" />
                </View>

                {/* Phone */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Số điện thoại</Text>
                  <TextInput value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} placeholder="0901234567" placeholderTextColor={cSub} style={inputStyle} keyboardType="phone-pad" />
                </View>

                {/* Status — only in edit mode */}
                {modalMode === 'edit' && (
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Trạng thái</Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {STATUS_OPTIONS.map(s => (
                        <Pressable key={s.value} onPress={() => setForm(f => ({ ...f, status: s.value }))} style={{
                          paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                          backgroundColor: form.status === s.value ? `${s.color}20` : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                          borderWidth: form.status === s.value ? 1 : 1, borderColor: form.status === s.value ? s.color : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                        }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: form.status === s.value ? s.color : cText }}>{s.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Transfer History — only in edit mode */}
                {modalMode === 'edit' && transfers.length > 0 && (
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <History size={14} color="#6366f1" />
                      <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 0.5 }}>Lịch sử luân chuyển ({transfers.length})</Text>
                    </View>
                    <View style={{
                      borderRadius: 14, overflow: 'hidden',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                      borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                    }}>
                      {transfers.map((t: any, idx: number) => (
                        <View key={t.id} style={{
                          flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
                          borderBottomWidth: idx < transfers.length - 1 ? 1 : 0,
                          borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9',
                        }}>
                          <View style={{
                            width: 28, height: 28, borderRadius: 8,
                            backgroundColor: t.transferType === 'DEPARTMENT' ? 'rgba(236,72,153,0.1)' : t.transferType === 'TEAM' ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
                            alignItems: 'center', justifyContent: 'center',
                          }}>
                            <ArrowRightLeft size={12} color={t.transferType === 'DEPARTMENT' ? '#ec4899' : t.transferType === 'TEAM' ? '#6366f1' : '#f59e0b'} />
                          </View>
                          <View style={{ flex: 1 }}>
                            {(t.transferType === 'DEPARTMENT' || t.transferType === 'BOTH') && (
                              <Text style={{ fontSize: 11, fontWeight: '700', color: cText }}>
                                {t.fromDepartment?.name || '—'} → {t.toDepartment?.name || '—'}
                              </Text>
                            )}
                            {(t.transferType === 'TEAM' || t.transferType === 'BOTH') && (
                              <Text style={{ fontSize: 11, fontWeight: '600', color: '#6366f1' }}>
                                Team: {t.fromTeam?.name || '—'} → {t.toTeam?.name || '—'}
                              </Text>
                            )}
                            <Text style={{ fontSize: 10, fontWeight: '600', color: cSub, marginTop: 2 }}>
                              {new Date(t.effectiveDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Buttons */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                  <Pressable
                    onPress={() => setModalMode(null)}
                    style={{
                      flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: cSub }}>Hủy</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSubmit}
                    disabled={isSaving}
                    style={{
                      flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
                      backgroundColor: isSaving ? '#94a3b8' : '#ec4899',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>
                      {isSaving ? 'Đang lưu...' : modalMode === 'edit' ? 'Cập nhật' : 'Tạo hồ sơ'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 28, gap: 20, paddingBottom: 120 }}>

        {/* ── Header ── */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 18,
              backgroundColor: isDark ? 'rgba(236,72,153,0.12)' : '#fdf2f8',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={24} color="#ec4899" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText, letterSpacing: -0.5 }}>Danh bạ Nhân sự</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>
                Quản lý hồ sơ nhân viên toàn công ty
              </Text>
            </View>
          </View>
          {canEdit && (
            <Pressable
              onPress={openCreate}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: '#ec4899', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
                ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
              }}
            >
              <Plus size={16} color="#fff" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>THÊM HỒ SƠ</Text>
            </Pressable>
          )}
        </Animated.View>

        {/* ── Stat Cards ── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          {statCards.map((sc, i) => {
            const Icon = sc.icon;
            return (
              <LinearGradient
                key={i}
                colors={isDark ? ['rgba(30,41,59,0.7)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#ffffff']}
                style={{
                  flex: 1, minWidth: 200, borderRadius: 24, padding: 24,
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                  shadowColor: isDark ? '#000' : sc.color, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6,
                  ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' as any } : {}),
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 14,
                    backgroundColor: sc.color + '15',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={22} color={sc.color} />
                  </View>
                </View>
                <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>
                  {typeof sc.value === 'number' ? fmt(sc.value) : sc.value}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {sc.label}
                </Text>
              </LinearGradient>
            );
          })}
        </Animated.View>

        {/* ── Search & Filter ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <View style={{
            flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            borderRadius: 16, padding: 4, height: 44,
          }}>
            <TouchableOpacity onPress={() => setViewMode('grid')} style={{ paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12, backgroundColor: viewMode === 'grid' ? (isDark ? '#ec4899' : '#fff') : 'transparent', shadowOpacity: viewMode === 'grid' ? 0.05 : 0, elevation: viewMode === 'grid' ? 2 : 0 }}>
              <LayoutGrid size={18} color={viewMode === 'grid' ? (isDark ? '#fff' : cText) : cSub} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('list')} style={{ paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12, backgroundColor: viewMode === 'list' ? (isDark ? '#ec4899' : '#fff') : 'transparent', shadowOpacity: viewMode === 'list' ? 0.05 : 0, elevation: viewMode === 'list' ? 2 : 0 }}>
              <List size={18} color={viewMode === 'list' ? (isDark ? '#fff' : cText) : cSub} />
            </TouchableOpacity>
          </View>
          <View style={{
            flex: 1, minWidth: 240, flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: cardBg,
            borderWidth: 1, borderColor,
            borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
          }}>
            <Search size={18} color={cSub} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Tìm theo tên, mã NV, email, phòng ban..."
              placeholderTextColor={cSub}
              style={[{
                flex: 1, fontSize: 14, color: cText,
              }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {FILTER_TABS.map(tab => {
                const active = activeFilter === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveFilter(tab.key)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                      backgroundColor: active ? '#ec4899' : (isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'),
                      borderWidth: active ? 0 : 1,
                      borderColor: active ? 'transparent' : borderColor,
                    }}
                  >
                    <Text style={{
                      fontSize: 12, fontWeight: '800',
                      color: active ? '#fff' : cSub,
                      letterSpacing: 0.3,
                    }}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>

        {/* ── Loading State ── */}
        {isLoading && (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#ec4899" />
            <Text style={{ fontSize: 14, color: cSub, marginTop: 12 }}>Đang tải dữ liệu...</Text>
          </View>
        )}

        {/* ── Error State ── */}
        {error && (
          <SGCard variant="glass" style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: cText, marginBottom: 6 }}>Lỗi tải dữ liệu</Text>
            <Text style={{ fontSize: 13, color: cSub, textAlign: 'center' }}>
              {(error as any)?.message || 'Không thể kết nối đến máy chủ'}
            </Text>
          </SGCard>
        )}

        {/* ── Staff Grid ── */}
        {!isLoading && !error && employees.length === 0 ? (
          <SGCard variant="glass" style={{ padding: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>👥</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: cText, marginBottom: 6 }}>Không có dữ liệu</Text>
            <Text style={{ fontSize: 13, color: cSub, textAlign: 'center' }}>
              {searchText ? 'Không tìm thấy kết quả phù hợp' : 'Danh sách nhân sự trống. Hãy thêm nhân viên mới.'}
            </Text>
          </SGCard>
        ) : !isLoading && !error && activeFilter === 'PROBATION' ? (
          /* ═══ ONBOARDING JOURNEY MAP ═══ */
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 24, paddingVertical: 10 }}>
             {[
               { id: 'S1', title: 'Ngày 1: Setup', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Laptop,
                 items: employees.slice(0, Math.max(1, Math.floor(employees.length / 4))) },
               { id: 'S2', title: 'Tuần 1: Hội nhập', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: UsersRound,
                 items: employees.slice(Math.max(1, Math.floor(employees.length / 4)), Math.max(2, Math.floor(employees.length / 2))) },
               { id: 'S3', title: 'Tháng 1-2: Đánh giá', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Star,
                 items: employees.slice(Math.max(2, Math.floor(employees.length / 2)), employees.length - 1) },
               { id: 'S4', title: 'Hoàn tất chờ ký HĐ', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle,
                 items: employees.slice(employees.length - 1) },
             ].map((stage, sIdx) => (
               <View key={stage.id} style={{ width: 340, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: 24, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                     <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: stage.bg, alignItems: 'center', justifyContent: 'center' }}>
                       <stage.icon size={18} color={stage.color} />
                     </View>
                     <View>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{stage.title}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: stage.color }}>{stage.items.length} nhân sự</Text>
                     </View>
                  </View>
                  <View style={{ gap: 12 }}>
                     {stage.items.length === 0 ? (
                       <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: cSub + '40', borderRadius: 16 }}>
                          <Text style={{ fontSize: 12, color: cSub }}>Trống</Text>
                       </View>
                     ) : stage.items.map((emp: any, eIdx: number) => {
                       const avatarColor = nameToColor(emp.fullName || '');
                       return (
                         <AnimatedPressable entering={FadeInDown.delay(300 + sIdx * 50 + eIdx * 40).duration(400)} key={emp.id} onPress={() => canEdit && openEdit(emp)} style={{ padding: 16, borderRadius: 16, backgroundColor: isDark ? 'rgba(30,41,59,0.8)' : '#fff', shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', ...(Platform.OS === 'web' ? { cursor: 'grab' as any } : {}) }}>
                            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: avatarColor + '20', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 13, fontWeight: '900', color: avatarColor }}>{getInitials(emp.fullName || '')}</Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{emp.fullName}</Text>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: cSub, marginTop: 2 }}>{emp.position?.name || 'Thực tập sinh'} • {emp.department?.name || 'HR'}</Text>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', paddingTop: 12 }}>
                               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <Clock size={14} color={cSub} />
                                  <Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>Tính từ {new Date().toLocaleDateString('vi-VN')}</Text>
                               </View>
                               <View style={{ width: 24, height: 24, borderRadius: 8, backgroundColor: stage.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                                 <Check size={12} color={stage.color} />
                               </View>
                            </View>
                         </AnimatedPressable>
                       )
                     })}
                  </View>
               </View>
             ))}
          </ScrollView>
        ) : !isLoading && !error && viewMode === 'list' ? (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{
            backgroundColor: isDark ? 'rgba(30,41,59,0.35)' : '#ffffff',
            borderRadius: 24, overflow: 'hidden', marginTop: 16,
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            ...(Platform.OS === 'web' ? { 
              backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 12px 32px rgba(0,0,0,0.04)' 
            } : {}),
          }}>
            <SGTable 
              columns={LIST_COLUMNS} 
              data={employees} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          </Animated.View>
        ) : !isLoading && !error && viewMode === 'grid' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {employees.map((staff: any, idx: number) => {
              const posLevel = staff.position?.level || 'Staff';
              const roleConf = ROLE_CONFIG[posLevel] || { label: posLevel, color: '#64748b', bg: '#f1f5f9' };
              const avatarColor = nameToColor(staff.fullName || '');
              const deptName = staff.department?.name || '—';

              return (
                <AnimatedPressable
                  entering={FadeInDown.delay(300 + idx * 40).duration(400).springify()}
                  key={staff.id}
                  onPress={() => canEdit && openEdit(staff)}
                  style={{
                    flex: 1, minWidth: 340, maxWidth: 440,
                    borderRadius: 24, padding: 0, overflow: 'hidden',
                    backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#ffffff',
                    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.04, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4,
                    ...(Platform.OS === 'web' ? {
                      cursor: canEdit ? 'pointer' : 'default' as any,
                      transition: 'all 0.25s ease' as any,
                    } : {}),
                  }}
                >
                  {/* Top accent bar */}
                  <LinearGradient colors={[avatarColor, avatarColor + '80']} start={{x:0,y:0}} end={{x:1,y:0}} style={{ height: 4 }} />

                  <View style={{ padding: 24 }}>
                    {/* Avatar + Name + Code */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                      <LinearGradient
                        colors={[avatarColor + '20', avatarColor + '05']}
                        style={{
                          width: 56, height: 56, borderRadius: 18,
                          alignItems: 'center', justifyContent: 'center',
                          borderWidth: 1, borderColor: avatarColor + '30',
                        }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: '900', color: avatarColor }}>
                          {getInitials(staff.fullName || '')}
                        </Text>
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 17, fontWeight: '800', color: cText, letterSpacing: -0.3 }}>{staff.fullName}</Text>
                        {staff.englishName ? (
                          <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 2, fontStyle: 'italic' }}>{staff.englishName}</Text>
                        ) : null}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <Hash size={12} color={cSub} />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{staff.employeeCode}</Text>
                        </View>
                      </View>
                      {/* Role badge */}
                      <View style={{
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
                        backgroundColor: roleConf.bg,
                        borderWidth: 1, borderColor: roleConf.color + '20',
                      }}>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: roleConf.color, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                          {staff.position?.name || roleConf.label}
                        </Text>
                      </View>
                    </View>

                    {/* Department badge */}
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 10,
                      paddingBottom: 16, marginBottom: 16,
                      borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                    }}>
                      <View style={{
                        width: 28, height: 28, borderRadius: 8,
                        backgroundColor: '#8b5cf615',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Building size={14} color="#8b5cf6" />
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: deptName !== '—' ? cText : cSub }}>
                        {deptName}
                      </Text>
                      <Text style={{ fontSize: 12, color: cSub, marginHorizontal: 4 }}>•</Text>
                      <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                        backgroundColor: staff.team?.name
                          ? (isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff')
                          : (isDark ? 'rgba(148,163,184,0.1)' : '#f8fafc'),
                      }}>
                        <UsersRound size={12} color={staff.team?.name ? '#6366f1' : '#94a3b8'} />
                        <Text style={{ fontSize: 11, fontWeight: '800', color: staff.team?.name ? '#6366f1' : '#94a3b8' }}>
                          {staff.team?.name || 'Chưa gán team'}
                        </Text>
                      </View>
                      <View style={{
                        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginLeft: 'auto',
                        backgroundColor: staff.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : staff.status === 'PROBATION' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: staff.status === 'ACTIVE' ? '#16a34a' : staff.status === 'PROBATION' ? '#2563eb' : '#d97706', letterSpacing: 0.5 }}>
                          {staff.status === 'ACTIVE' ? 'ĐANG LÀM' : staff.status === 'PROBATION' ? 'THỬ VIỆC' : staff.status === 'ON_LEAVE' ? 'ĐANG NGHỈ' : staff.status}
                        </Text>
                      </View>
                    </View>

                    {/* Contact info row */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: isDark ? 'rgba(59,130,246,0.06)' : '#eff6ff', borderWidth: 1, borderColor: isDark ? 'transparent' : '#dbeafe' }}>
                        <Mail size={16} color="#3b82f6" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }} numberOfLines={1}>{staff.email || '—'}</Text>
                      </View>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: isDark ? 'rgba(139,92,246,0.06)' : '#f5f3ff', borderWidth: 1, borderColor: isDark ? 'transparent' : '#ede9fe' }}>
                        <Phone size={16} color="#8b5cf6" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{staff.phone || '—'}</Text>
                      </View>
                    </View>

                    {/* Edit hint for admins */}
                    {canEdit && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 14, opacity: 0.6 }}>
                        <Pencil size={12} color={cSub} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: cSub, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nhấn để chỉnh sửa</Text>
                      </View>
                    )}
                  </View>
                </AnimatedPressable>
              );
            })}
          </View>
        )}

        {/* ── Results count ── */}
        {!isLoading && employees.length > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: cSub, fontWeight: '600' }}>
              Hiển thị {employees.length}/{total} nhân viên
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
