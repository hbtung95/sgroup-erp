import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, StyleSheet, Platform } from 'react-native';
import { ProjectSidebar, ProjectSidebarItem, ProjectRole } from './ProjectSidebar';
import { SGTopBar } from '../../../shared/ui';
import { typography } from '../../../shared/theme/theme';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useAuthStore } from '../../auth/store/authStore';
import { ToastProvider } from '../../sales/components/ToastProvider';
import { useProjectRoute } from '../application/hooks/useProjectRoute';

// Screens
import { ProjectDashboard } from './presentation/screens/ProjectDashboard';
import { ProjectListScreen } from './presentation/screens/ProjectListScreen';
import { InventoryScreen } from './presentation/screens/InventoryScreen';

import { ProjectDocs } from './presentation/screens/ProjectDocs';
import { ProjectPolicies } from './presentation/screens/ProjectPolicies';
import { ProjectAssignment } from './presentation/screens/ProjectAssignment';

export function ProjectShell() {
  const validKeys = useMemo(() => [
    'PROJECT_DASHBOARD', 'PROJECT_LIST', 'PROJECT_DOCS', 
    'PROJECT_INVENTORY', 'PROJECT_POLICIES', 'PROJECT_ASSIGNMENT'
  ], []);
  const { activeKey, navigate } = useProjectRoute(validKeys);
  const [activeLabel, setActiveLabel] = useState('Tá»•ng quan Dá»± Ã¡n');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [inventoryProjectId, setInventoryProjectId] = useState<string | undefined>(undefined);
  const { colors, isDark } = useAppTheme();
  const { user } = useAuthStore();

  const userRole: ProjectRole = user?.role as ProjectRole || 'admin';

  const handleSelect = (item: ProjectSidebarItem) => {
    navigate(item.key);
    setActiveLabel(item.label);
    setActiveSection(item.section);
    // Reset inventory project filter when navigating via sidebar
    if (item.key !== 'PROJECT_INVENTORY') {
      setInventoryProjectId(undefined);
    }
  };

  const handleNavigateInventory = useCallback((projectId: string) => {
    setInventoryProjectId(projectId);
    navigate('PROJECT_INVENTORY');
    setActiveLabel('Quáº£n lÃ½ Báº£ng hÃ ng');
    setActiveSection('inventory');
  }, [navigate]);

  const sectionLabels: Record<string, string> = {
    dashboard: 'Tá»”NG QUAN',
    master_data: 'Dá»® LIá»†U Dá»° ÃN',
    inventory: 'QUáº¢N LÃ Sáº¢N PHáº¨M',
    settings: 'Há»† THá»NG & CÃ€I Äáº¶T',
  };

  const breadcrumb = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[typography.micro, { color: colors.textTertiary, opacity: 0.8 }]}>
        {sectionLabels[activeSection] || 'PROJECT'}
      </Text>
      <View style={[styles.breadcrumbDot, { backgroundColor: colors.success }]} />
      <Text style={[typography.micro, { color: colors.success, fontWeight: '800' }]}>
        {activeLabel.toUpperCase()}
      </Text>
    </View>
  );

  const renderContent = () => {
    switch (activeKey) {
      case 'PROJECT_DASHBOARD':
        return <ProjectDashboard />;
      case 'PROJECT_LIST':
        return <ProjectListScreen onNavigateInventory={handleNavigateInventory} />;
      case 'PROJECT_DOCS':
        return <ProjectDocs />;
      case 'PROJECT_INVENTORY':
        return <InventoryScreen initialProjectId={inventoryProjectId} />;
      case 'PROJECT_POLICIES':
        return <ProjectPolicies />;
      case 'PROJECT_ASSIGNMENT':
        return <ProjectAssignment />;
      default:
        return (
          <View style={styles.placeholder}>
            <Text style={{ fontSize: 60, marginBottom: 24 }}>ðŸš€</Text>
            <Text style={[typography.h3, { color: colors.text, marginBottom: 8 }]}>Module Äang PhÃ¡t Triá»ƒn</Text>
          </View>
        );
    }
  };

  return (
    <ToastProvider>
      <View style={[styles.shell, { backgroundColor: colors.bg }]}>
        {Platform.OS === 'web' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={[styles.aurora, {
              top: '-10%', left: '-5%', width: 1000, height: 1000,
              backgroundColor: isDark ? 'rgba(16,185,129,0.10)' : 'rgba(16,185,129,0.05)',
              filter: 'blur(100px)',
            } as any]} />
            <View style={[styles.aurora, {
              bottom: '-15%', right: '-8%', width: 900, height: 900,
              backgroundColor: isDark ? 'rgba(52,211,153,0.08)' : 'rgba(52,211,153,0.04)',
              filter: 'blur(120px)',
            } as any]} />
          </View>
        )}

        <View style={{ zIndex: 1000 }}>
          <ProjectSidebar
            activeKey={activeKey}
            onSelect={handleSelect}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(c => !c)}
            userRole={userRole}
          />
        </View>

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
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {renderContent()}
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
  topBarWrapper: { zIndex: 100, ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}) } as any,
  breadcrumbDot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 8 },
  content: { flex: 1, zIndex: 1 },
  scrollContent: { paddingBottom: 40 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
});
