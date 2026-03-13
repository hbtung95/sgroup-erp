import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Image,
} from 'react-native';
import { useTheme, sgds, typography } from '../../shared/theme/theme';
import { useThemeStore } from '../../shared/theme/themeStore';
import { useAuthStore } from '../auth/store/authStore';
import {
  LayoutDashboard, Users, UserCog, Building, Target,
  BarChart3, RefreshCw, FileText, ChevronLeft, ChevronRight, LogOut, LayoutGrid,
  Users2, Briefcase, CalendarDays, UserCircle, Wallet, FolderOpen, BookOpen,
  HandCoins, Ticket, CalendarCheck, Clock, Calculator, GraduationCap, Landmark, Trophy
} from 'lucide-react-native';
import { SGThemeToggle } from '../../shared/ui/components/SGThemeToggle';
import { SGButton } from '../../shared/ui/components';
import { LinearGradient } from 'expo-linear-gradient';

export type SalesRole = 'sales' | 'team_lead' | 'sales_manager' | 'sales_director' | 'ceo' | 'sales_admin';

export interface SalesSidebarItem {
  key: string;
  label: string;
  icon: any;
  section: 'dashboard' | 'sales_crm' | 'team' | 'sales_ops' | 'finance' | 'resources' | 'admin';
  minRole: SalesRole[];
}

const ALL_ROLES: SalesRole[] = ['sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin'];

const SIDEBAR_ITEMS: SalesSidebarItem[] = [
  // Dashboard
  { key: 'SALES_DASHBOARD',     label: 'Tổng quan',          icon: LayoutDashboard, section: 'dashboard',  minRole: ALL_ROLES },
  
  // KHÁCH HÀNG & CRM
  { key: 'SALES_CRM',           label: 'Khách hàng & Leads', icon: Users2,          section: 'sales_crm', minRole: ALL_ROLES },
  { key: 'SALES_INVENTORY',     label: 'Giỏ hàng & Bảng giá',icon: LayoutGrid,      section: 'sales_crm', minRole: ALL_ROLES },

  // QUẢN LÝ TEAM (moved above BÁN HÀNG)
  { key: 'SALES_TEAMS',         label: 'Quản lý Team',       icon: Users,           section: 'team',      minRole: ['team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin'] },
  { key: 'SALES_STAFF',         label: 'Nhân sự Sales',      icon: UserCog,         section: 'team',      minRole: ['team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin'] },
  { key: 'SALES_TEAM_REPORT',   label: 'Báo cáo Team',       icon: FileText,        section: 'team',      minRole: ['team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin'] },

  // BÁN HÀNG
  { key: 'SALES_ACTIVITY_LOG',  label: 'Nhật ký hoạt động',  icon: CalendarDays,    section: 'sales_ops', minRole: ALL_ROLES },
  { key: 'SALES_APPOINTMENTS',  label: 'Lịch hẹn khách',      icon: CalendarCheck,   section: 'sales_ops', minRole: ALL_ROLES },
  { key: 'SALES_BOOKING',       label: 'Giữ chỗ',            icon: Ticket,          section: 'sales_ops', minRole: ALL_ROLES },
  { key: 'SALES_DEPOSIT',       label: 'Đặt cọc',            icon: Landmark,        section: 'sales_ops', minRole: ALL_ROLES },
  { key: 'SALES_DEALS',         label: 'Giao dịch',          icon: Briefcase,       section: 'sales_ops', minRole: ALL_ROLES },
  { key: 'SALES_DEAL_RECORDING', label: 'Ghi nhận Deal',      icon: FileText,        section: 'sales_ops', minRole: ALL_ROLES },
  { key: 'SALES_KPI',           label: 'Bảng KPI',           icon: Trophy,          section: 'sales_ops', minRole: ALL_ROLES },

  // TÀI CHÍNH
  { key: 'SALES_TIMEKEEPING',   label: 'Chấm công',          icon: Clock,           section: 'finance',   minRole: ALL_ROLES },
  { key: 'SALES_PAYROLL',       label: 'Lương định kỳ',      icon: Wallet,          section: 'finance',   minRole: ALL_ROLES },
  { key: 'SALES_COMMISSION',    label: 'Hoa hồng',           icon: HandCoins,       section: 'finance',   minRole: ALL_ROLES },

  // TÀI NGUYÊN
  { key: 'SALES_LOAN_CALC',     label: 'Công cụ tính vay',   icon: Calculator,      section: 'resources', minRole: ALL_ROLES },
  { key: 'SALES_PROJECT_DOCS',  label: 'Tài liệu Dự án',     icon: FolderOpen,      section: 'resources', minRole: ALL_ROLES },
  { key: 'SALES_POLICIES',      label: 'Chính sách',         icon: BookOpen,        section: 'resources', minRole: ALL_ROLES },
  { key: 'SALES_TRAINING',      label: 'Đào tạo',            icon: GraduationCap,   section: 'resources', minRole: ALL_ROLES },
  
  // QUẢN TRỊ KINH DOANH (Director+)
  { key: 'SALES_PROJECTS',      label: 'Dự án BĐS',          icon: Building,        section: 'admin',     minRole: ['sales_director', 'ceo', 'sales_admin'] },
  { key: 'SALES_TARGETS',       label: 'Phân bổ Target',     icon: Target,          section: 'admin',     minRole: ['sales_director', 'ceo', 'sales_admin'] },
  { key: 'SALES_PLAN_ACTUAL',   label: 'Plan vs Actual',     icon: BarChart3,       section: 'admin',     minRole: ALL_ROLES },
  { key: 'SALES_CRM_VIEWER',    label: 'Đối chiếu CRM',      icon: RefreshCw,       section: 'admin',     minRole: ['sales_director', 'sales_admin'] },
];

interface Props {
  activeKey: string;
  onSelect: (item: SalesSidebarItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: SalesRole;
}

export function SalesSidebar({ activeKey, onSelect, collapsed, onToggleCollapse, userRole = 'sales' }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { logout } = useAuthStore();
  const isActiveKeyProfile = activeKey === 'SALES_MY_PROFILE';

  const visibleItems = SIDEBAR_ITEMS.filter(item => item.minRole.includes(userRole));
  const sections = [
    { key: 'dashboard',  label: '' },
    { key: 'sales_crm',  label: 'KHÁCH HÀNG & CRM' },
    { key: 'team',       label: 'QUẢN LÝ TEAM' },
    { key: 'sales_ops',  label: 'BÁN HÀNG' },
    { key: 'finance',    label: 'TÀI CHÍNH' },
    { key: 'resources',  label: 'TÀI NGUYÊN' },
    { key: 'admin',      label: 'QUẢN TRỊ KINH DOANH' },
  ];

  const renderItem = (item: SalesSidebarItem) => {
    const isActive = activeKey === item.key;
    const IconComp = item.icon;
    return (
      <TouchableOpacity
        key={item.key}
        onPress={() => onSelect(item)}
        style={[styles.menuItem, {
          backgroundColor: isActive ? (isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
          borderRadius: 16, marginHorizontal: 12, marginBottom: 4, paddingVertical: 12, paddingHorizontal: 12,
          ...(isActive && !isDark && Platform.OS === 'web' ? { boxShadow: '0 4px 14px rgba(59,130,246,0.12)' } : {}),
        } as any]}
      >
        <View style={{ width: 24, alignItems: 'center', justifyContent: 'center' }}>
          <IconComp size={20} color={isActive ? '#3b82f6' : (isDark ? '#94A3B8' : '#64748b')} strokeWidth={isActive ? 2.5 : 2} />
        </View>
        {!collapsed && (
          <Text style={{
            fontSize: 14, fontWeight: isActive ? '800' : '600',
            fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
            color: isActive ? '#3b82f6' : (isDark ? '#E2E8F0' : '#475569'),
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
            colors={isDark ? ['#0ea5e9', '#6366f1'] : ['#3b82f6', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 38, height: 38, borderRadius: 12,
              justifyContent: 'center', alignItems: 'center',
              ...(Platform.OS === 'web' ? {
                boxShadow: isDark
                  ? '0 4px 16px rgba(14,165,233,0.3), 0 0px 8px rgba(99,102,241,0.2)'
                  : '0 4px 14px rgba(59,130,246,0.25)',
              } : {
                shadowColor: '#3b82f6', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
              }),
            } as any}
          >
            <Text style={{
              fontSize: 15, fontWeight: '900', color: '#fff',
              letterSpacing: 1.5,
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            }}>SG</Text>
          </LinearGradient>
          {/* Brand Text */}
          {!collapsed && (
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14, fontWeight: '800', color: isDark ? '#fff' : '#0f172a',
                letterSpacing: 0.8,
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              }}>KINH DOANH</Text>
              <Text style={{
                fontSize: 10, fontWeight: '600',
                color: isDark ? '#0ea5e9' : '#3b82f6',
                letterSpacing: 2, marginTop: 1,
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              }}>SALES MODULE</Text>
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
      {/* Subtle gradient glow line under header */}
      {Platform.OS === 'web' && (
        <View style={{
          height: 1,
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(14,165,233,0.4), rgba(99,102,241,0.3), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), rgba(14,165,233,0.15), transparent)',
        } as any} />
      )}

      {/* Back to Home Button */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS === 'web') {
              window.location.hash = '';
              window.location.reload();
            }
          }}
          style={{
            height: 48, borderRadius: 14,
            backgroundColor: isDark ? 'rgba(14,165,233,0.15)' : '#f0f9ff',
            borderWidth: 1, borderColor: isDark ? 'rgba(14,165,233,0.3)' : '#bae6fd',
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <LayoutDashboard size={18} color={isDark ? '#38bdf8' : '#0284c7'} strokeWidth={2.5} />
          {!collapsed && <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#38bdf8' : '#0284c7' }}>Quay về Trang chủ</Text>}
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
          onPress={() => onSelect({ key: 'SALES_MY_PROFILE', label: 'Hồ sơ Của Tôi', icon: UserCircle, section: 'dashboard', minRole: ALL_ROLES })}
          style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 14, backgroundColor: activeKey === 'SALES_MY_PROFILE' ? (isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent' }}
        >
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
            <UserCircle size={20} color={isDark ? '#fff' : '#475569'} />
          </View>
          {!collapsed && (
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#fff' : '#0f172a' }}>Hồ Sơ Của Tôi</Text>
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
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
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
