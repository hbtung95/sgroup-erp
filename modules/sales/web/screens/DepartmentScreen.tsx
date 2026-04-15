import React, { useState } from 'react';
import {
  Building2, Search, Users, Award, TrendingDown,
  BarChart4, ArrowRight, TrendingUp, Target, Crown
} from 'lucide-react';

/* ════════════════════════════════════════════════════════
   MOCK DATA
   ════════════════════════════════════════════════════════ */

const MOCK_DEPTS = [
  { id: '1', name: 'Phòng KD Vùng 1', manager: 'Trần Thế X', membersCount: 12, target: 50000000000, achieved: 32000000000, growth: 12, status: 'HEALTHY' },
  { id: '2', name: 'Phòng KD Vùng 2', manager: 'Nguyễn Thị Y', membersCount: 8, target: 30000000000, achieved: 28000000000, growth: 25, status: 'EXCELLENT' },
  { id: '3', name: 'Phòng KD Miền Nam', manager: 'Lê Hữu Z', membersCount: 15, target: 80000000000, achieved: 41000000000, growth: -5, status: 'WARNING' },
];

const formatCurrency = (val: number) => {
  if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} Tỷ`;
  return new Intl.NumberFormat('vi-VN').format(val);
};

const DEPT_GRADIENTS = [
  'from-indigo-500 to-blue-600',
  'from-purple-500 to-fuchsia-600',
  'from-rose-500 to-pink-600',
];

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */

export function DepartmentScreen() {
  const [search, setSearch] = useState('');

  const totalRevenue = MOCK_DEPTS.reduce((s, d) => s + d.achieved, 0);
  const totalStaff = MOCK_DEPTS.reduce((s, d) => s + d.membersCount, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-hidden">
      <div className="fixed top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ═══ Header ═══ */}
      <div className="px-6 sm:px-10 lg:px-12 py-8 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/30 backdrop-blur-3xl relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sg-stagger" style={{ animationDelay: '0ms' }}>
          <div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/10 border border-purple-500/30 w-fit mb-3 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
              <Crown size={14} className="text-purple-500 drop-shadow-sm" />
              <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em]">Điều Hành Cấp Giám Đốc</span>
            </div>
            <h2 className="text-[36px] sm:text-[40px] font-black text-sg-heading tracking-tight drop-shadow-sm leading-none">Quản Lý Phòng Ban</h2>
          </div>

          <div className="relative flex items-center h-13 bg-white dark:bg-black/40 backdrop-blur-2xl border border-slate-200 dark:border-white/5 hover:border-purple-500/40 rounded-2xl px-5 transition-all w-full sm:w-80 shadow-sm group">
            <Search size={18} className="text-sg-muted group-hover:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng kinh doanh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none ml-3 text-[14px] font-bold text-sg-heading w-full placeholder:text-sg-muted/60"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 sm:px-10 lg:px-12 py-8 overflow-y-auto custom-scrollbar flex flex-col gap-8 pb-20">

        {/* ═══ Director KPI Summary ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sg-stagger" style={{ animationDelay: '100ms' }}>
          <div className="bg-white dark:bg-black/20 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 rounded-[32px] p-8 relative overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[50px] pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-14 h-14 rounded-[18px] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                <BarChart4 size={26} />
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-black text-emerald-500 uppercase tracking-widest shadow-sm">+18.5% YoY</span>
            </div>
            <span className="text-[14px] font-bold text-sg-subtext uppercase tracking-wider mb-2 relative z-10">Tổng Doanh Số Công Ty</span>
            <span className="text-[48px] font-black bg-clip-text text-transparent bg-gradient-to-r from-sg-heading to-indigo-400 relative z-10 leading-none">{formatCurrency(totalRevenue)}</span>
          </div>

          <div className="bg-white dark:bg-black/20 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 rounded-[32px] p-8 relative overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[50px] pointer-events-none group-hover:bg-purple-500/20 transition-all" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-14 h-14 rounded-[18px] bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                <Users size={26} />
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] font-black text-sg-heading uppercase tracking-widest shadow-sm">{MOCK_DEPTS.length} Khối</span>
            </div>
            <span className="text-[14px] font-bold text-sg-subtext uppercase tracking-wider mb-2 relative z-10">Tổng Quân Số Bán Hàng</span>
            <div className="relative z-10 flex items-baseline gap-2">
              <span className="text-[48px] font-black text-sg-heading leading-none">{totalStaff}</span>
              <span className="text-[20px] font-black text-sg-muted">Sales</span>
            </div>
          </div>
        </div>

        {/* ═══ Departments Grid ═══ */}
        <div className="flex flex-col gap-5">
          <h3 className="text-[18px] font-black tracking-tight flex items-center gap-2 pl-1">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full" /> Danh Sách Phòng Kinh Doanh
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6 sg-stagger" style={{ animationDelay: '200ms' }}>
            {MOCK_DEPTS.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map((dept, idx) => {
              const p = Math.min((dept.achieved / dept.target) * 100, 100);
              const statusConfig = dept.status === 'EXCELLENT'
                ? { label: 'XUẤT SẮC', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
                : dept.status === 'WARNING'
                  ? { label: 'CẦN CHÚ Ý', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
                  : { label: 'ỔN ĐỊNH', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };

              const avatarGradient = DEPT_GRADIENTS[idx % DEPT_GRADIENTS.length];

              return (
                <div key={dept.id} className="bg-white dark:bg-black/20 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 p-7 rounded-[28px] flex flex-col gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                  <div className={`absolute -right-16 -top-16 w-40 h-40 rounded-full ${statusConfig.bg} blur-[50px] opacity-0 group-hover:opacity-50 transition-opacity duration-700 pointer-events-none`} />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white shadow-inner border border-white/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}>
                        <Building2 size={22} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[18px] font-black text-sg-heading tracking-tight leading-tight group-hover:text-purple-500 transition-colors">{dept.name}</span>
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-sg-subtext">
                          <Users size={12} /> {dept.manager} (Trưởng phòng)
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xs border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Revenue Progress */}
                  <div className="flex flex-col gap-2 mt-2 relative z-10">
                    <div className="flex items-end justify-between">
                      <span className="text-[11px] font-black text-sg-muted uppercase tracking-widest">Tiến Độ Doanh Số</span>
                      <span className="text-[20px] font-black text-sg-heading">{p.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200/80 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-full overflow-hidden relative shadow-inner">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${dept.status === 'WARNING' ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[12px] font-bold text-sg-subtext">Đã đạt: {formatCurrency(dept.achieved)}</span>
                      <span className="text-[12px] font-bold text-sg-muted">Target: {formatCurrency(dept.target)}</span>
                    </div>
                  </div>

                  {/* Growth & Staff footer */}
                  <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-white/5 pt-5 mt-auto relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 rounded-xl shadow-sm">
                        <Users size={14} className="text-sg-muted" />
                        <span className="text-[13px] font-black text-sg-heading">{dept.membersCount} Nhân sự</span>
                      </div>
                      <span className={`text-[12px] font-black flex items-center gap-1 ${dept.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {dept.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {dept.growth >= 0 ? '+' : ''}{dept.growth}%
                      </span>
                    </div>
                    <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200/80 dark:border-white/5 hover:bg-purple-500 hover:border-purple-500 transition-colors group/btn shadow-sm">
                      <ArrowRight size={16} className="text-sg-muted group-hover/btn:text-white transition-colors" />
                    </button>
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
