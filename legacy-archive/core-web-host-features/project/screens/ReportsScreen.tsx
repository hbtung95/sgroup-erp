import React, { useMemo } from 'react';
import { useProjects, useInventory } from '../hooks/useProjects';
import { BarChart3, PieChart, TrendingUp, Medal, MapPin, Building2, Crown } from 'lucide-react';
import { RE_PROPERTY_TYPE } from '../constants';

export function ReportsScreen() {
  const { data: projects } = useProjects();
  const { data: inventory } = useInventory();

  // Computations
  const stats = useMemo(() => {
    let totals = { land: 0, apartment: 0, villa: 0, shophouse: 0 };
    projects.forEach(p => {
      const t = p.type.toLowerCase() as keyof typeof totals;
      if (totals[t] !== undefined) totals[t] += p.totalUnits;
    });

    const leaderboard = [...projects]
      .sort((a, b) => b.soldUnits - a.soldUnits)
      .slice(0, 5);

    const maxSold = leaderboard.length ? leaderboard[0].soldUnits : 1;

    return { totals, leaderboard, maxSold };
  }, [projects, inventory]);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-auto custom-scrollbar p-4 sm:p-8 lg:px-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-fit mb-2 shadow-sm">
           <BarChart3 size={14} className="text-cyan-500 drop-shadow-sm" />
           <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest leading-none mt-0.5">Advanced Analytics</span>
        </div>
        <h2 className="text-[28px] sm:text-[32px] font-black text-sg-heading tracking-tight drop-shadow-md">Phân tích & Báo cáo</h2>
        <p className="text-[14px] font-bold text-sg-subtext mt-1">Biểu đồ tổng quan phân bổ bất động sản và hiệu suất kinh doanh.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        
        {/* Phân bổ Bất Động Sản */}
        <div className="bg-white dark:bg-black/30 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-2xl p-7 shadow-md transition-all">
          <div className="flex items-center gap-2 mb-6 border-b border-sg-border/60 pb-4">
             <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-sm">
               <PieChart size={20} />
             </div>
             <h3 className="text-[16px] font-black text-sg-heading uppercase tracking-wide drop-shadow-sm">Cơ cấu rổ hàng</h3>
          </div>
          <div className="flex flex-col gap-5">
            {Object.entries(stats.totals).map(([typeKey, count]) => {
              const ukey = typeKey.toUpperCase();
              const cfg = RE_PROPERTY_TYPE[ukey as keyof typeof RE_PROPERTY_TYPE] || RE_PROPERTY_TYPE.LAND;
              const total = Object.values(stats.totals).reduce((a, b) => a + b, 0);
              const pct = total === 0 ? 0 : Math.round((count / total) * 100);

              return (
                <div key={typeKey} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                     <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-inner w-24 text-center ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                       {cfg.label}
                     </span>
                     <div className="h-2 w-32 sm:w-48 bg-sg-bg rounded-full overflow-hidden border border-sg-border shadow-inner">
                       <div className={`h-full opacity-80 group-hover:opacity-100 transition-opacity ${cfg.bg.replace('/10', '/80')}`} style={{ width: `${pct}%` }} />
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[14px] font-black text-sg-heading drop-shadow-sm">{count} <span className="text-[11px] font-bold text-sg-muted">Sản phẩm</span></span>
                    <span className="text-[11px] font-extrabold text-sg-subtext">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Dự Án */}
        <div className="bg-white dark:bg-black/30 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-2xl p-7 shadow-md transition-all">
          <div className="flex items-center justify-between mb-6 border-b border-sg-border/60 pb-4">
             <div className="flex items-center gap-2">
               <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shadow-sm">
                 <Medal size={20} />
               </div>
               <h3 className="text-[16px] font-black text-sg-heading uppercase tracking-wide drop-shadow-sm">Top Dự Án Bán Chạy</h3>
             </div>
             <TrendingUp size={20} className="text-emerald-500" />
          </div>

          <div className="flex flex-col gap-4">
            {stats.leaderboard.length === 0 && (
              <p className="text-[13px] font-bold text-sg-muted text-center py-5">Chưa có dữ liệu giao dịch.</p>
            )}
            {stats.leaderboard.map((proj, idx) => {
              const progress = Math.max(5, (proj.soldUnits / stats.maxSold) * 100);
              return (
                <div key={proj.id} className="relative bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[20px] p-4 flex items-center gap-4 group hover:-translate-y-1 hover:bg-slate-100 dark:hover:bg-white/10 transition-all overflow-hidden shadow-sm">
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <Crown size={48} className="text-amber-500 blur-sm absolute -top-2 -right-2" />
                      <Crown size={24} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] relative z-10" />
                    </div>
                  )}
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-[13px] font-black shadow-inner 
                    ${idx === 0 ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 
                      idx === 1 ? 'bg-slate-400/20 border-slate-400/50 text-slate-400' : 
                      idx === 2 ? 'bg-orange-600/20 border-orange-600/50 text-orange-500' : 
                      'bg-sg-card border-sg-border text-sg-muted'}`}>
                    #{idx + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0 z-10">
                    <h4 className="text-[15px] font-black text-sg-heading truncate group-hover:text-cyan-500 transition-colors drop-shadow-sm">{proj.name}</h4>
                    <div className="relative mt-2 h-1.5 rounded-full bg-sg-btn-bg border border-sg-border shadow-inner max-w-[200px]">
                      <div className="absolute top-0 left-0 h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0 z-10">
                    <span className="text-[16px] font-black text-emerald-500 drop-shadow-sm">{proj.soldUnits}</span>
                    <span className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">Đã bán</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
