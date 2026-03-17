/**
 * SGROUP ERP — Admin Module Shell
 * System Administration workspace with Sidebar + TopBar + Content Area
 */
import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, Platform } from 'react-native';
import { AdminSidebar, AdminSidebarItem } from './AdminSidebar';
import { SGTopBar } from '../../shared/ui';
import { useTheme, typography } from '../../shared/theme/theme';
import { useThemeStore } from '../../shared/theme/themeStore';
import { useAuthStore } from '../auth/store/authStore';

// Import Screens
import { AdminDashboard } from './screens/AdminDashboard';
import { OrgConfigScreen } from '../hr/screens/OrgConfigScreen';
import { UserManagementScreen } from './screens/UserManagementScreen';

// Placeholder for screens under development
function PlaceholderScreen({ label }: { label: string }) {
  const colors = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 }}>
      <Text style={{ fontSize: 60, marginBottom: 24 }}>🔧</Text>
      <Text style={[typography.h3, { color: colors.text, marginBottom: 8 }]}>Đang phát triển</Text>
      <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', maxWidth: 400 }]}>
        Tính năng "{label}" sẽ được triển khai trong bản cập nhật tiếp theo.
      </Text>
    </View>
  );
}

const KEY_TO_COMPONENT: Record<string, React.ComponentType<any>> = {
  ADMIN_DASHBOARD: AdminDashboard,
  ADMIN_ORG_CONFIG: OrgConfigScreen,
  ADMIN_USERS: UserManagementScreen,
  ADMIN_ROLES: () => <PlaceholderScreen label="Phân quyền" />,
  ADMIN_SYSTEM: () => <PlaceholderScreen label="Cài đặt hệ thống" />,
};

export function AdminShell() {
  const [activeKey, setActiveKey] = useState('ADMIN_DASHBOARD');
  const [activeLabel, setActiveLabel] = useState('Tổng quan');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();

  const handleSelect = (item: AdminSidebarItem) => {
    setActiveKey(item.key);
    setActiveLabel(item.label);
    setActiveSection(item.section);
  };

  const ContentComponent = KEY_TO_COMPONENT[activeKey] || (() => <PlaceholderScreen label={activeLabel} />);

  const sectionLabels: Record<string, string> = {
    dashboard: 'TỔNG QUAN',
    organization: 'CẤU HÌNH TỔ CHỨC',
    users: 'NGƯỜI DÙNG',
    system: 'HỆ THỐNG',
  };

  const breadcrumb = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[typography.micro, { color: colors.textTertiary, opacity: 0.8 }]}>
        {sectionLabels[activeSection] || 'ADMIN'}
      </Text>
      <View style={[styles.breadcrumbDot, { backgroundColor: '#6366f1' }]} />
      <Text style={[typography.micro, { color: '#6366f1', fontWeight: '800' }]}>
        {activeLabel.toUpperCase()}
      </Text>
    </View>
  );

  return (
    <View style={[styles.shell, { backgroundColor: isDark ? '#05070A' : '#F8FAFC' }]}>
      {/* Aurora backdrop */}
      {Platform.OS === 'web' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.aurora, {
            top: '-10%', left: '-5%', width: 1000, height: 1000,
            backgroundColor: isDark ? 'rgba(99,102,241,0.10)' : 'rgba(99,102,241,0.05)',
            filter: 'blur(100px)',
          } as any]} />
          <View style={[styles.aurora, {
            bottom: '-15%', right: '-8%', width: 900, height: 900,
            backgroundColor: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.04)',
            filter: 'blur(120px)',
          } as any]} />
        </View>
      )}

      {/* Sidebar */}
      <View style={{ zIndex: 1000 }}>
        <AdminSidebar
          activeKey={activeKey}
          onSelect={handleSelect}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />
      </View>

      {/* Main Area */}
      <View style={styles.mainArea}>
        <View style={styles.topBarWrapper}>
          <SGTopBar
            title={activeLabel}
            breadcrumb={breadcrumb}
            userName={user?.name || 'Admin'}
            userRole="SYSTEM ADMIN"
          />
        </View>
        <View style={styles.content}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ContentComponent />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', height: Platform.OS === 'web' ? '100vh' as any : '100%' },
  mainArea: { flex: 1, position: 'relative', zIndex: 1 },
  aurora: { position: 'absolute', pointerEvents: 'none', borderRadius: 999 },
  topBarWrapper: {
    zIndex: 100,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}),
  } as any,
  breadcrumbDot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 8 },
  content: { flex: 1, zIndex: 1 },
  scrollContent: { paddingBottom: 40 },
});
