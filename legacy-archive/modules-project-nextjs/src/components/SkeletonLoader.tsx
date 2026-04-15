"use client";

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
        <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700/50 rounded-md" />
      </div>
      <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700/50 rounded mb-4" />
      <div className="space-y-2">
        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700/50 rounded" />
        <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700/50 rounded" />
      </div>
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700/50 rounded" />
        <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700/50 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass-card rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700/50" />
      </div>
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/50 rounded mb-2" />
      <div className="h-7 w-16 bg-slate-200 dark:bg-slate-700/50 rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-10 bg-slate-200 dark:bg-slate-800/50 rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900/30 rounded-lg" />
      ))}
    </div>
  );
}
