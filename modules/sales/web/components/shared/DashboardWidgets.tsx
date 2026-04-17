import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnimatedCounter } from './index';

export const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string; barColor: string }> = {
  PROSPECTING: { label: 'Tiềm năng',  color: 'text-slate-500',   bg: 'bg-slate-500/10',   barColor: 'from-slate-400 to-slate-500' },
  QUALIFIED:   { label: 'Đủ ĐK',      color: 'text-blue-500',    bg: 'bg-blue-500/10',    barColor: 'from-blue-400 to-blue-600' },
  BOOKING:     { label: 'Giữ chỗ',    color: 'text-amber-500',   bg: 'bg-amber-500/10',   barColor: 'from-amber-400 to-amber-600' },
  DEPOSIT:     { label: 'Đặt cọc',    color: 'text-orange-500',  bg: 'bg-orange-500/10',  barColor: 'from-orange-400 to-orange-600' },
  CONTRACT:    { label: 'Ký HĐMB',    color: 'text-indigo-500',  bg: 'bg-indigo-500/10',  barColor: 'from-indigo-400 to-indigo-600' },
  CLOSED:      { label: 'Thành công',  color: 'text-emerald-500', bg: 'bg-emerald-500/10', barColor: 'from-emerald-400 to-emerald-600' },
  LOST:        { label: 'Mất',         color: 'text-rose-500',    bg: 'bg-rose-500/10',    barColor: 'from-rose-400 to-rose-600' },
};

export interface KPICardProps {
  icon: React.ReactNode; label: string; value: number;
  formatter?: (v: number) => string;
  suffix?: string; trend?: number; delay: number;
  gradient: string; iconColor: string;
}

export function KPICard({ icon, label, value, formatter, suffix, trend, delay, gradient, iconColor }: KPICardProps) {
  return (
    <div
      className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-sg-xl border border-slate-200/80 dark:border-sg-border p-5 shadow-sg-sm hover:shadow-sg-md transition-all hover:-translate-y-1 group relative overflow-hidden sg-stagger"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Ambient glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-linear-to-br ${gradient} blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-700`} />
      {/* Glass shimmer sweep */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${gradient} border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <p className="text-[10px] font-bold text-sg-muted uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <AnimatedCounter
            value={value}
            formatter={formatter || ((v: number) => Math.round(v).toLocaleString('vi-VN'))}
            className="text-[22px] font-black text-sg-heading tracking-tight"
          />
          {suffix && <span className="text-[10px] font-bold text-sg-muted">{suffix}</span>}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-[11px] font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}% vs tháng trước
          </div>
        )}
      </div>
    </div>
  );
}

export function QuickStat({ label, value, icon, color, bgColor, delay, formatter }: {
  label: string; value: number; icon: React.ReactNode; color: string; bgColor: string; delay: number; formatter?: (v: number) => string;
}) {
  return (
    <div className={`p-3.5 rounded-xl border bg-sg-card/50 hover:bg-sg-card/80 hover:-translate-y-0.5 transition-all group sg-stagger ${bgColor.includes('border') ? bgColor : `border-sg-border/50 ${bgColor}`}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">{label}</span>
      </div>
      <AnimatedCounter
        value={value}
        formatter={formatter || ((v: number) => Math.round(v).toLocaleString('vi-VN'))}
        className="text-[18px] font-black text-sg-heading"
      />
    </div>
  );
}

// Inject bar animation keyframes globally when using these widgets
if (typeof document !== 'undefined') {
  const styleId = 'sg-dashboard-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes bar-grow {
        from { transform: scaleY(0); transform-origin: bottom; }
        to { transform: scaleY(1); transform-origin: bottom; }
      }
      @keyframes bar-width {
        from { width: 0%; }
      }
    `;
    document.head.appendChild(style);
  }
}
