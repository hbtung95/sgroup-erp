/**
 * StaffDirectoryScreen — Premium HR Staff Directory page
 * Features: stat cards, search/filter, modern staff cards with department display
 * Now connected to real database via HR API
 */
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Platform, TextInput, ActivityIndicator, Modal, Alert } from 'react-native';
import {
  UserCog, Plus, Users, Target, Search, Filter, Mail, Hash, Phone, Building, Star, X
} from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard } from '../../../shared/ui/components';
import type { HRRole } from '../HRSidebar';
import { useEmployees, useHRDashboard, useCreateEmployee, useDepartments, usePositions } from '../hooks/useHR';

const fmt = (n: number) => n.toLocaleString('vi-VN');

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'ACTIVE', label: 'Đang làm' },
  { key: 'PROBATION', label: 'Thử việc' },
  { key: 'ON_LEAVE', label: 'Đang nghỉ' },
  { key: 'TERMINATED', label: 'Đã nghỉ' },
];

// Role config for badges (generic for HR)
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'Director': { label: 'Giám đốc', color: '#ef4444', bg: '#ef444410' },
  'Manager': { label: 'Quản lý', color: '#f59e0b', bg: '#f59e0b10' },
  'Leader': { label: 'Trưởng nhóm', color: '#8b5cf6', bg: '#8b5cf610' },
  'Senior': { label: 'Senior', color: '#3b82f6', bg: '#3b82f610' },
  'Staff': { label: 'Nhân viên', color: '#22c55e', bg: '#22c55e10' },
};

// Get initials from a full name
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Generate a consistent avatar color from name
function nameToColor(name: string) {
  const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1', '#f43f5e'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const EMPTY_FORM = { fullName: '', email: '', phone: '', departmentId: '', positionId: '', status: 'ACTIVE' };

export function StaffDirectoryScreen({ userRole }: { userRole?: HRRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cBg = isDark ? theme.colors.background : theme.colors.backgroundAlt;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const canEdit = userRole === 'admin' || userRole === 'hr_manager' || userRole === 'hr_director';

  // Fetch real data from API
  const { data: dashboardData } = useHRDashboard();
  const { data: employeesData, isLoading, error } = useEmployees({
    search: searchText || undefined,
    status: activeFilter !== 'all' ? activeFilter : undefined,
  });
  const createEmployee = useCreateEmployee();
  const { data: rawDepts } = useDepartments();
  const { data: rawPositions } = usePositions();
  const deptOptions = Array.isArray(rawDepts) ? rawDepts : (rawDepts as any)?.data ?? [];
  const posOptions = Array.isArray(rawPositions) ? rawPositions : (rawPositions as any)?.data ?? [];

  const rawList = employeesData?.data ?? employeesData;
  const employees = Array.isArray(rawList) ? rawList : [];
  const total = employeesData?.meta?.total || employees.length;

  // Extract dashboard data safely
  const db = (dashboardData as any)?.data ?? dashboardData ?? {};

  // Stats from dashboard
  const statCards = [
    { label: 'Tổng nhân sự', value: db?.totalEmployees ?? 0, icon: Users, color: '#ec4899', gradient: ['#ec4899', '#be185d'] },
    { label: 'Phòng ban', value: db?.departmentCount ?? 0, icon: Building, color: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'] },
    { label: 'Thử việc', value: db?.probationEmployees ?? 0, icon: Star, color: '#f59e0b', gradient: ['#f59e0b', '#d97706'] },
    { label: 'Nghỉ phép', value: db?.onLeaveCount ?? 0, icon: Target, color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
  ];

  const handleSubmit = async () => {
    if (!form.fullName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Vui lòng nhập họ tên nhân viên');
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập họ tên nhân viên');
      }
      return;
    }
    try {
      const payload: any = { fullName: form.fullName, email: form.email || undefined, phone: form.phone || undefined };
      if (form.departmentId) payload.departmentId = form.departmentId;
      if (form.positionId) payload.positionId = form.positionId;
      await createEmployee.mutateAsync(payload);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Có lỗi xảy ra';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Lỗi', msg);
      }
    }
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: cBg }}>
      {/* ── Add Employee Modal ── */}
      <Modal visible={showForm} transparent animationType="fade" onRequestClose={() => setShowForm(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setShowForm(false)}
        >
          <Pressable
            style={{
              width: '90%', maxWidth: 480, backgroundColor: isDark ? '#1e293b' : '#fff',
              borderRadius: 24, padding: 28,
              ...(Platform.OS === 'web' ? { boxShadow: '0 25px 50px rgba(0,0,0,0.25)' } : {}),
            }}
            onPress={() => {}} // prevent close on inner press
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>Thêm hồ sơ nhân viên</Text>
              <Pressable onPress={() => setShowForm(false)} style={{ padding: 4 }}>
                <X size={22} color={cSub} />
              </Pressable>
            </View>

            <View style={{ gap: 14 }}>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Họ và tên *</Text>
                <TextInput value={form.fullName} onChangeText={v => setForm(f => ({ ...f, fullName: v }))} placeholder="Nguyễn Văn A" placeholderTextColor={cSub} style={inputStyle} />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Phòng ban</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {deptOptions.map((d: any) => (
                    <Pressable key={d.id} onPress={() => setForm(f => ({ ...f, departmentId: f.departmentId === d.id ? '' : d.id }))} style={{
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
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</Text>
                <TextInput value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="email@sgroup.vn" placeholderTextColor={cSub} style={inputStyle} keyboardType="email-address" />
              </View>
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Số điện thoại</Text>
                <TextInput value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} placeholder="0901234567" placeholderTextColor={cSub} style={inputStyle} keyboardType="phone-pad" />
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                <Pressable
                  onPress={() => setShowForm(false)}
                  style={{
                    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '800', color: cSub }}>Hủy</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={createEmployee.isPending}
                  style={{
                    flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
                    backgroundColor: createEmployee.isPending ? '#94a3b8' : '#ec4899',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>
                    {createEmployee.isPending ? 'Đang lưu...' : 'Tạo hồ sơ'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 28, gap: 20, paddingBottom: 120 }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
              onPress={() => setShowForm(true)}
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
        </View>

        {/* ── Stat Cards ── */}
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {statCards.map((sc, i) => {
            const Icon = sc.icon;
            return (
              <View key={i} style={{
                flex: 1, minWidth: 200, borderRadius: 18, padding: 20,
                backgroundColor: cardBg,
                borderWidth: 1, borderColor,
                ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' as any } : {}),
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <View style={{
                    width: 42, height: 42, borderRadius: 14,
                    backgroundColor: sc.color + '15',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={sc.color} />
                  </View>
                </View>
                <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -1 }}>
                  {typeof sc.value === 'number' ? fmt(sc.value) : sc.value}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: cSub, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {sc.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── Search & Filter ── */}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
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
        </View>

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
        ) : !isLoading && !error && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {employees.map((staff: any, idx: number) => {
              const posLevel = staff.position?.level || 'Staff';
              const roleConf = ROLE_CONFIG[posLevel] || { label: posLevel, color: '#64748b', bg: '#f1f5f9' };
              const avatarColor = nameToColor(staff.fullName || '');
              const deptName = staff.department?.name || '—';

              return (
                <Pressable
                  key={staff.id}
                  style={{
                    flex: 1, minWidth: 340, maxWidth: 440,
                    borderRadius: 20, padding: 0, overflow: 'hidden',
                    backgroundColor: cardBg,
                    borderWidth: 1, borderColor,
                    ...(Platform.OS === 'web' ? {
                      cursor: 'pointer' as any,
                      transition: 'all 0.25s ease' as any,
                    } : {}),
                  }}
                >
                  {/* Top accent bar */}
                  <View style={{ height: 3, backgroundColor: avatarColor, opacity: 0.6 }} />

                  <View style={{ padding: 22 }}>
                    {/* Avatar + Name + Code */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                      <View style={{
                        width: 50, height: 50, borderRadius: 16,
                        backgroundColor: avatarColor + '18',
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderColor: avatarColor + '30',
                      }}>
                        <Text style={{ fontSize: 17, fontWeight: '900', color: avatarColor }}>
                          {getInitials(staff.fullName || '')}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: cText, letterSpacing: -0.3 }}>{staff.fullName}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <Hash size={11} color={cSub} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: cSub }}>{staff.employeeCode}</Text>
                        </View>
                      </View>
                      {/* Role badge */}
                      <View style={{
                        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
                        backgroundColor: roleConf.bg,
                        borderWidth: 1, borderColor: roleConf.color + '20',
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: roleConf.color, letterSpacing: 0.3 }}>
                          {staff.position?.name || roleConf.label}
                        </Text>
                      </View>
                    </View>

                    {/* Department badge */}
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 8,
                      paddingBottom: 16, marginBottom: 16,
                      borderBottomWidth: 1, borderBottomColor: borderColor,
                    }}>
                      <View style={{
                        width: 26, height: 26, borderRadius: 8,
                        backgroundColor: '#8b5cf615',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Building size={12} color="#8b5cf6" />
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: deptName !== '—' ? cText : cSub }}>
                        {deptName}
                      </Text>
                      <View style={{
                        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 'auto',
                        backgroundColor: staff.status === 'ACTIVE' ? '#dcfce7' : staff.status === 'PROBATION' ? '#dbeafe' : '#fef3c7',
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: staff.status === 'ACTIVE' ? '#16a34a' : staff.status === 'PROBATION' ? '#2563eb' : '#d97706' }}>
                          {staff.status === 'ACTIVE' ? 'ĐANG LÀM' : staff.status === 'PROBATION' ? 'THỬ VIỆC' : staff.status === 'ON_LEAVE' ? 'ĐANG NGHỈ' : staff.status}
                        </Text>
                      </View>
                    </View>

                    {/* Contact info row */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12, backgroundColor: isDark ? 'rgba(59,130,246,0.06)' : '#eff6ff' }}>
                        <Mail size={14} color="#3b82f6" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: cText }} numberOfLines={1}>{staff.email || '—'}</Text>
                      </View>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 12, backgroundColor: isDark ? 'rgba(139,92,246,0.06)' : '#f5f3ff' }}>
                        <Phone size={14} color="#8b5cf6" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: cText }}>{staff.phone || '—'}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
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

