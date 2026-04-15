import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const VARIANT_STYLES = {
  danger: {
    icon: 'bg-red-500/10 border-red-500/20 text-red-500',
    btn: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
    defaultConfirm: 'Xóa',
  },
  warning: {
    icon: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
    defaultConfirm: 'Xác nhận',
  },
  info: {
    icon: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    btn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30',
    defaultConfirm: 'Đồng ý',
  },
};

export function SGConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Hủy bỏ',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const styles = VARIANT_STYLES[variant];
  const resolvedConfirmLabel = confirmLabel || styles.defaultConfirm;

  return (
    <div
      className="fixed inset-0 z-99998 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ animation: 'sgToastIn 0.2s ease-out' }}
    >
      <div className="absolute inset-0" onClick={onCancel} />
      <div
        className="relative w-full max-w-[420px] bg-sg-card rounded-sg-xl border border-sg-border shadow-2xl shadow-black/20 overflow-hidden"
        style={{ animation: 'sgSlideUpDialog 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${styles.icon}`}>
            <AlertTriangle size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-sg-heading tracking-tight">{title}</h3>
            <p className="text-[13px] font-medium text-sg-subtext mt-1.5 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-colors text-sg-muted"
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-extrabold text-[13px] text-sg-subtext bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-xl font-black text-[13px] text-white shadow-lg transition-all flex items-center gap-2 ${isLoading ? 'opacity-60 cursor-not-allowed' : `${styles.btn} hover:-translate-y-0.5`}`}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
