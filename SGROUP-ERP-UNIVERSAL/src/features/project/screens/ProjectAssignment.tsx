import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme, typography } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard, SGButton } from '../../../shared/ui';
import { ShieldCheck, Users, Search, MoreVertical, Edit2, Mail, X } from 'lucide-react-native';
import { useAssignments } from '../hooks/useProject';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

// Data from API

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Project Manager': return '#10b981';
    case 'Sales Director': return '#8b5cf6';
    case 'Sales Manager': return '#f59e0b';
    default: return '#3b82f6';
  }
};

export function ProjectAssignment() {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: rawAssignments, isLoading } = useAssignments();
  const allUsers = (rawAssignments || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    email: a.email || '',
    role: a.role,
    projects: a.projectId ? [a.projectId] : [],
    status: a.status,
    date: new Date(a.assignedAt).toLocaleDateString('vi-VN'),
  }));

  const filteredUsers = allUsers.filter((u: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      {/* Aurora Backdrop */}
      {Platform.OS === 'web' && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 0, overflow: 'hidden' }]} pointerEvents="none">
          <View style={{
            position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400,
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.03)' : 'rgba(139, 92, 246, 0.02)',
            borderRadius: 200,
          } as any} />
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { zIndex: 1 }]}>
        <View>
          <Text style={[typography.h1, { color: colors.text, fontWeight: '800', letterSpacing: -0.5 }]}>Phân quyền Dự án</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8, fontSize: 15 }]}>
            Thiết lập quyền phân phối và truy cập dự án cho nhân sự
          </Text>
        </View>
        <SGButton title="Thêm Nhân sự" icon={<Users size={18} color="#fff" />} variant="primary" onPress={() => {}} 
          style={{ backgroundColor: '#10b981' }} />
      </View>

      <View style={[styles.sectionCard, isDark ? styles.glassCardDark : styles.glassCardLight, Platform.OS === 'web' && styles.glassEffect as any, { zIndex: 1 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : '#f5f3ff', justifyContent: 'center', alignItems: 'center' }}>
              <ShieldCheck size={18} color="#8b5cf6" />
            </View>
            <Text style={[typography.h4, { color: colors.text, fontWeight: '800' }]}>Danh sách Cán bộ Phụ trách</Text>
          </View>
          <View style={[styles.searchBox, { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)', 
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' 
          }]}>
            <Search size={16} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text, outlineStyle: 'none' as any }]}
              placeholder="Tìm nhân sự..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={14} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.tableHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
            <Text style={[typography.micro, { color: colors.textTertiary, flex: 2, fontWeight: '700' }]}>NHÂN SỰ</Text>
            <Text style={[typography.micro, { color: colors.textTertiary, flex: 1.5, fontWeight: '700' }]}>VAI TRÒ</Text>
            <Text style={[typography.micro, { color: colors.textTertiary, flex: 2, fontWeight: '700' }]}>DỰ ÁN PHỤ TRÁCH</Text>
            <Text style={[typography.micro, { color: colors.textTertiary, width: 100, textAlign: 'center', fontWeight: '700' }]}>TRẠNG THÁI</Text>
            <Text style={[typography.micro, { color: colors.textTertiary, width: 80, textAlign: 'right', fontWeight: '700' }]}></Text>
          </View>

          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
          ) : filteredUsers.map((user: any, idx: number) => (
            <View key={user.id} style={[styles.tableRow, { 
              borderBottomWidth: idx < filteredUsers.length - 1 ? 1 : 0,
              borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              backgroundColor: idx % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)'),
              borderRadius: 8,
            }]}>
              <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.avatarBox, { backgroundColor: `${getRoleColor(user.role)}15`, borderWidth: 1, borderColor: `${getRoleColor(user.role)}30` }]}>
                  <Text style={{ color: getRoleColor(user.role), fontWeight: '800', fontSize: 15 }}>{user.name.charAt(0)}</Text>
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>{user.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Mail size={11} color={colors.textTertiary} style={{ marginRight: 5 }} />
                    <Text style={[typography.micro, { color: colors.textTertiary, fontWeight: '500' }]}>{user.email}</Text>
                  </View>
                </View>
              </View>

              <View style={{ flex: 1.5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ShieldCheck size={14} color={getRoleColor(user.role)} style={{ marginRight: 6 }} />
                  <Text style={[typography.body, { color: getRoleColor(user.role), fontWeight: '700', fontSize: 13 }]}>{user.role}</Text>
                </View>
              </View>

              <View style={{ flex: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {user.projects.map(p => (
                  <View key={p} style={[styles.projectTag, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <Text style={[typography.micro, { color: colors.textSecondary, fontWeight: '600' }]}>{p}</Text>
                  </View>
                ))}
              </View>

              <View style={{ width: 100, alignItems: 'center' }}>
                <View style={[styles.statusBadge, { 
                  backgroundColor: user.status === 'ACTIVE' ? (isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5') : (isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2'),
                  borderWidth: 1,
                  borderColor: user.status === 'ACTIVE' ? (isDark ? 'rgba(16,185,129,0.25)' : '#a7f3d0') : (isDark ? 'rgba(239,68,68,0.25)' : '#fca5a5'),
                }]}>
                  <Text style={[typography.micro, { 
                    color: user.status === 'ACTIVE' ? '#10b981' : '#ef4444', fontWeight: '800', fontSize: 10 
                  }]}>
                    {user.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'KHÓA'}
                  </Text>
                </View>
              </View>

              <View style={{ width: 80, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }]}>
                  <Edit2 size={15} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }]}>
                  <MoreVertical size={15} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: isDesktop ? 40 : 20, paddingBottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 44, borderRadius: 12, width: 280, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", fontSize: 14, height: '100%', fontWeight: '500' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 2 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 8 },
  avatarBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  projectTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  actionBtn: { padding: 8, borderRadius: 8 },
  sectionCard: { padding: 28, borderRadius: 20, flex: 1 },
  glassEffect: {
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any),
  },
  glassCardDark: { backgroundColor: 'rgba(30, 41, 59, 0.65)', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1, ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' } as any) },
  glassCardLight: { backgroundColor: 'rgba(255, 255, 255, 0.85)', borderColor: 'rgba(0, 0, 0, 0.04)', borderWidth: 1, ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)' } as any) },
});
