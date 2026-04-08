import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTheme, typography } from '@sgroup/ui/src/theme/theme';
import { useThemeStore } from '@sgroup/ui/src/theme/themeStore';
import {
  LayoutDashboard,
  FolderOpen,
  FileSignature,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';

export type LegalRole = 'admin' | 'legal' | 'legal_manager' | 'compliance_officer';

export interface LegalSidebarItem {
  key: string;
  label: string;
  icon: any;
  section: 'dashboard' | 'projects' | 'deals' | 'templates';
  roles: LegalRole[];
}

const SIDEBAR_ITEMS: LegalSidebarItem[] = [
  {
    key: 'LEGAL_DASHBOARD',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    section: 'dashboard',
    roles: ['admin', 'legal', 'legal_manager', 'compliance_officer'],
  },
  {
    key: 'LEGAL_PROJECT_DOCS',
    label: 'Hồ sơ dự án',
    icon: FolderOpen,
    section: 'projects',
    roles: ['admin', 'legal', 'legal_manager', 'compliance_officer'],
  },
  {
    key: 'LEGAL_TRANSACTION_DOCS',
    label: 'Hồ sơ giao dịch',
    icon: FileSignature,
    section: 'deals',
    roles: ['admin', 'legal', 'legal_manager', 'compliance_officer'],
  },
  {
    key: 'LEGAL_TEMPLATES',
    label: 'Biểu mẫu chuẩn',
    icon: FileText,
    section: 'templates',
    roles: ['admin', 'legal', 'legal_manager', 'compliance_officer'],
  },
];

interface Props {
  activeKey: string;
  onSelect: (item: LegalSidebarItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole: LegalRole;
}

export function LegalSidebar({ activeKey, onSelect, collapsed, onToggleCollapse, userRole }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();

  const filteredItems = SIDEBAR_ITEMS.filter((item) =>
    userRole === 'admin' ? true : item.roles.includes(userRole)
  );

  const renderSectionLabel = (label: string) => {
    if (collapsed) {
      return <View style={styles.divider} />;
    }
    return (
      <Text style={[typography.micro, styles.sectionLabel, { color: colors.textTertiary }]}>
        {label}
      </Text>
    );
  };

  const dashboardItems = filteredItems.filter((i) => i.section === 'dashboard');
  const projectItems = filteredItems.filter((i) => i.section === 'projects');
  const dealItems = filteredItems.filter((i) => i.section === 'deals');
  const templateItems = filteredItems.filter((i) => i.section === 'templates');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          width: collapsed ? 80 : 260,
          borderRightColor: colors.border,
        },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.logoContainer}>
          <ShieldCheck size={28} color="#10B981" />
          {!collapsed && (
            <View style={{ marginLeft: 12 }}>
              <Text style={[typography.h4, { color: colors.text, lineHeight: 28 }]}>Pháp lý</Text>
              <Text style={[typography.micro, { color: '#10B981', fontWeight: '700' }]}>MODULE</Text>
            </View>
          )}
        </View>
        {Platform.OS === 'web' && (
          <TouchableOpacity
            onPress={onToggleCollapse}
            style={[styles.collapseBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
          >
            {collapsed ? (
              <ChevronRight size={16} color={colors.textSecondary} />
            ) : (
              <ChevronLeft size={16} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
        {dashboardItems.length > 0 && (
          <View style={styles.section}>
            {renderSectionLabel('TỔNG QUAN')}
            {dashboardItems.map((item) => (
              <MenuItem
                key={item.key}
                item={item}
                isActive={activeKey === item.key}
                collapsed={collapsed}
                onSelect={onSelect}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        {projectItems.length > 0 && (
          <View style={styles.section}>
            {renderSectionLabel('DỰ ÁN')}
            {projectItems.map((item) => (
              <MenuItem
                key={item.key}
                item={item}
                isActive={activeKey === item.key}
                collapsed={collapsed}
                onSelect={onSelect}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        {dealItems.length > 0 && (
          <View style={styles.section}>
            {renderSectionLabel('GIAO DỊCH')}
            {dealItems.map((item) => (
              <MenuItem
                key={item.key}
                item={item}
                isActive={activeKey === item.key}
                collapsed={collapsed}
                onSelect={onSelect}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        {templateItems.length > 0 && (
          <View style={styles.section}>
            {renderSectionLabel('BIỂU MẪU')}
            {templateItems.map((item) => (
              <MenuItem
                key={item.key}
                item={item}
                isActive={activeKey === item.key}
                collapsed={collapsed}
                onSelect={onSelect}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const MenuItem = ({
  item,
  isActive,
  collapsed,
  onSelect,
  colors,
  isDark,
}: {
  item: LegalSidebarItem;
  isActive: boolean;
  collapsed: boolean;
  onSelect: (item: LegalSidebarItem) => void;
  colors: any;
  isDark: boolean;
}) => {
  const Icon = item.icon;
  const activeBg = isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5';
  const activeColor = '#10B981';
  const inactiveColor = colors.textSecondary;

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        isActive && { backgroundColor: activeBg },
        collapsed && { justifyContent: 'center', paddingHorizontal: 0 },
      ]}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrapper, isActive && { backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : '#D1FAE5' }]}>
        <Icon size={20} color={isActive ? activeColor : inactiveColor} strokeWidth={isActive ? 2.5 : 2} />
      </View>
      {!collapsed && (
        <Text
          style={[
            typography.body,
            styles.menuLabel,
            { color: isActive ? activeColor : colors.text },
            isActive && { fontWeight: '600' },
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    borderRightWidth: 1,
    ...Platform.select({
      web: { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
    }),
  },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapseBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 8,
    marginLeft: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    marginLeft: 12,
    flex: 1,
  },
});
