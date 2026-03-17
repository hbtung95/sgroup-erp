import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { useTheme, typography } from '../../shared/theme/theme';
import { useThemeStore } from '../../shared/theme/themeStore';
import { useAuthStore } from '../auth/store/authStore';
import {
  LayoutDashboard, Users, UserCog, CalendarCheck, FileText,
  ChevronLeft, ChevronRight, LogOut, Wallet, BookOpen,
  GraduationCap, TrendingUp, UserCircle, Plus, Briefcase, Building
} from 'lucide-react-native';
import { SGThemeToggle } from '../../shared/ui/components/SGThemeToggle';
import { LinearGradient } from 'expo-linear-gradient';

export type HRRole = 'hr_staff' | 'hr_manager' | 'hr_director' | 'admin' | 'ceo';

export interface HRSidebarItem {
  key: string;
  label: string;
  icon: any;
  section: 'dashboard' | 'directory' | 'time_attendance' | 'payroll' | 'recruitment' | 'performance_training' | 'admin';
  minRole: HRRole[];
}

const ALL_ROLES: HRRole[] = ['hr_staff', 'hr_manager', 'hr_director', 'admin', 'ceo'];

const SIDEBAR_ITEMS: HRSidebarItem[] = [
  // Dashboard
  { key: 'HR_DASHBOARD',     label: 'Tổng quan HR',         icon: LayoutDashboard, section: 'dashboard',  minRole: ALL_ROLES },
  
  // DIRECTORY
  { key: 'HR_DIRECTORY',     label: 'Danh bạ Nhân sự',      icon: Users,           section: 'directory',  minRole: ALL_ROLES },
  { key: 'HR_PROFILE',       label: 'Hồ sơ Chi tiết',       icon: UserCog,         section: 'directory',  minRole: ALL_ROLES },

  // TIME & ATTENDANCE
  { key: 'HR_TIMEKEEPING',   label: 'Chấm công',            icon: CalendarCheck,   section: 'time_attendance', minRole: ALL_ROLES },
  { key: 'HR_LEAVES',        label: 'Nghỉ phép & Đơn từ',   icon: FileText,        section: 'time_attendance', minRole: ALL_ROLES },

  // PAYROLL & C&B
  { key: 'HR_PAYROLL',       label: 'Bảng lương (Payroll)', icon: Wallet,          section: 'payroll',    minRole: ['hr_manager', 'hr_director', 'admin', 'ceo'] },
  { key: 'HR_BENEFITS',      label: 'Phúc lợi & BHXH',      icon: Briefcase,       section: 'payroll',    minRole: ['hr_manager', 'hr_director', 'admin', 'ceo'] },

  // RECRUITMENT
  { key: 'HR_RECRUITMENT',   label: 'Tuyển dụng (ATS)',     icon: UserCog,         section: 'recruitment',minRole: ALL_ROLES },

  // PERFORMANCE & TRAINING
  { key: 'HR_PERFORMANCE',   label: 'Đánh giá Năng lực',    icon: TrendingUp,      section: 'performance_training', minRole: ALL_ROLES },
  { key: 'HR_TRAINING',      label: 'Đào tạo & Phát triển', icon: GraduationCap,   section: 'performance_training', minRole: ALL_ROLES },

  // ADMIN / POLICY
  { key: 'HR_POLICIES',      label: 'Chính sách HR',        icon: BookOpen,        section: 'admin',      minRole: ALL_ROLES },
];

interface Props {
  activeKey: string;
  onSelect: (item: HRSidebarItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: HRRole;
}

export function HRSidebar({ activeKey, onSelect, collapsed, onToggleCollapse, userRole = 'hr_staff' }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { logout, user } = useAuthStore();

  const visibleItems = SIDEBAR_ITEMS.filter(item => item.minRole.includes(userRole));
  const sections = [
    { key: 'dashboard',             label: '' },
    { key: 'directory',             label: 'HỒ SƠ NHÂN SỰ' },
    { key: 'time_attendance',       label: 'CHẤM CÔNG & NGHỈ PHÉP' },
    { key: 'payroll',               label: 'LƯƠNG THƯỞNG (C&B)' },
    { key: 'recruitment',           label: 'TUYỂN DỤNG' },
    { key: 'performance_training',  label: 'ĐÁNH GIÁ & ĐÀO TẠO' },
    { key: 'admin',                 label: 'QUẢN TRỊ & HÀNH CHÍNH' },
  ];

  const renderItem = (item: HRSidebarItem) => {
    const isActive = activeKey === item.key;
    const IconComp = item.icon;
    return (
      <TouchableOpacity
        key={item.key}
        onPress={() => onSelect(item)}
        style={[styles.menuItem, {
          backgroundColor: isActive ? (isDark ? 'rgba(236,72,153,0.15)' : '#fdf2f8') : 'transparent',
          borderRadius: 16, marginHorizontal: 12, marginBottom: 4, paddingVertical: 12, paddingHorizontal: 12,
          ...(isActive && !isDark && Platform.OS === 'web' ? { boxShadow: '0 4px 14px rgba(236,72,153,0.12)' } : {}),
        } as any]}
      >
        <View style={{ width: 24, alignItems: 'center', justifyContent: 'center' }}>
          <IconComp size={20} color={isActive ? '#ec4899' : (isDark ? '#94A3B8' : '#64748b')} strokeWidth={isActive ? 2.5 : 2} />
        </View>
        {!collapsed && (
          <Text style={{
            fontSize: 14, fontWeight: isActive ? '800' : '600',
            fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
            color: isActive ? '#ec4899' : (isDark ? '#E2E8F0' : '#475569'),
            marginLeft: 14, flex: 1, letterSpacing: 0.2
          }} numberOfLines={1}>
            {item.label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.sidebar, {
      width: collapsed ? 80 : 260,
      backgroundColor: isDark ? 'rgba(15,20,32,0.8)' : 'rgba(255,255,255,0.9)',
      borderRightColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
      ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}),
    } as any]}>
      {/* Header — Premium Brand */}
      <View style={[styles.header, {
        borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: collapsed ? 0 : 12, flex: collapsed ? 0 : 1 }}>
          {/* Brand Badge with Gradient */}
          <LinearGradient
            colors={isDark ? ['#f43f5e', '#ec4899'] : ['#ec4899', '#f43f5e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 38, height: 38, borderRadius: 12,
              justifyContent: 'center', alignItems: 'center',
              ...(Platform.OS === 'web' ? {
                boxShadow: isDark
                  ? '0 4px 16px rgba(244,63,94,0.3), 0 0px 8px rgba(236,72,153,0.2)'
                  : '0 4px 14px rgba(236,72,153,0.25)',
              } : {
                shadowColor: '#ec4899', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
              }),
            } as any}
          >
            <Text style={{
              fontSize: 15, fontWeight: '900', color: '#fff',
              letterSpacing: 1.5,
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            }}>HR</Text>
          </LinearGradient>
          {/* Brand Text */}
          {!collapsed && (
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14, fontWeight: '800', color: isDark ? '#fff' : '#0f172a',
                letterSpacing: 0.8,
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              }}>NHÂN SỰ</Text>
              <Text style={{
                fontSize: 10, fontWeight: '600',
                color: isDark ? '#f43f5e' : '#ec4899',
                letterSpacing: 2, marginTop: 1,
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              }}>HR MODULE</Text>
            </View>
          )}
        </View>
        {/* Collapse Button */}
        <TouchableOpacity
          onPress={onToggleCollapse}
          style={[styles.collapseBtn, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }]}
        >
          {collapsed ? <ChevronRight size={14} color={isDark ? '#94A3B8' : '#64748b'} strokeWidth={2.5} /> : <ChevronLeft size={14} color={isDark ? '#94A3B8' : '#64748b'} strokeWidth={2.5} />}
        </TouchableOpacity>
      </View>

      {/* Quick Action Button */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <TouchableOpacity style={{
          height: 48, borderRadius: 14, backgroundColor: '#ec4899',
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          shadowColor: '#ec4899', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4
        }}>
          <Plus size={20} color="#fff" strokeWidth={3} />
          {!collapsed && <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Thêm Mới</Text>}
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
        {sections.map(sec => {
          const sectionItems = visibleItems.filter(i => i.section === sec.key);
          if (sectionItems.length === 0) return null;
          return (
            <View key={sec.key}>
              {!collapsed && (
                <Text style={styles.sectionLabel}>{sec.label}</Text>
              )}
              {sectionItems.map(renderItem)}
              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
            </View>
          );
        })}
      </ScrollView>

      {/* User Profile & Footer Area */}
      <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
        <TouchableOpacity 
          onPress={() => onSelect({ key: 'HR_PROFILE', label: 'Hồ sơ Của Tôi', icon: UserCircle, section: 'dashboard', minRole: ALL_ROLES })}
          style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 14, backgroundColor: activeKey === 'HR_PROFILE' ? (isDark ? 'rgba(236,72,153,0.15)' : '#fdf2f8') : 'transparent' }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
            <UserCircle size={20} color={isDark ? '#fff' : '#475569'} />
          </View>
          {!collapsed && (
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#fff' : '#0f172a' }}>{user?.name || 'User'}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', textTransform: 'capitalize' }}>{userRole.replace('_', ' ')}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, { borderTopWidth: 0, paddingVertical: 12, flexDirection: collapsed ? 'column' : 'row', justifyContent: collapsed ? 'center' : 'space-between' }]}>
        <SGThemeToggle size="sm" />
        <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)', marginTop: collapsed ? 12 : 0 }]}>
          <LogOut size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { borderRightWidth: 1, height: '100%' },
  header: {
    height: 80, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.02)',
  },
  collapseBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center' },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase',
    color: '#94A3B8', paddingHorizontal: 24, marginTop: 16, marginBottom: 10,
    fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  divider: { height: 1, marginHorizontal: 24, marginVertical: 6 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20, borderTopWidth: 1, gap: 8,
  },
  logoutBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
