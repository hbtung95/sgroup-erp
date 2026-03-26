/**
 * SGROUP ERP — Admin Module Shell (Premium Upgrade)
 * System Administration workspace with Sidebar + TopBar + Content Area
 * Uses SGAuroraBackground, token colors, Reanimated page transitions
 */
import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { AdminSidebar, AdminSidebarItem } from './AdminSidebar';
import { SGTopBar } from '../../shared/ui';
import { SGAuroraBackground } from '../../shared/ui/components/SGAuroraBackground';
import { SGBreadcrumb } from '../../shared/ui/components/SGBreadcrumb';
import { AdminErrorBoundary } from './components/AdminErrorBoundary';
import { useAppTheme } from '../../shared/theme/useAppTheme';
import { useAuthStore } from '../auth/store/authStore';

// Import Screens
import { AdminDashboard } from './presentation/screens/AdminDashboard';
import { OrgConfigScreen } from '../hr/screens/OrgConfigScreen';
import { UserManagementScreen } from './presentation/screens/UserManagementScreen';
import { RolePermissionScreen } from './presentation/screens/RolePermissionScreen';
import { SystemSettingsScreen } from './presentation/screens/SystemSettingsScreen';
import { AuditLogScreen } from './presentation/screens/AuditLogScreen';
import { FeatureFlagsScreen } from './presentation/screens/FeatureFlagsScreen';
import { AuditAnalyticsScreen } from './presentation/screens/AuditAnalyticsScreen';
import { ScheduledTasksScreen } from './presentation/screens/ScheduledTasksScreen';
import { ChangelogScreen } from './presentation/screens/ChangelogScreen';
import { NotificationCenter } from './components/NotificationCenter';
import { KeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';
import { CommandPalette } from './components/CommandPalette';

const KEY_TO_COMPONENT: Record<string, React.ComponentType<any>> = {
  ADMIN_DASHBOARD: AdminDashboard,
  ADMIN_ORG_CONFIG: OrgConfigScreen,
  ADMIN_USERS: UserManagementScreen,
  ADMIN_ROLES: RolePermissionScreen,
  ADMIN_SYSTEM: SystemSettingsScreen,
  ADMIN_FLAGS: FeatureFlagsScreen,
  ADMIN_AUDIT: AuditLogScreen,
  ADMIN_ANALYTICS: AuditAnalyticsScreen,
  ADMIN_TASKS: ScheduledTasksScreen,
  ADMIN_CHANGELOG: ChangelogScreen,
};

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'Tổng quan',
  organization: 'Cấu hình tổ chức',
  users: 'Người dùng',
  system: 'Hệ thống',
  audit: 'Nhật ký',
  tools: 'Công cụ',
};

export function AdminShell() {
  const [activeKey, setActiveKey] = useState('ADMIN_DASHBOARD');
  const [activeLabel, setActiveLabel] = useState('Tổng quan');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const { colors } = useAppTheme();
  const { user } = useAuthStore();
  const { width: windowWidth } = useWindowDimensions();

  // Auto-collapse sidebar on narrow viewport
  useEffect(() => {
    if (Platform.OS === 'web') {
      setCollapsed(windowWidth < 768);
    }
  }, [windowWidth]);

  const handleSelect = useCallback((item: AdminSidebarItem) => {
    setActiveKey(item.key);
    setActiveLabel(item.label);
    setActiveSection(item.section);
  }, []);

  const ContentComponent = KEY_TO_COMPONENT[activeKey] || AdminDashboard;

  const breadcrumbItems = [
    { label: 'Quản trị' },
    { label: SECTION_LABELS[activeSection] || 'Admin' },
    { label: activeLabel },
  ];

  return (
    <View style={[styles.shell, { backgroundColor: colors.bg }]}>
      {/* Aurora backdrop — premium animated ambient background */}
      <SGAuroraBackground />

      {/* Sidebar */}
      <View style={styles.sidebarWrapper}>
        <AdminSidebar
          activeKey={activeKey}
          onSelect={handleSelect}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />
      </View>

      {/* Main Area */}
      <View style={styles.mainArea}>
        <View style={[styles.topBarWrapper, Platform.OS === 'web' && ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)]}>
          <SGTopBar
            title={activeLabel}
            breadcrumb={<SGBreadcrumb items={breadcrumbItems} />}
            userName={user?.name || 'Admin'}
            userRole="SYSTEM ADMIN"
            rightContent={<NotificationCenter />}
          />
        </View>
        <View style={styles.content}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              key={activeKey}
              entering={FadeIn.duration(250)}
            >
              <AdminErrorBoundary>
                <ContentComponent />
              </AdminErrorBoundary>
            </Animated.View>
          </ScrollView>
        </View>
      </View>

      {/* Keyboard shortcuts overlay (web only, press ? to toggle) */}
      <KeyboardShortcutsPanel />

      {/* Command Palette (web only, Ctrl+K) */}
      <CommandPalette />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    height: Platform.OS === 'web' ? '100vh' as any : '100%',
  },
  sidebarWrapper: {
    zIndex: 1000,
  },
  mainArea: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  topBarWrapper: {
    zIndex: 100,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
