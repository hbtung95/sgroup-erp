/**
 * SGROUP ERP — BDH Shell
 * Main app shell with Sidebar + TopBar + Content Area
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, Dimensions } from 'react-native';
import { BDHSidebar } from './BDHSidebar';
import { SGTopBar } from '../../shared/ui';
import { SGAuroraBackground } from '../../shared/ui/components/SGAuroraBackground';
import { useTheme, typography } from '../../shared/theme/theme';
import { useThemeStore } from '../../shared/theme/themeStore';

import { OverviewDashboard } from './Overview/OverviewDashboard';
import { OverviewSales } from './Overview/OverviewSales';
import { OverviewMarketing } from './Overview/OverviewMarketing';
import { OverviewHR } from './Overview/OverviewHR';
import { OverviewAgency } from './Overview/OverviewAgency';
import { OverviewSHomes } from './Overview/OverviewSHomes';
import { OverviewProject } from './Overview/OverviewProject';
import { OverviewOps } from './Overview/OverviewOps';
import { OverviewFinance } from './Overview/OverviewFinance';
import { PlanTotal } from './Planning/PlanTotal';
import { PlanSales } from './Planning/PlanSales';
import { PlanMarketing } from './Planning/PlanMarketing';
import { PlanHR } from './Planning/PlanHR';
import { PlanAgency } from './Planning/PlanAgency';
import { PlanSHomes } from './Planning/PlanSHomes';
import { PlanProject } from './Planning/PlanProject';
import { PlanOps } from './Planning/PlanOps';
import { PlanFinance } from './Planning/PlanFinance';



export function BDHShell() {
  const [activeKey, setActiveKey] = useState('OVERVIEW_DASHBOARD');
  const [activeLabel, setActiveLabel] = useState('Tổng quan');
  const [activeSection, setActiveSection] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const colors = useTheme();
  const { isDark } = useThemeStore();

  const handleSelect = (item: { key: string; label: string; section: string }) => {
    setActiveKey(item.key);
    setActiveLabel(item.label);
    setActiveSection(item.section);
  };

  // Map sidebar keys to content components
  const KEY_TO_MODULE: Record<string, React.ComponentType<any>> = {
    'OVERVIEW_DASHBOARD': OverviewDashboard,
    'OVERVIEW_SALES': OverviewSales,
    'OVERVIEW_MARKETING': OverviewMarketing,
    'OVERVIEW_HR': OverviewHR,
    'OVERVIEW_AGENCY': OverviewAgency,
    'OVERVIEW_SHOMES': OverviewSHomes,
    'OVERVIEW_PROJECT': OverviewProject,
    'OVERVIEW_OPS': OverviewOps,
    'OVERVIEW_FINANCE': OverviewFinance,
    'PLAN_TOTAL': PlanTotal,
    'PLAN_SALES': PlanSales,
    'PLAN_MARKETING': PlanMarketing,
    'PLAN_HR': PlanHR,
    'PLAN_AGENCY': PlanAgency,
    'PLAN_SHOMES': PlanSHomes,
    'PLAN_PROJECT': PlanProject,
    'PLAN_OPS': PlanOps,
    'PLAN_FINANCE': PlanFinance,
  };

  const ContentComponent = KEY_TO_MODULE[activeKey];

  const breadcrumbText = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[typography.micro, { color: colors.textTertiary, opacity: 0.8 }]}>
        {activeSection === 'overview' ? 'DASHBOARD' : 'PLANNING'}
      </Text>
      <View style={[styles.breadcrumbDot, { backgroundColor: colors.brand }]} />
      <Text style={[typography.micro, { color: colors.brand, fontWeight: '800' }]}>
        {activeLabel.toUpperCase()}
      </Text>
    </View>
  );

  return (
    <View style={[styles.shell, { backgroundColor: colors.bg }]}>
      
      {/* ── CINEMATIC BACKDROP ── */}
      <SGAuroraBackground />

      {/* ── SIDEBAR ── */}
      <View style={{ zIndex: 1000 }}>
        <BDHSidebar 
          activeKey={activeKey} 
          onSelect={handleSelect} 
          collapsed={collapsed} 
          onToggleCollapse={() => setCollapsed(c => !c)} 
        />
      </View>

      {/* ── MAIN AREA ── */}
      <View style={styles.mainArea}>
        <View style={styles.topBarWrapper}>
          <SGTopBar 
            title={activeLabel} 
            breadcrumb={breadcrumbText} 
            userName="Nguyen Admin" 
            userRole="Hệ thống vận hành" 
          />
        </View>

        <View style={styles.content}>
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {ContentComponent ? (
              <ContentComponent />
            ) : (
              <View style={styles.errorView}>
                <View style={[styles.errorIconBox, { backgroundColor: isDark ? 'rgba(212,32,39,0.1)' : '#FEF2F2' }]}>
                  <Text style={styles.errorIcon}>🚀</Text>
                </View>
                <Text style={[typography.h3, { color: colors.text, marginBottom: 8 }]}>Module Đang Cập Nhật</Text>
                <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', maxWidth: 400 }]}>
                  Tính năng này đang được đội ngũ kỹ thuật tối ưu hóa để mang lại trải nghiệm tốt nhất cho bạn.
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
    ...(Platform.OS === 'web' ? { 
      backdropFilter: 'blur(20px)', 
      WebkitBackdropFilter: 'blur(20px)',
    } : {}),
  } as any,

  breadcrumbDot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 8 },
  
  content: { flex: 1, zIndex: 1 },
  scrollContent: { paddingBottom: 40 },
  
  errorView: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  errorIconBox: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  errorIcon: { fontSize: 60 },
});
