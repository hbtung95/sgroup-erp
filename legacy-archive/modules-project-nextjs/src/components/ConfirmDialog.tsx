"use client";

import { AlertTriangle, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    warning: "bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    info: "bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            variant === "danger" ? "bg-red-100 dark:bg-red-500/10" : variant === "warning" ? "bg-amber-100 dark:bg-amber-500/10" : "bg-blue-100 dark:bg-blue-500/10"
          }`}>
            <AlertTriangle className={`w-5 h-5 ${
              variant === "danger" ? "text-red-500 dark:text-red-400" : variant === "warning" ? "text-amber-500 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50 ${variantStyles[variant]}`}
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
