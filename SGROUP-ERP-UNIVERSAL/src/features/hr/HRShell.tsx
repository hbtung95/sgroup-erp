/**
 * SGROUP ERP — HR Module Shell
 * Main app shell with role-based Sidebar + TopBar + Content Area for HR Module
 */
import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, Platform } from 'react-native';
import { HRSidebar, HRSidebarItem, HRRole } from './HRSidebar';
import { SGTopBar } from '../../shared/ui';
import { useTheme, typography } from '../../shared/theme/theme';
import { useThemeStore } from '../../shared/theme/themeStore';
import { useAuthStore } from '../auth/store/authStore';
import { useHRRoute } from './hooks/useHRRoute';

// Import Screens
import { EmployeeProfileScreen } from './screens/EmployeeProfileScreen';
import { HRDashboard } from './screens/HRDashboard';
import { StaffDirectoryScreen } from './screens/StaffDirectoryScreen';
import { TimekeepingScreen } from './screens/TimekeepingScreen';
import { PayrollScreen } from './screens/PayrollScreen';
import { PerformanceScreen } from './screens/PerformanceScreen';
import { RecruitmentScreen } from './screens/RecruitmentScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { LeavesScreen } from './screens/LeavesScreen';
import { BenefitsScreen } from './screens/BenefitsScreen';
import { PoliciesScreen } from './screens/PoliciesScreen';

const KEY_TO_COMPONENT: Record<string, React.ComponentType<any>> = {
  HR_DASHBOARD: HRDashboard,
  HR_DIRECTORY: StaffDirectoryScreen,
  HR_PROFILE: EmployeeProfileScreen,
  HR_TIMEKEEPING: TimekeepingScreen,
  HR_LEAVES: LeavesScreen,
  HR_PAYROLL: PayrollScreen,
  HR_BENEFITS: BenefitsScreen,
  HR_PERFORMANCE: PerformanceScreen,
  HR_RECRUITMENT: RecruitmentScreen,
  HR_TRAINING: TrainingScreen,
  HR_POLICIES: PoliciesScreen,
  // Other keys will use the placeholder for now
};

export function HRShell() {
  const validKeys = useMemo(() => [
    'HR_DASHBOARD', 'HR_DIRECTORY', 'HR_PROFILE', 'HR_TIMEKEEPING', 'HR_LEAVES',
    'HR_PAYROLL', 'HR_BENEFITS', 'HR_RECRUITMENT', 'HR_PERFORMANCE', 'HR_TRAINING', 'HR_POLICIES'
  ], []);
  
  const { activeKey, navigate } = useHRRoute(validKeys);
  const [activeLabel, setActiveLabel] = useState('Tổng quan HR');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();

  // Determine HR role
  const userRole: HRRole = user?.role === 'admin' ? 'admin' : 'hr_staff'; // Default role if not provided

  const handleSelect = (item: HRSidebarItem) => {
    navigate(item.key);
    setActiveLabel(item.label);
    setActiveSection(item.section);
  };

  const ContentComponent = KEY_TO_COMPONENT[activeKey];

  const sectionLabels: Record<string, string> = {
    dashboard: 'TỔNG QUAN',
    directory: 'HỒ SƠ NHÂN SỰ',
    time_attendance: 'CHẤM CÔNG & NGHỈ PHÉP',
    payroll: 'LƯƠNG THƯỞNG (C&B)',
    recruitment: 'TUYỂN DỤNG',
    performance_training: 'ĐÁNH GIÁ & ĐÀO TẠO',
    admin: 'QUẢN TRỊ & HÀNH CHÍNH',
  };

  const breadcrumb = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[typography.micro, { color: colors.textTertiary, opacity: 0.8 }]}>
        {sectionLabels[activeSection] || 'HR'}
      </Text>
      <View style={[styles.breadcrumbDot, { backgroundColor: '#ec4899' }]} />
      <Text style={[typography.micro, { color: '#ec4899', fontWeight: '800' }]}>
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
            backgroundColor: isDark ? 'rgba(236,72,153,0.10)' : 'rgba(236,72,153,0.05)',
            filter: 'blur(100px)',
          } as any]} />
          <View style={[styles.aurora, {
            bottom: '-15%', right: '-8%', width: 900, height: 900,
            backgroundColor: isDark ? 'rgba(244,63,94,0.08)' : 'rgba(244,63,94,0.04)',
            filter: 'blur(120px)',
          } as any]} />
        </View>
      )}

      {/* Sidebar */}
      <View style={{ zIndex: 1000 }}>
        <HRSidebar
          activeKey={activeKey}
          onSelect={handleSelect}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
          userRole={userRole}
        />
      </View>

      {/* Main Area */}
      <View style={styles.mainArea}>
        <View style={styles.topBarWrapper}>
          <SGTopBar
            title={activeLabel}
            breadcrumb={breadcrumb}
            userName={user?.name || 'User'}
            userRole={userRole.replace(/_/g, ' ').toUpperCase()}
          />
        </View>
        <View style={styles.content}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {ContentComponent ? (
              <ContentComponent userRole={userRole} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={{ fontSize: 60, marginBottom: 24 }}>🚀</Text>
                <Text style={[typography.h3, { color: colors.text, marginBottom: 8 }]}>Module Đang Phát Triển</Text>
                <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', maxWidth: 400 }]}>
                  Tính năng "{activeLabel}" đang được phát triển.
                </Text>
              </View>
            )}
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
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
});
