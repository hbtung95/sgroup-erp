"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export type StatCardProps = {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  color: string;
  border: string;
  bg: string;
  icon: LucideIcon;
};

export default function StatCard({ title, value, trend, trendUp, color, border, bg, icon: Icon }: StatCardProps) {
  return (
    <div className={`glass-card p-6 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden border ${border}`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-40 ${bg}`}></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3.5 rounded-2xl ${bg} shadow-inner border border-white/5`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <span className={`text-xs font-black px-2.5 py-1 rounded-md bg-white/5 border border-white/10 ${trendUp ? 'text-emerald-400' : 'text-red-400'} shadow-sm`}>
          {trend}
        </span>
      </div>
      <div className="relative z-10">
        <p className="text-sm text-slate-400 font-bold mb-1 uppercase tracking-wider">{title}</p>
        <h3 className="text-4xl font-black text-white tracking-tight">{value}</h3>
      </div>
      
      {/* Progress line */}
      <div 
        className={`absolute bottom-0 left-0 h-1.5 ${bg.replace('/10', '/50')} transition-all duration-[1.5s] ease-out rounded-r`}
        style={{ width: trendUp ? '85%' : '40%' }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </div>
  );
}
