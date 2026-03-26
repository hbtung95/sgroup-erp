/**
 * SGROUP ERP — Sales Module Shell
 * Main app shell with role-based Sidebar + TopBar + Content Area
 */
import React, { useState, useMemo } from 'react';
import { View, ScrollView, Text, StyleSheet, Platform } from 'react-native';
import { SalesSidebar, SalesSidebarItem, SalesRole } from './SalesSidebar';
import { SGTopBar } from '../../shared/ui';
import { useTheme, typography } from '../../shared/theme/theme';
import { useThemeStore } from '../../shared/theme/themeStore';
import { useAuthStore } from '../auth/store/authStore';
import { SalesErrorBoundary } from './components/SalesErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { useSalesRoute } from './hooks/useSalesRoute';

// Lazy screens
import { SalesDashboard } from './presentation/screens/SalesDashboard';
import { TeamManagement } from './presentation/screens/TeamManagement';
import { StaffManagement } from './presentation/screens/StaffManagement';
import { ProjectCatalog } from './presentation/screens/ProjectCatalog';
import { DealTracker } from './presentation/screens/Deals/DealTracker';
import { InventoryScreen } from './presentation/screens/Inventory/InventoryScreen';
import { BookingScreen } from './presentation/screens/Booking/BookingScreen';
import { CrmViewer } from './presentation/screens/CrmViewer';
import { PlanVsActual } from './presentation/screens/PlanVsActual';
import { CommissionCalc } from './presentation/screens/CommissionCalc';
import { Timekeeping } from './presentation/screens/Timekeeping';
import { Payroll } from './presentation/screens/Payroll';
import { ActivityLog } from './presentation/screens/ActivityLog';
import { EmployeeProfile } from './presentation/screens/EmployeeProfile';
import { ProjectDocs } from './presentation/screens/ProjectDocs';
import { Policies } from './presentation/screens/Policies';
import { CustomerLeads } from './presentation/screens/CustomerLeads';
import { Appointments } from './presentation/screens/Appointments';
import { LoanCalculator } from './presentation/screens/LoanCalculator';
import { Training } from './presentation/screens/Training';
import { DepositManagement } from './presentation/screens/DepositManagement';
import { KpiDashboard } from './presentation/screens/KpiDashboard';
import { DealRecording } from './presentation/screens/DealRecording';
import { TargetAllocation } from './presentation/screens/TargetAllocation';
import { TeamReport } from './presentation/screens/TeamReport';

const KEY_TO_COMPONENT: Record<string, React.ComponentType<any>> = {
  SALES_DASHBOARD: SalesDashboard,
  SALES_CRM: CustomerLeads,
  SALES_INVENTORY: InventoryScreen,
  SALES_DEALS: DealTracker,
  SALES_DEAL_RECORDING: DealRecording,
  SALES_BOOKING: BookingScreen,
  SALES_DEPOSIT: DepositManagement,
  SALES_KPI: KpiDashboard,
  SALES_APPOINTMENTS: Appointments,
  SALES_ACTIVITY_LOG: ActivityLog,
  SALES_MY_PROFILE: EmployeeProfile,
  SALES_TIMEKEEPING: Timekeeping,
  SALES_PROJECT_DOCS: ProjectDocs,
  SALES_POLICIES: Policies,
  SALES_PAYROLL: Payroll,
  SALES_COMMISSION: CommissionCalc,
  SALES_LOAN_CALC: LoanCalculator,
  SALES_TRAINING: Training,
  SALES_TEAMS: TeamManagement,
  SALES_STAFF: StaffManagement,
  SALES_PROJECTS: ProjectCatalog,
  SALES_TARGETS: TargetAllocation,
  SALES_PLAN_ACTUAL: PlanVsActual,
  SALES_TEAM_REPORT: TeamReport,
  SALES_CRM_VIEWER: CrmViewer,
};

export function SalesShell() {
  const validKeys = useMemo(() => Object.keys(KEY_TO_COMPONENT), []);
  const { activeKey, navigate } = useSalesRoute(validKeys);
  const [activeLabel, setActiveLabel] = useState('Dashboard');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();

  // Determine sales role: use salesRole from JWT, fallback to role-based mapping
  const userRole: SalesRole = user?.salesRole
    ? (user.salesRole as SalesRole)
    : (user?.role === 'admin' ? 'sales_admin' : 'sales');

  const handleSelect = (item: SalesSidebarItem) => {
    navigate(item.key);
    setActiveLabel(item.label);
    setActiveSection(item.section);
  };

  const ContentComponent = KEY_TO_COMPONENT[activeKey];

  const sectionLabels: Record<string, string> = {
    dashboard: 'TỔNG QUAN',
    sales_crm: 'KHÁCH HÀNG & CRM',
    sales_ops: 'BÁN HÀNG',
    finance: 'TÀI CHÍNH',
    resources: 'TÀI NGUYÊN',
    admin: 'QUẢN TRỊ KINH DOANH',
  };

  const breadcrumb = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[typography.micro, { color: colors.textTertiary, opacity: 0.8 }]}>
        {sectionLabels[activeSection] || 'SALES'}
      </Text>
      <View style={[styles.breadcrumbDot, { backgroundColor: '#3b82f6' }]} />
      <Text style={[typography.micro, { color: '#3b82f6', fontWeight: '800' }]}>
        {activeLabel.toUpperCase()}
      </Text>
    </View>
  );

  return (
    <ToastProvider>
    <View style={[styles.shell, { backgroundColor: isDark ? '#05070A' : '#F8FAFC' }]}>
      {/* Aurora backdrop */}
      {Platform.OS === 'web' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.aurora, {
            top: '-10%', left: '-5%', width: 1000, height: 1000,
            backgroundColor: isDark ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.05)',
            filter: 'blur(100px)',
          } as any]} />
          <View style={[styles.aurora, {
            bottom: '-15%', right: '-8%', width: 900, height: 900,
            backgroundColor: isDark ? 'rgba(147,51,234,0.08)' : 'rgba(147,51,234,0.04)',
            filter: 'blur(120px)',
          } as any]} />
        </View>
      )}

      {/* Sidebar */}
      <View style={{ zIndex: 1000 }}>
        <SalesSidebar
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
            <SalesErrorBoundary key={activeKey}>
            {ContentComponent ? (
              <ContentComponent userRole={userRole} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={{ fontSize: 60, marginBottom: 24 }}>🚀</Text>
                <Text style={[typography.h3, { color: colors.text, marginBottom: 8 }]}>Module Đang Phát Triển</Text>
                <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', maxWidth: 400 }]}>
                  Tính năng này đang được phát triển.
                </Text>
              </View>
            )}
            </SalesErrorBoundary>
          </ScrollView>
        </View>
      </View>
    </View>
    </ToastProvider>
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
