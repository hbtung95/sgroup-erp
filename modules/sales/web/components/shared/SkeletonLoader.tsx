import React from 'react';

// ═══════════════════════════════════════════════════════════
// SKELETON LOADER — Shimmer placeholders
// Neo-Glassmorphism v2.2 compliant
// ═══════════════════════════════════════════════════════════

function SkeletonBase({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5 ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
    </div>
  );
}

export function SkeletonKPICard() {
  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[24px] border border-slate-200/80 dark:border-sg-border p-5 shadow-sg-sm">
      <SkeletonBase className="w-10 h-10 rounded-xl mb-3" />
      <SkeletonBase className="w-20 h-3 mb-2" />
      <SkeletonBase className="w-28 h-7 mb-2" />
      <SkeletonBase className="w-24 h-3" />
    </div>
  );
}

export function SkeletonChart({ height = 'h-[220px]' }: { height?: string }) {
  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md">
      <div className="flex items-center gap-3 mb-6">
        <SkeletonBase className="w-10 h-10 rounded-xl" />
        <div className="space-y-2">
          <SkeletonBase className="w-32 h-4" />
          <SkeletonBase className="w-20 h-3" />
        </div>
      </div>
      <div className={`flex items-end gap-2 ${height} px-2`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonBase
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-50 dark:border-sg-border/20">
      <SkeletonBase className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="w-36 h-4" />
        <SkeletonBase className="w-24 h-3" />
      </div>
      <SkeletonBase className="w-20 h-4" />
      <SkeletonBase className="w-16 h-6 rounded-lg" />
      <SkeletonBase className="w-24 h-4" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[20px] border border-slate-200/80 dark:border-sg-border p-5 shadow-sg-sm">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBase className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="w-28 h-4" />
          <SkeletonBase className="w-20 h-3" />
        </div>
        <SkeletonBase className="w-16 h-6 rounded-lg" />
      </div>
      <div className="space-y-2 mb-4">
        <SkeletonBase className="w-full h-3" />
        <SkeletonBase className="w-3/4 h-3" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SkeletonBase className="h-14 rounded-lg" />
        <SkeletonBase className="h-14 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonLeaderboard({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md">
      <div className="flex items-center gap-3 mb-5">
        <SkeletonBase className="w-10 h-10 rounded-xl" />
        <SkeletonBase className="w-24 h-5" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-sg-card/30">
            <SkeletonBase className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <SkeletonBase className="w-28 h-3.5" />
              <SkeletonBase className="w-20 h-2.5" />
            </div>
            <SkeletonBase className="w-16 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Inject shimmer keyframes
if (typeof document !== 'undefined') {
  const styleId = 'sg-skeleton-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  }
}
