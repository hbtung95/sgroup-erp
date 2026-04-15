"use client";

import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; isUp: boolean };
  color?: string;
  borderColor?: string;
  glowColor?: string;
};

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  color = "text-blue-400",
  borderColor = "border-blue-500/30",
  glowColor = "bg-blue-500/10",
}: Props) {
  return (
    <div
      className={`glass-card rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1.5 relative overflow-hidden border ${borderColor}`}
    >
      {/* Glow Background */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-40 ${glowColor}`} />

      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${glowColor} shadow-inner border border-white/5`}>
          <span className={color}>{icon}</span>
        </div>
        {trend && (
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-md bg-white/5 border border-white/10 shadow-sm ${
              trend.isUp ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend.isUp ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-sm text-slate-400 font-bold mb-1 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-white tracking-tight">
          {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
        </p>
        {subtitle && <p className="text-xs text-slate-500 mt-1.5 font-medium">{subtitle}</p>}
      </div>

      {/* Progress line */}
      <div
        className={`absolute bottom-0 left-0 h-1.5 ${glowColor.replace("/10", "/50")} transition-all duration-[1.5s] ease-out rounded-r`}
        style={{ width: trend?.isUp ? "85%" : "40%" }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
