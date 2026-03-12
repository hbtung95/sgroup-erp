/**
 * ToastProvider — Lightweight toast notification system for React Native / Web
 * Usage:
 *   <ToastProvider> ... </ToastProvider>
 *   const { showToast } = useToast();
 *   showToast('Đã lưu thành công!', 'success');
 */
import React, { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { View, Text, Animated, Platform, TouchableOpacity } from 'react-native';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const TOAST_CONFIG: Record<ToastType, { icon: any; bg: string; border: string; text: string }> = {
  success: { icon: CheckCircle2, bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' },
  error:   { icon: AlertTriangle, bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' },
  warning: { icon: AlertTriangle, bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
  info:    { icon: Info, bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${++counterRef.current}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 99999,
          gap: 8,
          ...(Platform.OS === 'web' ? { pointerEvents: 'none' } : {}),
        } as any}
      >
        {toasts.map(toast => {
          const cfg = TOAST_CONFIG[toast.type];
          const Icon = cfg.icon;
          return (
            <View
              key={toast.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: cfg.bg,
                borderWidth: 1,
                borderColor: cfg.border,
                minWidth: 280,
                maxWidth: 420,
                ...(Platform.OS === 'web' ? {
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  pointerEvents: 'auto' as any,
                  animation: 'slideInRight 0.3s ease-out',
                } : {}),
              } as any}
            >
              <Icon size={18} color={cfg.text} />
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: cfg.text }}>
                {toast.message}
              </Text>
              <TouchableOpacity onPress={() => dismiss(toast.id)} activeOpacity={0.7}>
                <X size={14} color={cfg.text} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
}
