import { useEffect, useCallback, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../features/auth/store/authStore';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://sgroup-erp-backend.onrender.com';

/**
 * Hook to connect to the WebSocket notification server.
 * Auto-connects when user is authenticated, auto-disconnects on logout.
 * Maintains a list of notifications with unread count.
 */
export function useNotifications() {
  const user = useAuthStore(s => s.user);
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io(`${API_BASE}/notifications`, {
      query: { userId: user.id || user.email },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      setConnected(true);
      // Join rooms based on user context
      if (user.teamId) socket.emit('join:team', { teamId: user.teamId });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('notification', (payload: Omit<Notification, 'id' | 'read'>) => {
      const notif: Notification = {
        ...payload,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        read: false,
      };
      setNotifications(prev => [notif, ...prev].slice(0, 50)); // Keep last 50
    });

    socket.on('inventory:status_changed', (payload: any) => {
      const notif: Notification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'inventory_status',
        title: 'Cập nhật bảng hàng',
        message: `Căn ${payload.productId} chuyển ${payload.oldStatus} → ${payload.newStatus}`,
        data: payload,
        timestamp: payload.timestamp,
        read: false,
      };
      setNotifications(prev => [notif, ...prev].slice(0, 50));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, connected, markAsRead, markAllRead, clearAll };
}
