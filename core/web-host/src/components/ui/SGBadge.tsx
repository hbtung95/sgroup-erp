import React from 'react';

type SGBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface SGBadgeProps {
  children: React.ReactNode;
  variant?: SGBadgeVariant;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const VARIANTS: Record<SGBadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
  danger: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400',
  default: 'bg-sg-btn-bg text-sg-subtext',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-[11px]',
  lg: 'px-3 py-1.5 text-[12px]',
};

export const SGBadge: React.FC<SGBadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  return (
    <span className={`inline-flex items-center justify-center rounded-[8px] font-black uppercase tracking-wider ${VARIANTS[variant]} ${SIZES[size]} ${className}`}>
      {children}
    </span>
  );
};
