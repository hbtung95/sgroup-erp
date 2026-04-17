import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// CINEMATIC DRAWER — Portal-based slide-in panel
// Matching Project module UnitDrawer quality
// ═══════════════════════════════════════════════════════════

interface CinematicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string; // e.g. 'emerald', 'amber', 'blue', 'rose'
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const ACCENT_MAP: Record<string, { bg: string; border: string; glow: string }> = {
  emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', glow: 'bg-emerald-500' },
  amber:   { bg: 'bg-amber-500/20',   border: 'border-amber-500/30',   glow: 'bg-amber-500' },
  blue:    { bg: 'bg-blue-500/20',     border: 'border-blue-500/30',    glow: 'bg-blue-500' },
  rose:    { bg: 'bg-rose-500/20',     border: 'border-rose-500/30',    glow: 'bg-rose-500' },
  orange:  { bg: 'bg-orange-500/20',   border: 'border-orange-500/30',  glow: 'bg-orange-500' },
  violet:  { bg: 'bg-violet-500/20',   border: 'border-violet-500/30',  glow: 'bg-violet-500' },
  cyan:    { bg: 'bg-cyan-500/20',     border: 'border-cyan-500/30',    glow: 'bg-cyan-500' },
};

export function CinematicDrawer({
  isOpen, onClose, title, subtitle, icon, accentColor = 'emerald',
  width = 'max-w-[500px]', children, footer,
}: CinematicDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.emerald;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9990] bg-black/60 backdrop-blur-[20px] transition-all duration-500 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-[9991] w-full ${width} bg-white dark:bg-black/80 backdrop-blur-3xl border-l border-slate-200 dark:border-white/5 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isAnimating
            ? 'translate-x-0 shadow-[-20px_0_60px_rgba(0,0,0,0.5)]'
            : 'translate-x-full shadow-none'
        }`}
      >
        {/* Cinematic Backdrop Accents */}
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
        <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full ${accent.bg} blur-[100px] opacity-20 pointer-events-none`} />
        <div className={`absolute -bottom-32 -left-32 w-60 h-60 rounded-full ${accent.bg} blur-[80px] opacity-10 pointer-events-none`} />

        {/* Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-slate-200/80 dark:border-white/5 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              {icon && (
                <div className={`w-16 h-16 rounded-sg-xl flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.2)] ${accent.bg} border ${accent.border} relative group`}>
                  <div className={`absolute -inset-4 rounded-sg-2xl border ${accent.border} opacity-50 animate-pulse`} />
                  <span className="relative z-10">{icon}</span>
                </div>
              )}
              <div className="flex flex-col">
                <h2 className="text-[28px] font-black text-transparent bg-clip-text bg-linear-to-r from-sg-heading to-sg-heading/70 tracking-tight leading-none">
                  {title}
                </h2>
                {subtitle && (
                  <span className="text-[11px] font-bold text-sg-muted mt-2 uppercase tracking-widest">{subtitle}</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-center text-sg-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors shadow-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 flex flex-col gap-6 z-10 relative">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-6 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-black/50 backdrop-blur-3xl flex items-center gap-4 z-20">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

// ═══ DRAWER SUB-COMPONENTS ═══

export function DrawerSection({ title, icon, children, className = '' }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-slate-50 dark:bg-black/30 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-sg-xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)] ${className}`}>
      <h4 className="text-[11px] font-black text-sg-subtext uppercase tracking-widest mb-4 flex items-center gap-2">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

export function DrawerHeroCard({ children, gradient = 'from-emerald-500/10 to-cyan-500/5', borderColor = 'border-emerald-500/20' }: {
  children: React.ReactNode; gradient?: string; borderColor?: string;
}) {
  return (
    <div className={`bg-linear-to-br ${gradient} border ${borderColor} rounded-sg-xl p-6 shadow-[0_8px_32px_rgba(16,185,129,0.05)] relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-2xl group-hover:bg-cyan-500/20 transition-all duration-700" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function DrawerDetailRow({ icon, label, value }: {
  icon?: React.ReactNode; label: string; value: string | React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      {icon && (
        <div className="w-10 h-10 rounded-[14px] bg-sg-btn-bg border border-sg-border flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <p className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">{label}</p>
        <div className="text-[15px] font-black text-sg-heading">{value}</div>
      </div>
    </div>
  );
}

export function DrawerActionButton({ children, variant = 'primary', onClick, disabled, loading }: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const styles = {
    primary: 'bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-[0_8px_24px_rgba(16,185,129,0.3)]',
    secondary: 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sg-heading shadow-[0_4px_16px_rgba(0,0,0,0.1)]',
    danger: 'bg-linear-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white shadow-[0_8px_24px_rgba(244,63,94,0.3)]',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex-1 h-14 flex items-center justify-center gap-2 rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 disabled:opacity-50 relative overflow-hidden group ${styles[variant]}`}
    >
      <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}
