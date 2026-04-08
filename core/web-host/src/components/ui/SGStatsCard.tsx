import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SGStatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  onClick?: () => void;
  className?: string;
}

const VARIANTS = {
  primary: { bg: 'bg-sg-btn-bg dark:bg-white/5', iconColor: 'text-sg-heading', iconBg: 'bg-sg-btn-bg dark:bg-white/10' },
  success: { bg: 'bg-sg-card', iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  warning: { bg: 'bg-sg-card', iconColor: 'text-amber-500', iconBg: 'bg-amber-50 dark:bg-amber-500/10' },
  danger: { bg: 'bg-sg-card', iconColor: 'text-red-500', iconBg: 'bg-red-50 dark:bg-red-500/10' },
  info: { bg: 'bg-sg-card', iconColor: 'text-blue-500', iconBg: 'bg-blue-50 dark:bg-blue-500/10' },
  purple: { bg: 'bg-sg-card', iconColor: 'text-purple-500', iconBg: 'bg-purple-50 dark:bg-purple-500/10' },
};

export const SGStatsCard: React.FC<SGStatsCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  variant = 'primary',
  onClick,
  className = '',
}) => {
  const v = VARIANTS[variant];
  return (
    <div 
      onClick={onClick}
      className={`border border-sg-border p-6 rounded-[24px] shadow-sm flex flex-col ${v.bg} ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : ''} ${className}`}
    >
      <div className="flex flex-row items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${v.iconBg}`}>
          <Icon size={20} className={v.iconColor} />
        </div>
        <span className="text-[11px] font-black text-sg-subtext uppercase tracking-wider leading-tight">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5 mt-auto">
        <span className="text-[36px] font-black text-sg-heading tracking-tight leading-none truncate">{value}</span>
        {unit && <span className="text-[14px] font-bold text-sg-subtext shrink-0">{unit}</span>}
      </div>
    </div>
  );
};
