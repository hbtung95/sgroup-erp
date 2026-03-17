/**
 * AdminSidebar — System Administration Sidebar
 * Sections: Dashboard, Org Config, System Settings
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { useTheme } from '../../shared/theme/theme';
import { useThemeStore } from '../../shared/theme/themeStore';
import { useAuthStore } from '../auth/store/authStore';
import {
  LayoutDashboard, Building, Users, Settings, ChevronLeft, ChevronRight,
  LogOut, UserCircle, Plus, Shield, Database, Globe, Bell,
} from 'lucide-react-native';
import { SGThemeToggle } from '../../shared/ui/components/SGThemeToggle';
import { LinearGradient } from 'expo-linear-gradient';

export interface AdminSidebarItem {
  key: string;
  label: string;
  icon: any;
  section: 'dashboard' | 'organization' | 'system';
}

const SIDEBAR_ITEMS: AdminSidebarItem[] = [
  // Dashboard
  { key: 'ADMIN_DASHBOARD',   label: 'Tổng quan',              icon: LayoutDashboard, section: 'dashboard' },

  // Organization
  { key: 'ADMIN_ORG_CONFIG',  label: 'Phòng ban & Team',       icon: Building,        section: 'organization' },
  { key: 'ADMIN_POSITIONS',   label: 'Chức vụ',                icon: Users,           section: 'organization' },

  // System
  { key: 'ADMIN_ROLES',       label: 'Phân quyền',             icon: Shield,          section: 'system' },
  { key: 'ADMIN_SYSTEM',      label: 'Cài đặt hệ thống',      icon: Settings,        section: 'system' },
];

interface Props {
  activeKey: string;
  onSelect: (item: AdminSidebarItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ activeKey, onSelect, collapsed, onToggleCollapse }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { logout, user } = useAuthStore();

  const sections = [
    { key: 'dashboard',     label: '' },
    { key: 'organization',  label: 'CẤU HÌNH TỔ CHỨC' },
    { key: 'system',        label: 'HỆ THỐNG' },
  ];

  const renderItem = (item: AdminSidebarItem) => {
    const isActive = activeKey === item.key;
    const IconComp = item.icon;
    return (
      <TouchableOpacity
        key={item.key}
        onPress={() => onSelect(item)}
        style={[styles.menuItem, {
          backgroundColor: isActive ? (isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff') : 'transparent',
          borderRadius: 16, marginHorizontal: 12, marginBottom: 4, paddingVertical: 12, paddingHorizontal: 12,
          ...(isActive && !isDark && Platform.OS === 'web' ? { boxShadow: '0 4px 14px rgba(99,102,241,0.12)' } : {}),
        } as any]}
      >
        <View style={{ width: 24, alignItems: 'center', justifyContent: 'center' }}>
          <IconComp size={20} color={isActive ? '#6366f1' : (isDark ? '#94A3B8' : '#64748b')} strokeWidth={isActive ? 2.5 : 2} />
        </View>
        {!collapsed && (
          <Text style={{
            fontSize: 14, fontWeight: isActive ? '800' : '600',
            fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
            color: isActive ? '#6366f1' : (isDark ? '#E2E8F0' : '#475569'),
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
            colors={isDark ? ['#6366f1', '#8b5cf6'] : ['#6366f1', '#4f46e5']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{
              width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
              ...(Platform.OS === 'web' ? {
                boxShadow: isDark
                  ? '0 4px 16px rgba(99,102,241,0.3), 0 0px 8px rgba(139,92,246,0.2)'
                  : '0 4px 14px rgba(99,102,241,0.25)',
              } : { shadowColor: '#6366f1', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 }),
            } as any}
          >
            <Settings size={16} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
          {!collapsed && (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: isDark ? '#fff' : '#0f172a', letterSpacing: 0.8, fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>QUẢN TRỊ</Text>
              <Text style={{ fontSize: 10, fontWeight: '600', color: isDark ? '#818cf8' : '#6366f1', letterSpacing: 2, marginTop: 1, fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>SYSTEM ADMIN</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onToggleCollapse} style={[styles.collapseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
          {collapsed ? <ChevronRight size={14} color={isDark ? '#94A3B8' : '#64748b'} strokeWidth={2.5} /> : <ChevronLeft size={14} color={isDark ? '#94A3B8' : '#64748b'} strokeWidth={2.5} />}
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 16 }}>
        {sections.map(sec => {
          const sectionItems = SIDEBAR_ITEMS.filter(i => i.section === sec.key);
          if (sectionItems.length === 0) return null;
          return (
            <View key={sec.key}>
              {!collapsed && sec.label !== '' && (
                <Text style={styles.sectionLabel}>{sec.label}</Text>
              )}
              {sectionItems.map(renderItem)}
              <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
            </View>
          );
        })}
      </ScrollView>

      {/* User + Footer */}
      <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
            <UserCircle size={20} color={isDark ? '#fff' : '#475569'} />
          </View>
          {!collapsed && (
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#fff' : '#0f172a' }}>{user?.name || 'Admin'}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b' }}>System Admin</Text>
            </View>
          )}
        </View>
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
    alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1,
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
