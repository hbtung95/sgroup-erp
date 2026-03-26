import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { typography } from '../../../shared/theme/theme';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useAuthStore } from '../../auth/store/authStore';
import {
  LayoutDashboard, Building2, Grid3x3, ChevronLeft, ChevronRight, LogOut,
  FolderOpen, FileCheck, Users
} from 'lucide-react-native';
import { SGThemeToggle } from '../../../shared/ui/components/SGThemeToggle';
import { LinearGradient } from 'expo-linear-gradient';

export type ProjectRole = 'project_manager' | 'sales_director' | 'ceo' | 'admin' | 'sales_manager' | 'sales';

export interface ProjectSidebarItem {
  key: string;
  label: string;
  icon: any;
  section: 'dashboard' | 'master_data' | 'inventory' | 'settings';
  minRole: ProjectRole[];
}

const ALL_ROLES: ProjectRole[] = ['project_manager', 'sales_director', 'ceo', 'admin'];

const SIDEBAR_ITEMS: ProjectSidebarItem[] = [
  { key: 'PROJECT_DASHBOARD', label: 'Tá»•ng quan Dá»± Ã¡n', icon: LayoutDashboard, section: 'dashboard', minRole: ALL_ROLES },
  
  { key: 'PROJECT_LIST', label: 'Danh má»¥c Dá»± Ã¡n', icon: Building2, section: 'master_data', minRole: ALL_ROLES },
  { key: 'PROJECT_DOCS', label: 'TÃ i liá»‡u Dá»± Ã¡n', icon: FolderOpen, section: 'master_data', minRole: ALL_ROLES },
  
  { key: 'PROJECT_INVENTORY', label: 'Quáº£n lÃ½ Báº£ng hÃ ng', icon: Grid3x3, section: 'inventory', minRole: ALL_ROLES },
  { key: 'PROJECT_POLICIES', label: 'ChÃ­nh sÃ¡ch BÃ¡n hÃ ng', icon: FileCheck, section: 'inventory', minRole: ALL_ROLES },
  
  { key: 'PROJECT_ASSIGNMENT', label: 'PhÃ¢n quyá»n Dá»± Ã¡n', icon: Users, section: 'settings', minRole: ['admin', 'project_manager', 'sales_director', 'ceo'] },
];

interface Props {
  activeKey: string;
  onSelect: (item: ProjectSidebarItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: ProjectRole;
}

export function ProjectSidebar({ activeKey, onSelect, collapsed, onToggleCollapse, userRole = 'admin' }: Props) {
  const { colors, isDark } = useAppTheme();
  const { logout } = useAuthStore();

  const visibleItems = SIDEBAR_ITEMS.filter(item => item.minRole.includes(userRole as any) || userRole === 'admin');
  const sections = [
    { key: 'dashboard', label: 'DASHBOARD' },
    { key: 'master_data', label: 'Dá»® LIá»†U Dá»° ÃN' },
    { key: 'inventory', label: 'QUáº¢N LÃ Sáº¢N PHáº¨M' },
    { key: 'settings', label: 'Há»† THá»NG & CÃ€I Äáº¶T' },
  ];

  const renderItem = (item: ProjectSidebarItem) => {
    const isActive = activeKey === item.key;
    const IconComp = item.icon;
    return (
      <TouchableOpacity
        key={item.key}
        onPress={() => onSelect(item)}
        style={[styles.menuItem, {
          backgroundColor: isActive ? (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5') : 'transparent',
          borderRadius: 16, marginHorizontal: 12, marginBottom: 4, paddingVertical: 12, paddingHorizontal: 12,
          ...(isActive && !isDark && Platform.OS === 'web' ? { boxShadow: `0 4px 14px ${colors.success}20` } as any : {}),
        }]}
      >
        <View style={{ width: 24, alignItems: 'center', justifyContent: 'center' }}>
          <IconComp size={20} color={isActive ? colors.success : colors.textSecondary} strokeWidth={isActive ? 2.5 : 2} />
        </View>
        {!collapsed && (
          <Text style={{
            fontSize: 14, fontWeight: isActive ? '800' : '600',
            fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
            color: isActive ? colors.success : colors.text,
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
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: collapsed ? 0 : 12, flex: collapsed ? 0 : 1 }}>
          <LinearGradient
            colors={isDark ? ['#10b981', '#059669'] : ['#34d399', '#10b981']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{
              width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
              ...(Platform.OS === 'web' ? {
                boxShadow: '0 4px 14px rgba(16,185,129,0.25)',
              } : { shadowColor: '#10b981', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 }),
            } as any}
          >
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 1.5, fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>PR</Text>
          </LinearGradient>
          {!collapsed && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text, letterSpacing: 0.8, fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>Dá»° ÃN</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: colors.success, letterSpacing: 2, marginTop: 1, fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>MASTER DATA</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={onToggleCollapse}
          style={[styles.collapseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
        >
          {collapsed ? <ChevronRight size={14} color={colors.textSecondary} strokeWidth={2.5} /> : <ChevronLeft size={14} color={colors.textSecondary} strokeWidth={2.5} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16 }}>
        {sections.map(sec => {
          const sectionItems = visibleItems.filter(i => i.section === sec.key);
          if (sectionItems.length === 0) return null;
          return (
            <View key={sec.key}>
              {!collapsed && <Text style={styles.sectionLabel}>{sec.label}</Text>}
              {sectionItems.map(renderItem)}
              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { flexDirection: collapsed ? 'column' : 'row', justifyContent: collapsed ? 'center' : 'space-between' }]}>
        <SGThemeToggle size="sm" />
        <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)', marginTop: collapsed ? 12 : 0 }]}>
          <LogOut size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { borderRightWidth: 1, height: '100%' },
  header: { height: 80, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  collapseBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase', color: '#94A3B8', paddingHorizontal: 24, marginTop: 16, marginBottom: 10, fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif" }, // uses textSecondary shade
  divider: { height: 1, marginHorizontal: 24, marginVertical: 6 },
  footer: { paddingVertical: 16, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: 'transparent', gap: 8 },
  logoutBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
