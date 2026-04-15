import React from 'react';

const fmt = (n: number) => n.toLocaleString('vi-VN');

export interface StaffStatsCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
  gradient: string;
}

export function StaffStatsCard({ label, value, icon: Icon, color, bg, gradient }: StaffStatsCardProps) {
  return (
    <div className="bg-sg-card border border-sg-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} mix-blend-luminosity group-hover:mix-blend-normal transition-all z-10`}>
          <Icon size={22} className={color} />
        </div>
      </div>
      <div className="relative z-10">
        <span className="text-4xl font-black text-sg-heading tracking-tight block leading-none">{fmt(value)}</span>
        <span className="text-xs font-extrabold text-sg-muted uppercase tracking-wider mt-2 block">{label}</span>
      </div>
      {/* Hover Gradient Overlay */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-2xl rounded-full transition-opacity duration-500 pointer-events-none -mr-10 -mt-10`} />
    </div>
  );
}
