/**
 * NotificationCenter — Bell icon dropdown with unread badge
 * Shows admin notifications with mark-read and clear-all
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform, Modal } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  Bell, BellOff, CheckCheck, AlertTriangle, Shield, Key, UserPlus,
  Settings, Info, X, Check,
} from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { typography, spacing, sgds } from '@sgroup/ui/src/theme/theme';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '../hooks/useAdmin';
import { formatRelativeDate } from '../utils/adminUtils';

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  LOGIN_FAIL:        { icon: AlertTriangle, color: '#ef4444' },
  SETTING_CHANGE:    { icon: Settings,      color: '#3b82f6' },
  USER_LOCKED:       { icon: Shield,        color: '#f59e0b' },
  PASSWORD_EXPIRED:  { icon: Key,           color: '#ef4444' },
  PASSWORD_EXPIRING: { icon: Key,           color: '#f59e0b' },
  USER_CREATED:      { icon: UserPlus,      color: '#10b981' },
  SYSTEM:            { icon: Info,          color: '#6366f1' },
};

const SEVERITY_COLORS: Record<string, string> = {
  info: '#3b82f6', warning: '#f59e0b', danger: '#ef4444', success: '#10b981',
};

export function NotificationCenter() {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.items ?? [];

  const handleMarkRead = async (id: string) => {
    try { await markRead.mutateAsync(id); } catch {}
  };

  const handleMarkAllRead = async () => {
    try { await markAll.mutateAsync(); } catch {}
  };

  return (
    <>
      {/* Bell Button */}
      <Pressable
        onPress={() => setOpen(true)}
        style={({ hovered }: any) => [
          styles.bellBtn,
          { backgroundColor: hovered ? `${colors.accent}15` : 'transparent' },
          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
        ]}
      >
        <Bell size={20} color={unreadCount > 0 ? colors.accent : colors.textTertiary} />
        {unreadCount > 0 && (
          <Animated.View entering={FadeIn.duration(200)} style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </Animated.View>
        )}
      </Pressable>

      {/* Dropdown Modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.dropdown, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
            onPress={() => {}}
          >
            {/* Header */}
            <View style={[styles.dropdownHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.headerLeft}>
                <Bell size={16} color={colors.accent} />
                <Text style={[typography.bodyBold, { color: colors.text }]}>Thông báo</Text>
                {unreadCount > 0 && (
                  <View style={[styles.headerBadge, { backgroundColor: `${colors.danger}15` }]}>
                    <Text style={[typography.micro, { color: colors.danger, fontWeight: '800' }]}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.headerRight}>
                {unreadCount > 0 && (
                  <Pressable onPress={handleMarkAllRead} style={[styles.markAllBtn, { backgroundColor: `${colors.accent}10` }]}>
                    <CheckCheck size={14} color={colors.accent} />
                    <Text style={[typography.micro, { color: colors.accent }]}>Đọc hết</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => setOpen(false)} style={[styles.closeBtn, { backgroundColor: `${colors.danger}10` }]}>
                  <X size={14} color={colors.danger} />
                </Pressable>
              </View>
            </View>

            {/* Notifications List */}
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <BellOff size={40} color={colors.textDisabled} strokeWidth={1} />
                  <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 8 }]}>
                    Không có thông báo
                  </Text>
                </View>
              ) : (
                notifications.map((notif: any, i: number) => {
                  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
                  const IconComp = config.icon;
                  const sevColor = SEVERITY_COLORS[notif.severity] || SEVERITY_COLORS.info;
                  return (
                    <Animated.View key={notif.id} entering={FadeInDown.delay(i * 30).duration(200)}>
                      <Pressable
                        onPress={() => !notif.isRead && handleMarkRead(notif.id)}
                        style={({ hovered }: any) => [
                          styles.notifRow,
                          {
                            backgroundColor: notif.isRead ? 'transparent' : `${sevColor}05`,
                            borderBottomColor: colors.border,
                            borderLeftColor: notif.isRead ? 'transparent' : sevColor,
                          },
                          hovered && { backgroundColor: `${colors.accent}05` },
                          Platform.OS === 'web' && ({ cursor: notif.isRead ? 'default' : 'pointer' } as any),
                        ]}
                      >
                        <View style={[styles.notifIcon, { backgroundColor: `${config.color}12` }]}>
                          <IconComp size={14} color={config.color} />
                        </View>
                        <View style={styles.notifContent}>
                          <Text style={[typography.smallBold, { color: colors.text }]} numberOfLines={1}>
                            {notif.title}
                          </Text>
                          <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={2}>
                            {notif.message}
                          </Text>
                          <Text style={[typography.micro, { color: colors.textDisabled, marginTop: 2 }]}>
                            {formatRelativeDate(notif.createdAt)}
                          </Text>
                        </View>
                        {!notif.isRead && (
                          <View style={[styles.unreadDot, { backgroundColor: sevColor }]} />
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellBtn: { position: 'relative', padding: 8, borderRadius: 10 },
  badge: {
    position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18,
    borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  dropdown: {
    position: 'absolute', top: 60, right: 20,
    width: 400, maxHeight: 520, borderRadius: 16, borderWidth: 1, overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 12px 40px rgba(0,0,0,0.2)' } : {}),
  },
  dropdownHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  closeBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  list: { maxHeight: 440 },
  emptyState: { alignItems: 'center', padding: 40 },
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, borderBottomWidth: 1, borderLeftWidth: 3,
  },
  notifIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  notifContent: { flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
