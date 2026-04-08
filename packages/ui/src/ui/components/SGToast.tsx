import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Animated, Pressable, StyleSheet, Platform } from 'react-native';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastConfig = { type: ToastType; title: string; message?: string; duration?: number };
type ToastItem = ToastConfig & { id: number };
type ToastCtx = { toast: (cfg: ToastConfig) => void };

const Ctx = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const c = useTheme();
  const slideY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, friction: 10, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => dismiss(), item.duration || 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: -100, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onDismiss(item.id));
  };

  const cfg: Record<ToastType, { icon: any; clr: string }> = {
    success: { icon: CheckCircle2, clr: '#10b981' },
    error: { icon: XCircle, clr: '#ef4444' },
    warning: { icon: AlertCircle, clr: '#f59e0b' },
    info: { icon: Info, clr: '#3b82f6' },
  };
  const { icon: Icon, clr } = cfg[item.type];

  return (
    <Animated.View style={[styles.toast, { backgroundColor: c.bgSecondary, borderColor: `${clr}30`,
      transform: [{ translateY: slideY }], opacity },
      Platform.OS === 'web' && ({ ...sgds.glass, boxShadow: `0 8px 32px rgba(0,0,0,0.2)` } as any)]}>
      <View style={[styles.iconBox, { backgroundColor: `${clr}15` }]}>
        <Icon size={18} color={clr} strokeWidth={2.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyBold, { color: c.text }]}>{item.title}</Text>
        {item.message && <Text style={[typography.small, { color: c.textSecondary, marginTop: 2 }]}>{item.message}</Text>}
      </View>
      <Pressable onPress={dismiss} style={[styles.closeBtn, { backgroundColor: c.bgTertiary }]}>
        <X size={16} color={c.textTertiary} />
      </Pressable>
    </Animated.View>
  );
}

export function SGToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((cfg: ToastConfig) => {
    setToasts(p => [...p, { ...cfg, id: ++idRef.current }]);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(t => <Toast key={t.id} item={t} onDismiss={id => setToasts(p => p.filter(x => x.id !== id))} />)}
      </View>
    </Ctx.Provider>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 24, right: 24, zIndex: 9999, gap: 12, maxWidth: 420, minWidth: 320 },
  toast: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.base, borderRadius: radius.xl, borderWidth: 1, gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  closeBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
