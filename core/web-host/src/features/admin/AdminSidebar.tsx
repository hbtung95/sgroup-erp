/**
 * AdminSidebar — Premium System Administration Sidebar
 * Uses Pressable, token colors, typography presets, Reanimated collapse
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { typography, sgds, radius, spacing } from '@sgroup/ui/src/theme/theme';
import { useAuthStore } from '../auth/store/authStore';
import {
  LayoutDashboard, Building, Users, Settings, ChevronLeft, ChevronRight,
  LogOut, Shield, FileText, Flag, BarChart3, Clock, BookOpen,
} from 'lucide-react-native';
import { SGThemeToggle } from '@sgroup/ui/src/ui/components/SGThemeToggle';
import { SGAvatar } from '@sgroup/ui/src/ui/components/SGAvatar';
import { SGConfirmDialog } from '@sgroup/ui/src/ui/components/SGConfirmDialog';
import { LinearGradient } from 'expo-linear-gradient';

export interface AdminSidebarItem {
  key: string;
  label: string;
  icon: any;
  section: 'dashboard' | 'organization' | 'users' | 'system' | 'audit' | 'tools';
}

const SIDEBAR_ITEMS: AdminSidebarItem[] = [
  { key: 'ADMIN_DASHBOARD', label: 'Tổng quan', icon: LayoutDashboard, section: 'dashboard' },
  { key: 'ADMIN_ORG_CONFIG', label: 'Phòng ban & Team', icon: Building, section: 'organization' },
  { key: 'ADMIN_USERS', label: 'Quản lý User', icon: Users, section: 'users' },
  { key: 'ADMIN_ROLES', label: 'Phân quyền', icon: Shield, section: 'system' },
  { key: 'ADMIN_SYSTEM', label: 'Cài đặt hệ thống', icon: Settings, section: 'system' },
  { key: 'ADMIN_FLAGS', label: 'Feature Flags', icon: Flag, section: 'system' },
  { key: 'ADMIN_AUDIT', label: 'Nhật ký hệ thống', icon: FileText, section: 'audit' },
  { key: 'ADMIN_ANALYTICS', label: 'Phân tích Audit', icon: BarChart3, section: 'audit' },
  { key: 'ADMIN_TASKS', label: 'Tác vụ định kỳ', icon: Clock, section: 'tools' },
  { key: 'ADMIN_CHANGELOG', label: 'Changelog', icon: BookOpen, section: 'tools' },
];

const SECTIONS = [
  { key: 'dashboard', label: '' },
  { key: 'organization', label: 'CẤU HÌNH TỔ CHỨC' },
  { key: 'users', label: 'NGƯỜI DÙNG' },
  { key: 'system', label: 'HỆ THỐNG' },
  { key: 'audit', label: 'GIÁM SÁT' },
  { key: 'tools', label: 'CÔNG CỤ' },
];

const EXPANDED_WIDTH = 260;
const COLLAPSED_WIDTH = 80;

interface Props {
  activeKey: string;
  onSelect: (item: AdminSidebarItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ activeKey, onSelect, collapsed, onToggleCollapse }: Props) {
  const { colors, isDark } = useAppTheme();
  const { logout, user } = useAuthStore();
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Animated width for smooth collapse
  const sidebarWidth = useSharedValue(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH);

  useEffect(() => {
    sidebarWidth.value = withSpring(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH, {
      damping: 20,
      stiffness: 120,
    });
  }, [collapsed]);

  const animatedSidebarStyle = useAnimatedStyle(() => ({
    width: sidebarWidth.value,
  }));

  const renderItem = (item: AdminSidebarItem) => {
    const isActive = activeKey === item.key;
    const IconComp = item.icon;
    return (
      <Pressable
        key={item.key}
        onPress={() => onSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: isActive }}
        style={({ hovered, pressed }: any) => [
          styles.menuItem,
          {
            backgroundColor: isActive
              ? `${colors.accent}15`
              : hovered
                ? `${colors.accent}08`
                : 'transparent',
            borderRadius: radius.lg,
            marginHorizontal: spacing.md,
            marginBottom: spacing.xs,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
          },
          pressed && { transform: [{ scale: 0.97 }] },
          Platform.OS === 'web' && ({
            ...sgds.transition.fast,
            cursor: 'pointer',
          } as any),
          isActive && Platform.OS === 'web' && ({
            boxShadow: `0 4px 14px ${colors.accent}18`,
          } as any),
        ]}
      >
        <View style={styles.menuItemIcon}>
          <IconComp
            size={20}
            color={isActive ? colors.accent : colors.textSecondary}
            strokeWidth={isActive ? 2.5 : 2}
          />
        </View>
        {!collapsed && (
          <Text
            style={[
              isActive ? typography.bodyBold : typography.body,
              {
                color: isActive ? colors.accent : colors.text,
                flex: 1,
                letterSpacing: 0.2,
              },
            ]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <Animated.View
      style={[
        styles.sidebar,
        animatedSidebarStyle,
        {
          backgroundColor: isDark ? colors.glass : `${colors.bgCard}F2`,
          borderRightColor: colors.border,
        },
        Platform.OS === 'web' && ({
          ...sgds.glass,
        } as any),
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.headerContent, { gap: collapsed ? 0 : 12 }]}>
          <LinearGradient
            colors={isDark ? [colors.accent, '#8b5cf6'] : [colors.accent, '#4f46e5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.logoGradient,
              Platform.OS === 'web'
                ? ({
                    boxShadow: isDark
                      ? `0 4px 16px ${colors.accent}4D, 0 0 8px #8b5cf633`
                      : `0 4px 14px ${colors.accent}40`,
                  } as any)
                : {
                    shadowColor: colors.accent,
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 6,
                  },
            ]}
          >
            <Settings size={16} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
          {!collapsed && (
            <View style={styles.headerText}>
              <Text style={[typography.h4, { color: colors.text, letterSpacing: 0.8 }]}>
                QUẢN TRỊ
              </Text>
              <Text
                style={[
                  typography.micro,
                  { color: colors.accent, marginTop: 1 },
                ]}
              >
                SYSTEM ADMIN
              </Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={onToggleCollapse}
          accessibilityRole="button"
          accessibilityLabel={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          style={({ hovered }: any) => [
            styles.collapseBtn,
            {
              backgroundColor: hovered ? `${colors.accent}15` : colors.bgCard,
              borderColor: colors.border,
            },
            Platform.OS === 'web' && ({
              ...sgds.transition.fast,
              cursor: 'pointer',
            } as any),
          ]}
        >
          {collapsed
            ? <ChevronRight size={14} color={colors.textSecondary} strokeWidth={2.5} />
            : <ChevronLeft size={14} color={colors.textSecondary} strokeWidth={2.5} />}
        </Pressable>
      </View>

      {/* Menu */}
      <ScrollView
        style={styles.menuScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        {SECTIONS.map(sec => {
          const sectionItems = SIDEBAR_ITEMS.filter(i => i.section === sec.key);
          if (sectionItems.length === 0) return null;
          return (
            <View key={sec.key}>
              {!collapsed && sec.label !== '' && (
                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
                  {sec.label}
                </Text>
              )}
              {sectionItems.map(renderItem)}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>
          );
        })}
      </ScrollView>

      {/* User + Footer */}
      <View style={[styles.userSection, { borderTopColor: colors.border }]}>
        <View style={styles.userRow}>
          <SGAvatar
            name={user?.name || 'Admin'}
            size="sm"
            color={colors.accent}
          />
          {!collapsed && (
            <View style={styles.userInfo}>
              <Text style={[typography.smallBold, { color: colors.text }]}>
                {user?.name || 'Admin'}
              </Text>
              <Text style={[typography.caption, { color: colors.textTertiary }]}>
                System Admin
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={[
          styles.footer,
          {
            flexDirection: collapsed ? 'column' : 'row',
            justifyContent: collapsed ? 'center' : 'space-between',
          },
        ]}
      >
        <SGThemeToggle size="sm" />
        <Pressable
          onPress={() => setLogoutConfirm(true)}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          {...(Platform.OS === 'web' ? { title: 'Đăng xuất' } as any : {})}
          style={({ hovered }: any) => [
            styles.logoutBtn,
            {
              backgroundColor: hovered
                ? `${colors.danger}20`
                : `${colors.danger}10`,
              marginTop: collapsed ? 12 : 0,
            },
            Platform.OS === 'web' && ({
              ...sgds.transition.fast,
              cursor: 'pointer',
            } as any),
          ]}
        >
          <LogOut size={16} color={colors.danger} />
        </Pressable>
      </View>

      {/* Logout Confirm Dialog */}
      <SGConfirmDialog
        visible={logoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc muốn đăng xuất khỏi hệ thống?"
        confirmLabel="Đăng xuất"
        variant="danger"
        onConfirm={() => { setLogoutConfirm(false); logout(); }}
        onCancel={() => setLogoutConfirm(false)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    borderRightWidth: 1,
    height: '100%' as any,
    overflow: 'hidden',
  },
  header: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  logoGradient: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapseBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: spacing.base,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sectionLabel: {
    ...typography.micro,
    letterSpacing: 1.8,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs + 2,
  },
  userSection: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg - 4,
    gap: spacing.sm,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
