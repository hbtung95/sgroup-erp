import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function SGSkeleton({
  className = '',
  variant = 'text',
  width,
  height,
  lines,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-sg-border/60 dark:bg-white/[0.06]';

  const variantClasses: Record<string, string> = {
    text: 'rounded-lg h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-2xl',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (lines && lines > 1) {
    return (
      <div className={`flex flex-col gap-2.5 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{ ...style, width: index === lines - 1 ? '60%' : style.width }}
          />
        ))}
      </div>
    );
  }

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={style} />;
}

export function SkeletonStatsCard() {
  return (
    <div className="bg-sg-card border border-sg-border p-6 rounded-sg-xl shadow-sm flex flex-col animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-sg-border/60 dark:bg-white/6" />
        <div className="h-3 w-24 rounded-lg bg-sg-border/60 dark:bg-white/6" />
      </div>
      <div className="h-9 w-16 rounded-lg bg-sg-border/60 dark:bg-white/6" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className={`h-4 rounded-lg bg-sg-border/60 dark:bg-white/6 ${index === 0 ? 'w-32' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonEmployeeCard() {
  return (
    <div className="bg-sg-card border border-sg-border rounded-sg-xl p-6 shadow-sm animate-pulse flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-sg-border/60 dark:bg-white/6" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 w-28 rounded-lg bg-sg-border/60 dark:bg-white/6" />
          <div className="h-3 w-20 rounded-lg bg-sg-border/60 dark:bg-white/6" />
        </div>
      </div>
      <div className="h-px bg-sg-border" />
      <div className="flex justify-between">
        <div className="h-3 w-16 rounded-lg bg-sg-border/60 dark:bg-white/6" />
        <div className="h-5 w-20 rounded-lg bg-sg-border/60 dark:bg-white/6" />
      </div>
    </div>
  );
}

export function SkeletonDashboardPanel() {
  return (
    <div className="bg-sg-card border border-sg-border rounded-[28px] p-8 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-sg-border/60 dark:bg-white/6" />
        <div className="h-5 w-48 rounded-lg bg-sg-border/60 dark:bg-white/6" />
      </div>
      <div className="flex flex-col gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex justify-between items-end">
            <div className="flex-1">
              <div className="h-4 w-28 rounded-lg bg-sg-border/60 dark:bg-white/6 mb-2" />
              <div className="h-2 rounded-full bg-sg-border/60 dark:bg-white/6" style={{ width: `${30 + item * 15}%` }} />
            </div>
            <div className="h-4 w-14 rounded-lg bg-sg-border/60 dark:bg-white/6 ml-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
