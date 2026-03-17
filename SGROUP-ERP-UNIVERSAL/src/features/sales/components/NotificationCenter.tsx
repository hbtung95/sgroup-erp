/**
 * NotificationCenter — Dropdown inbox for viewing WebSocket notifications
 * Usage: <NotificationCenter isDark={isDark} />
 */
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react-native';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: 'deal' | 'booking' | 'alert' | 'info';
  read: boolean;
  timestamp: string;
};

type Props = { isDark?: boolean };

const TYPE_COLORS: Record<string, string> = {
  deal: '#22c55e', booking: '#3b82f6', alert: '#ef4444', info: '#f59e0b',
};

export function NotificationCenter({ isDark = false }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /** Call this from your WebSocket handler to push a new notification */
  const pushNotification = useCallback((item: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) => {
    setNotifications(prev => [{
      ...item,
      id: `n${Date.now()}`,
      read: false,
      timestamp: new Date().toISOString(),
    }, ...prev]);
  }, []);

  return (
    <View style={{ position: 'relative', zIndex: 9999 }}>
      {/* Bell button */}
      <TouchableOpacity
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.7}
        style={{ padding: 8, position: 'relative' }}
      >
        <Bell size={22} color={isDark ? '#94a3b8' : '#64748b'} />
        {unreadCount > 0 && (
          <View style={{
            position: 'absolute', top: 2, right: 2,
            width: 18, height: 18, borderRadius: 9,
            backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff' }}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Dropdown */}
      {open && (
        <View style={{
          position: 'absolute', top: 44, right: 0,
          width: 360, maxHeight: 420,
          backgroundColor: isDark ? '#1e293b' : '#fff',
          borderRadius: 16, borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          ...(Platform.OS === 'web' ? {
            boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
          } : { elevation: 8 }),
        } as any}>
          {/* Header */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 16, paddingVertical: 14,
            borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
          }}>
            <Text style={{ fontSize: 15, fontWeight: '900', color: isDark ? '#e2e8f0' : '#1e293b' }}>
              Thông báo
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
                  <CheckCheck size={16} color="#3b82f6" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setOpen(false)} activeOpacity={0.7}>
                <X size={16} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>🔔</Text>
                <Text style={{ fontSize: 13, color: isDark ? '#64748b' : '#94a3b8', fontWeight: '600' }}>
                  Không có thông báo
                </Text>
              </View>
            ) : (
              notifications.map(n => (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => markRead(n.id)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row', gap: 12, padding: 14,
                    backgroundColor: !n.read
                      ? (isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)')
                      : 'transparent',
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  }}
                >
                  <View style={{
                    width: 8, height: 8, borderRadius: 4, marginTop: 6,
                    backgroundColor: n.read ? 'transparent' : TYPE_COLORS[n.type] || '#3b82f6',
                  }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                      {n.title}
                    </Text>
                    <Text style={{ fontSize: 12, fontWeight: '500', color: isDark ? '#64748b' : '#94a3b8', marginTop: 2 }}>
                      {n.message}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeNotification(n.id)} activeOpacity={0.7} style={{ padding: 4 }}>
                    <Trash2 size={12} color={isDark ? '#475569' : '#cbd5e1'} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
