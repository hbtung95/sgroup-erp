import React from 'react';

// ═══════════════════════════════════════════════════════════
// EMPTY STATE — Cinematic empty state matching Project module
// ═══════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string; // tailwind color name e.g. 'emerald', 'cyan', 'amber'
}

export function EmptyState({
  icon, title, description, actionLabel, onAction, accentColor = 'emerald',
}: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px] sg-stagger" style={{ animationDelay: '200ms' }}>
      <div className="text-center bg-white dark:bg-black/30 backdrop-blur-[32px] p-16 rounded-sg-3xl border border-slate-200 dark:border-white/5 shadow-md relative overflow-hidden group max-w-md">
        {/* Gradient ambient */}
        <div className={`absolute inset-0 bg-linear-to-b from-${accentColor}-500/5 to-transparent pointer-events-none`} />

        {/* Icon with ping animation */}
        <div className={`w-24 h-24 mx-auto rounded-sg-2xl bg-${accentColor}-500/10 border border-${accentColor}-500/20 flex items-center justify-center mb-6 relative`}>
          <div className={`absolute inset-0 bg-${accentColor}-500/20 animate-ping rounded-sg-2xl opacity-20`} />
          <div className="relative z-10">{icon}</div>
        </div>

        {/* Content */}
        <h3 className="text-[24px] font-black text-sg-heading mb-3 tracking-tight">{title}</h3>
        <p className="text-[15px] font-semibold text-sg-subtext mb-8 max-w-[300px] mx-auto leading-relaxed">{description}</p>

        {/* CTA */}
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={`h-14 px-8 flex items-center gap-3 mx-auto bg-linear-to-r from-${accentColor}-500 to-${accentColor}-600 rounded-sg-xl text-white font-black text-[15px] shadow-[0_12px_24px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform relative overflow-hidden group/btn`}
          >
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover/btn:scale-100 transition-transform duration-500 rounded-sg-xl" />
            <span className="relative z-10">{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ANIMATED COUNTER — Number counting up from 0
// ═══════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (v: number) => string;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1200, formatter, className = '' }: AnimatedCounterProps) {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplayed(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value, duration]);

  const text = formatter ? formatter(displayed) : Math.round(displayed).toString();

  return <span className={className}>{text}</span>;
}

// ═══════════════════════════════════════════════════════════
// CONFIRM MODAL — Replacing confirm() dialogs
// ═══════════════════════════════════════════════════════════

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  isOpen, title, message, confirmLabel = 'Xác nhận', cancelLabel = 'Huỷ',
  variant = 'default', onConfirm, onCancel, loading,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const confirmStyles = {
    danger: 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-[0_8px_24px_rgba(244,63,94,0.3)]',
    warning: 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-[0_8px_24px_rgba(245,158,11,0.3)]',
    default: 'bg-linear-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_8px_24px_rgba(16,185,129,0.3)]',
  };

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div
        className="relative w-full max-w-sm bg-white dark:bg-[#0d0d0d]/95 backdrop-blur-3xl rounded-[24px] border border-slate-200 dark:border-sg-border shadow-[0_40px_80px_rgba(0,0,0,0.3)] p-8 text-center"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-[18px] font-black text-sg-heading mb-2">{title}</h3>
        <p className="text-[13px] font-medium text-sg-muted leading-relaxed mb-6">{message}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl bg-sg-btn-bg border border-sg-border text-[13px] font-bold text-sg-muted hover:text-sg-heading transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-12 rounded-xl text-[13px] font-black transition-all hover:-translate-y-0.5 disabled:opacity-50 ${confirmStyles[variant]}`}
          >
            {loading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
