import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// TOAST NOTIFICATION SYSTEM — Replacing all alert() calls
// Neo-Glassmorphism v2.2 compliant
// ═══════════════════════════════════════════════════════════

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// Convenience helpers
export function useToastActions() {
  const { addToast } = useToast();
  return {
    success: (message: string, description?: string) =>
      addToast({ message, description, variant: 'success' }),
    error: (message: string, description?: string) =>
      addToast({ message, description, variant: 'error' }),
    warning: (message: string, description?: string) =>
      addToast({ message, description, variant: 'warning' }),
    info: (message: string, description?: string) =>
      addToast({ message, description, variant: 'info' }),
  };
}

const VARIANT_CONFIG: Record<ToastVariant, {
  icon: React.ReactNode;
  bg: string;
  border: string;
  iconColor: string;
  glow: string;
}> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-500',
    glow: 'shadow-[0_8px_32px_rgba(16,185,129,0.15)]',
  },
  error: {
    icon: <AlertCircle size={18} />,
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    iconColor: 'text-rose-500',
    glow: 'shadow-[0_8px_32px_rgba(244,63,94,0.15)]',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-500',
    glow: 'shadow-[0_8px_32px_rgba(245,158,11,0.15)]',
  },
  info: {
    icon: <Info size={18} />,
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-500',
    glow: 'shadow-[0_8px_32px_rgba(59,130,246,0.15)]',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {createPortal(
        <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none max-w-[420px]">
          {toasts.map((toast, idx) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => removeToast(toast.id)}
              index={idx}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss, index }: { toast: Toast; onDismiss: () => void; index: number }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const config = VARIANT_CONFIG[toast.variant];
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    requestAnimationFrame(() => setIsEntered(true));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl border backdrop-blur-3xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${config.bg} ${config.border} ${config.glow} bg-white/90 dark:bg-black/80 ${
        isEntered && !isExiting
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 translate-x-8 scale-95'
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-sg-heading leading-snug">{toast.message}</p>
        {toast.description && (
          <p className="text-[11px] font-medium text-sg-muted mt-0.5 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <X size={12} className="text-sg-muted" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full overflow-hidden bg-black/5 dark:bg-white/5">
        <div
          className={`h-full rounded-full ${config.iconColor.replace('text-', 'bg-')} opacity-40`}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

// CSS animation for toast progress (inject via style tag)
if (typeof document !== 'undefined') {
  const styleId = 'sg-toast-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes toast-progress {
        from { width: 100%; }
        to { width: 0%; }
      }
    `;
    document.head.appendChild(style);
  }
}
