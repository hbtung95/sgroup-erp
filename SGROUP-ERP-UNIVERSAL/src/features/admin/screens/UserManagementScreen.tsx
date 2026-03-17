/**
 * UserManagementScreen — Manage system users
 * List, search, filter by role, change role
 */
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Platform, ActivityIndicator, Alert, Modal } from 'react-native';
import {
  Users, Search, Shield, X, Pencil, UserCircle, Mail, Calendar, Filter,
} from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { useAdminUsers, useUpdateUser } from '../hooks/useAdmin';

const ROLE_OPTIONS = [
  { value: 'admin',    label: 'Admin',      color: '#ef4444' },
  { value: 'hr',       label: 'HR',         color: '#ec4899' },
  { value: 'employee', label: 'Nhân viên',  color: '#6366f1' },
  { value: 'sales',    label: 'Sales',      color: '#3b82f6' },
  { value: 'ceo',      label: 'CEO',        color: '#f59e0b' },
];

export function UserManagementScreen() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editRole, setEditRole] = useState('');

  const { data: rawData, isLoading } = useAdminUsers({ search: search || undefined, role: roleFilter || undefined });
  const updateUser = useUpdateUser();

  const users = useMemo(() => {
    if (!rawData) return [];
    return Array.isArray(rawData) ? rawData : rawData.data ?? [];
  }, [rawData]);

  const total = rawData?.meta?.total ?? users.length;

  const inputStyle: any = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: cText, flex: 1,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  };

  const showAlert = (msg: string) => {
    Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thông báo', msg);
  };

  const handleUpdateRole = async () => {
    if (!editUser) return;
    try {
      await updateUser.mutateAsync({ id: editUser.id, data: { role: editRole } });
      setEditModal(false);
      setEditUser(null);
    } catch (e: any) {
      showAlert(e?.response?.data?.message || e?.message || 'Lỗi');
    }
  };

  const getRoleStyle = (role: string) => {
    const r = ROLE_OPTIONS.find(o => o.value === role);
    return r || { label: role, color: '#64748b' };
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Edit Role Modal */}
      <Modal visible={editModal} transparent animationType="fade" onRequestClose={() => setEditModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setEditModal(false)}>
          <Pressable style={{
            width: '90%', maxWidth: 440, backgroundColor: isDark ? '#1e293b' : '#fff',
            borderRadius: 24, padding: 28,
            ...(Platform.OS === 'web' ? { boxShadow: '0 25px 50px rgba(0,0,0,0.25)' } : {}),
          } as any} onPress={() => {}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>Đổi vai trò</Text>
              <Pressable onPress={() => setEditModal(false)}><X size={20} color={cSub} /></Pressable>
            </View>

            {editUser && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: cText }}>{editUser.name}</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>{editUser.email}</Text>
              </View>
            )}

            <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, marginBottom: 10, textTransform: 'uppercase' }}>Chọn vai trò mới</Text>
            <View style={{ gap: 8 }}>
              {ROLE_OPTIONS.map(r => (
                <Pressable key={r.value} onPress={() => setEditRole(r.value)} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  padding: 14, borderRadius: 14,
                  backgroundColor: editRole === r.value ? `${r.color}15` : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                  borderWidth: 2, borderColor: editRole === r.value ? r.color : 'transparent',
                }}>
                  <Shield size={16} color={r.color} />
                  <Text style={{ fontSize: 14, fontWeight: editRole === r.value ? '800' : '600', color: editRole === r.value ? r.color : cText }}>{r.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <Pressable onPress={() => setEditModal(false)} style={{ flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: cSub }}>Hủy</Text>
              </Pressable>
              <Pressable onPress={handleUpdateRole} disabled={updateUser.isPending || editRole === editUser?.role} style={{
                flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
                backgroundColor: (updateUser.isPending || editRole === editUser?.role) ? '#94a3b8' : '#6366f1',
              }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{updateUser.isPending ? 'Đang lưu...' : 'Cập nhật'}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 28, gap: 20, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} color="#6366f1" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...sgds.typo.h2, color: cText }}>Quản lý Người dùng</Text>
            <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Tổng cộng {total} tài khoản</Text>
          </View>
        </View>

        {/* Search + Filter */}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            borderRadius: 14, paddingHorizontal: 14,
          }}>
            <Search size={16} color={cSub} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm theo tên, email..."
              placeholderTextColor={cSub}
              style={[inputStyle, { borderWidth: 0, paddingHorizontal: 0, backgroundColor: 'transparent' }]}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            <Pressable onPress={() => setRoleFilter('')} style={{
              paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
              backgroundColor: !roleFilter ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
            }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: !roleFilter ? '#fff' : cSub }}>Tất cả</Text>
            </Pressable>
            {ROLE_OPTIONS.map(r => (
              <Pressable key={r.value} onPress={() => setRoleFilter(roleFilter === r.value ? '' : r.value)} style={{
                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
                backgroundColor: roleFilter === r.value ? r.color : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
              }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: roleFilter === r.value ? '#fff' : cSub }}>{r.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* User List */}
        {isLoading ? (
          <View style={{ padding: 60, alignItems: 'center' }}><ActivityIndicator size="large" color="#6366f1" /></View>
        ) : users.length === 0 ? (
          <View style={{ padding: 60, alignItems: 'center', borderRadius: 20, backgroundColor: cardBg, borderWidth: 1, borderColor }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>👤</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: cSub }}>Không tìm thấy người dùng nào</Text>
          </View>
        ) : (
          <View style={{ borderRadius: 20, backgroundColor: cardBg, borderWidth: 1, borderColor, overflow: 'hidden' }}>
            {/* Table header */}
            <View style={{ flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
              <Text style={{ flex: 2, fontSize: 11, fontWeight: '800', color: cSub, textTransform: 'uppercase' }}>Người dùng</Text>
              <Text style={{ flex: 1.5, fontSize: 11, fontWeight: '800', color: cSub, textTransform: 'uppercase' }}>Email</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: '800', color: cSub, textTransform: 'uppercase' }}>Vai trò</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: '800', color: cSub, textTransform: 'uppercase' }}>Phòng ban</Text>
              <Text style={{ width: 90, fontSize: 11, fontWeight: '800', color: cSub, textTransform: 'uppercase' }}>Ngày tạo</Text>
              <Text style={{ width: 50, fontSize: 11, fontWeight: '800', color: cSub, textTransform: 'uppercase', textAlign: 'center' }}>Sửa</Text>
            </View>

            {/* Rows */}
            {users.map((u: any, i: number) => {
              const role = getRoleStyle(u.role);
              return (
                <View key={u.id} style={{
                  flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
                  borderBottomWidth: i < users.length - 1 ? 1 : 0, borderBottomColor: borderColor,
                }}>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: `${role.color}12`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: role.color }}>{u.name?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: cText }} numberOfLines={1}>{u.name}</Text>
                  </View>
                  <Text style={{ flex: 1.5, fontSize: 12, fontWeight: '600', color: cSub }} numberOfLines={1}>{u.email}</Text>
                  <View style={{ width: 100 }}>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: `${role.color}12`, alignSelf: 'flex-start' }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: role.color }}>{role.label}</Text>
                    </View>
                  </View>
                  <Text style={{ width: 100, fontSize: 12, fontWeight: '600', color: cSub }} numberOfLines={1}>{u.department || '—'}</Text>
                  <Text style={{ width: 90, fontSize: 11, fontWeight: '600', color: cSub }}>{new Date(u.createdAt).toLocaleDateString('vi')}</Text>
                  <View style={{ width: 50, alignItems: 'center' }}>
                    <Pressable onPress={() => { setEditUser(u); setEditRole(u.role); setEditModal(true); }} style={{
                      width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                    }}>
                      <Pencil size={13} color={cSub} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
