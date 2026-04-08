import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react-native';
import { useTheme } from '../theme/theme';
import { useThemeStore } from '../theme/themeStore';
import { useNotifications, Notification } from '../hooks/useNotifications';

/**
 * Notification bell icon with badge + dropdown panel.
 * Place in any shell header bar.
 */
export function NotificationBell() {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ position: 'relative', zIndex: 999 }}>
      {/* Bell Icon */}
      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.bellBtn}>
        <Bell size={22} color={colors.text} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown Panel */}
      {open && (
        <View style={[styles.panel, {
          backgroundColor: isDark ? '#1e293b' : '#fff',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
          ...(Platform.OS === 'web' ? { boxShadow: '0 12px 40px rgba(0,0,0,0.2)' } : {}),
        } as any]}>
          {/* Header */}
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Thông báo</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={markAllRead} style={styles.headerBtn}>
                <CheckCheck size={14} color="#10b981" />
              </TouchableOpacity>
              <TouchableOpacity onPress={clearAll} style={styles.headerBtn}>
                <Trash2 size={14} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOpen(false)} style={styles.headerBtn}>
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={32} color={isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'} />
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>Chưa có thông báo</Text>
              </View>
            ) : (
              notifications.map(n => (
                <TouchableOpacity key={n.id} onPress={() => markAsRead(n.id)}
                  style={[styles.notifItem, {
                    backgroundColor: !n.read ? (isDark ? 'rgba(16,185,129,0.05)' : '#f0fdf4') : 'transparent',
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                  }]}>
                  {!n.read && <View style={styles.unreadDot} />}
                  <View style={{ flex: 1, marginLeft: !n.read ? 8 : 16 }}>
                    <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>{n.title}</Text>
                    <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>{n.message}</Text>
                    <Text style={[styles.notifTime, { color: colors.textTertiary }]}>
                      {new Date(n.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bellBtn: { position: 'relative', padding: 8 },
  badge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: '#ef4444', borderRadius: 10,
    minWidth: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  panel: {
    position: 'absolute', top: 44, right: 0,
    width: 360, borderRadius: 16, borderWidth: 1,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  panelTitle: { fontSize: 16, fontWeight: '800' },
  headerBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(150,150,150,0.08)' },
  notifItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, paddingRight: 16, borderBottomWidth: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', marginTop: 6, marginLeft: 12 },
  notifTitle: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  notifMessage: { fontSize: 12, lineHeight: 18 },
  notifTime: { fontSize: 10, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 13, fontWeight: '600' },
});
