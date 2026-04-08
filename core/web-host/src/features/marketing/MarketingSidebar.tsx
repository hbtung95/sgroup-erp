import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from 'react-native';
import { typography, spacing, radius, sgds } from '@sgroup/ui/src/theme/theme';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { useAuthStore } from '../auth/store/authStore';
import {
  LayoutDashboard, Megaphone, Users2, Target, BarChart3,
  ChevronLeft, ChevronRight, LogOut, Plus, Wallet, CalendarDays,
  UserCircle, Radio,
} from 'lucide-react-native';
import { SGThemeToggle } from '@sgroup/ui/src/ui/components/SGThemeToggle';
import { LinearGradient } from 'expo-linear-gradient';

export type MarketingRole = 'marketing' | 'marketing_manager' | 'marketing_director' | 'ceo' | 'admin';

export interface MarketingSidebarItem {
  key: string;
  label: string;
  icon: any;
  section: 'dashboard' | 'campaign' | 'leads' | 'content' | 'finance' | 'reports' | 'settings';
  minRole: MarketingRole[];
}

const ALL_ROLES: MarketingRole[] = ['marketing', 'marketing_manager', 'marketing_director', 'ceo', 'admin'];
const MANAGER_UP: MarketingRole[] = ['marketing_manager', 'marketing_director', 'ceo', 'admin'];

const SIDEBAR_ITEMS: MarketingSidebarItem[] = [
  { key: 'MKT_DASHBOARD',  label: 'Tổng quan',            icon: LayoutDashboard, section: 'dashboard', minRole: ALL_ROLES },
  { key: 'MKT_CAMPAIGNS',  label: 'Quản lý Chiến dịch',   icon: Megaphone,       section: 'campaign',  minRole: ALL_ROLES },
  { key: 'MKT_CHANNELS',   label: 'Hiệu suất Kênh',       icon: Radio,           section: 'campaign',  minRole: ALL_ROLES },
  { key: 'MKT_LEADS',      label: 'MQL & Leads',           icon: Users2,          section: 'leads',     minRole: ALL_ROLES },
  { key: 'MKT_CONTENT',    label: 'Lịch Nội dung',         icon: CalendarDays,    section: 'content',   minRole: ALL_ROLES },
  { key: 'MKT_BUDGET',     label: 'Ngân sách & Chi phí',   icon: Wallet,          section: 'finance',   minRole: ALL_ROLES },
  { key: 'MKT_REPORTS',    label: 'Báo cáo & Phân tích',   icon: BarChart3,       section: 'reports',   minRole: ALL_ROLES },
  { key: 'MKT_PLANNING',   label: 'Kế hoạch Marketing',    icon: Target,          section: 'reports',   minRole: MANAGER_UP },
];

interface Props {
  activeKey: string;
  onSelect: (item: MarketingSidebarItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: MarketingRole;
}

export function MarketingSidebar({ activeKey, onSelect, collapsed, onToggleCollapse, userRole = 'marketing' }: Props) {
  const { theme, isDark, colors } = useAppTheme();
  const { logout } = useAuthStore();

  const visibleItems = SIDEBAR_ITEMS.filter(item => item.minRole.includes(userRole));
  const sections = [
    { key: 'dashboard', label: '' },
    { key: 'campaign',  label: 'CHIẾN DỊCH' },
    { key: 'leads',     label: 'LEADS & CRM' },
    { key: 'content',   label: 'NỘI DUNG' },
    { key: 'finance',   label: 'TÀI CHÍNH' },
    { key: 'reports',   label: 'BÁO CÁO' },
    { key: 'settings',  label: 'CÀI ĐẶT' },
  ];

  const renderItem = (item: MarketingSidebarItem) => {
    const isActive = activeKey === item.key;
    const IconComp = item.icon;
    return (
      <TouchableOpacity
        key={item.key}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
        style={[styles.menuItem, {
          backgroundColor: isActive
            ? (isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)')
            : 'transparent',
          borderWidth: isActive ? 1 : 0,
          borderColor: isActive
            ? (isDark ? 'rgba(245,158,11,0.2)' : 'rgba(217,119,6,0.15)')
            : 'transparent',
        }, Platform.OS === 'web' && !isActive ? {
          ...sgds.transition.fast,
        } as any : {}]}
      >
        <View style={styles.menuIconWrap}>
          <IconComp
            size={20}
            color={isActive ? colors.warning : colors.textSecondary}
            strokeWidth={isActive ? 2.5 : 1.8}
          />
        </View>
        {!collapsed && (
          <Text style={[
            typography.smallBold,
            {
              color: isActive ? colors.warning : (isDark ? colors.text : colors.textSecondary),
              flex: 1,
              letterSpacing: 0.2,
            },
            isActive && { fontWeight: '800' },
          ]} numberOfLines={1}>
            {item.label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.sidebar, {
      width: collapsed ? 80 : 260,
      backgroundColor: isDark ? 'rgba(15,20,32,0.85)' : 'rgba(255,255,255,0.92)',
      borderRightColor: colors.border,
    }, Platform.OS === 'web' ? {
      ...sgds.glass,
    } as any : {}]}>
      {/* Header — Premium Brand */}
      <View style={[styles.header, {
        borderBottomColor: colors.border,
      }]}>
        <View style={[styles.headerInner, { gap: collapsed ? 0 : 12, flex: collapsed ? 0 : 1 }]}>
          <LinearGradient
            colors={isDark ? ['#F59E0B', '#D97706'] : ['#D97706', '#B45309']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.brandIcon, Platform.OS === 'web' ? {
              boxShadow: isDark
                ? '0 4px 16px rgba(245,158,11,0.3), 0 0px 8px rgba(217,119,6,0.2)'
                : '0 4px 14px rgba(217,119,6,0.25)',
            } as any : {
              shadowColor: '#D97706',
              shadowOpacity: 0.35,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }]}
          >
            <Text style={styles.brandText}>SG</Text>
          </LinearGradient>
          {!collapsed && (
            <View style={styles.brandLabels}>
              <Text style={[typography.h4, { color: colors.text, letterSpacing: 0.8 }]}>MARKETING</Text>
              <Text style={[typography.micro, { color: colors.warning, marginTop: 1 }]}>MKT MODULE</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={onToggleCollapse}
          activeOpacity={0.7}
          style={[styles.collapseBtn, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: 1,
            borderColor: colors.border,
          }]}
        >
          {collapsed
            ? <ChevronRight size={14} color={colors.textSecondary} strokeWidth={2.5} />
            : <ChevronLeft size={14} color={colors.textSecondary} strokeWidth={2.5} />
          }
        </TouchableOpacity>
      </View>

      {/* Gradient glow line */}
      {Platform.OS === 'web' && (
        <View style={{
          height: 1,
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), rgba(217,119,6,0.3), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(217,119,6,0.2), rgba(245,158,11,0.15), transparent)',
        } as any} />
      )}

      {/* Quick Action Button */}
      <View style={styles.quickActionWrap}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.quickActionBtn, {
            backgroundColor: colors.warning,
          }, Platform.OS === 'web' ? {
            boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
            ...sgds.transition.fast,
          } as any : {
            shadowColor: '#D97706',
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }]}
        >
          <Plus size={20} color="#fff" strokeWidth={3} />
          {!collapsed && <Text style={styles.quickActionText}>Tạo Chiến Dịch</Text>}
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuContent}>
        {sections.map(sec => {
          const sectionItems = visibleItems.filter(i => i.section === sec.key);
          if (sectionItems.length === 0) return null;
          return (
            <View key={sec.key}>
              {!collapsed && sec.label !== '' && (
                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{sec.label}</Text>
              )}
              {sectionItems.map(renderItem)}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>
          );
        })}
      </ScrollView>

      {/* User Profile & Footer Area */}
      <View style={[styles.profileWrap, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => onSelect({ key: 'MKT_PROFILE', label: 'Hồ sơ Của Tôi', icon: UserCircle, section: 'dashboard', minRole: ALL_ROLES })}
          activeOpacity={0.7}
          style={[styles.profileBtn, {
            backgroundColor: activeKey === 'MKT_PROFILE'
              ? (isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.06)')
              : 'transparent',
          }]}
        >
          <View style={[styles.profileAvatar, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.bgCard,
          }]}>
            <UserCircle size={20} color={isDark ? '#fff' : colors.textSecondary} />
          </View>
          {!collapsed && (
            <View style={styles.profileInfo}>
              <Text style={[typography.smallBold, { color: colors.text }]}>Hồ Sơ Của Tôi</Text>
              <Text style={[typography.caption, { color: colors.textTertiary, textTransform: 'capitalize' }]}>
                {userRole.replace('_', ' ')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, {
        flexDirection: collapsed ? 'column' : 'row',
        justifyContent: collapsed ? 'center' : 'space-between',
      }]}>
        <SGThemeToggle size="sm" />
        <TouchableOpacity
          onPress={logout}
          activeOpacity={0.7}
          style={[styles.logoutBtn, {
            backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)',
            marginTop: collapsed ? 12 : 0,
          }]}
        >
          <LogOut size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    height: '100%' as any,
  },
  header: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  brandLabels: {
    flex: 1,
  },
  collapseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionWrap: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  quickActionBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    marginHorizontal: 12,
    marginBottom: 4,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  menuIconWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    marginHorizontal: 24,
    marginVertical: 6,
    opacity: 0.6,
  },
  profileWrap: {
    padding: 12,
    borderTopWidth: 1,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 14,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
