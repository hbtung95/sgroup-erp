import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Users,
  Award,
  TrendingDown,
  BarChart4,
  ArrowRight
} from 'lucide-react';

const MOCK_DEPTS = [
  { id: '1', name: 'Phòng KD Vùng 1', manager: 'Trần Thế X', membersCount: 12, target: 50000000000, achieved: 32000000000, growth: 12, status: 'HEALTHY' },
  { id: '2', name: 'Phòng KD Vùng 2', manager: 'Nguyễn Thị Y', membersCount: 8, target: 30000000000, achieved: 28000000000, growth: 25, status: 'EXCELLENT' },
  { id: '3', name: 'Phòng KD Miền Nam', manager: 'Lê Hữu Z', membersCount: 15, target: 80000000000, achieved: 41000000000, growth: -5, status: 'WARNING' },
];

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export function DepartmentScreen() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-hidden pb-10">
      <div className="fixed top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="px-6 sm:px-10 lg:px-12 py-8 border-b border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/30 backdrop-blur-3xl relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sg-stagger" style={{ animationDelay: '0ms' }}>
          <div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-purple-500/20 to-indigo-500/10 border border-purple-500/30 w-fit mb-3 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
               <Building2 size={14} className="text-purple-500 drop-shadow-sm" />
               <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em]">Director Level Control</span>
            </div>
            <h2 className="text-[36px] sm:text-[40px] font-black text-transparent bg-clip-text bg-linear-to-r from-sg-heading to-sg-heading/70 tracking-tight drop-shadow-lg leading-none">Quản Lý Phòng Ban</h2>
          </div>
          
          <div className="relative flex items-center h-14 bg-white/10 dark:bg-black/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 hover:border-purple-500/40 rounded-2xl px-5 transition-all w-full sm:w-80 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
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

      <div className="flex-1 px-6 sm:px-10 lg:px-12 py-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
        
        {/* KPI Summary for Director */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sg-stagger" style={{ animationDelay: '100ms' }}>
           <div className="bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[32px] p-8 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-[50px] pointer-events-none" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                 <div className="w-12 h-12 rounded-[16px] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20"><BarChart4 size={24} /></div>
                 <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest">+18.5% YoY</span>
              </div>
              <span className="text-[14px] font-bold text-sg-subtext uppercase tracking-wider mb-2 relative z-10">Tổng Doanh Số Công Ty</span>
              <span className="text-[48px] font-black text-transparent bg-clip-text bg-gradient-to-r from-sg-heading to-indigo-400 relative z-10 leading-none">101.00 Tỷ</span>
           </div>

           <div className="bg-white/5 dark:bg-black/30 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[32px] p-8 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 blur-[50px] pointer-events-none" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                 <div className="w-12 h-12 rounded-[16px] bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20"><Users size={24} /></div>
                 <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest">3 Khối</span>
              </div>
              <span className="text-[14px] font-bold text-sg-subtext uppercase tracking-wider mb-2 relative z-10">Tổng Quân Số Bán Hàng</span>
              <span className="text-[48px] font-black text-sg-heading relative z-10 leading-none">35 <span className="text-[20px] text-sg-muted">Sales</span></span>
           </div>
        </div>

        {/* Departments Grid */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[18px] font-black tracking-tight flex items-center gap-2"><div className="w-1.5 h-6 bg-purple-500 rounded-full" /> Danh Sách Phòng Kinh Doanh</h3>
          <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6 sg-stagger" style={{ animationDelay: '200ms' }}>
            {MOCK_DEPTS.filter(d => d.name.toLowerCase().includes(search.toLowerCase())).map((dept, idx) => {
              const p = Math.min((dept.achieved / dept.target) * 100, 100);
              const statusColors = dept.status === 'EXCELLENT' ? 'text-emerald-500 bg-emerald-500/10' : dept.status === 'WARNING' ? 'text-rose-500 bg-rose-500/10' : 'text-blue-500 bg-blue-500/10';

              return (
                <div key={dept.id} className="bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 backdrop-blur-2xl p-7 rounded-[28px] flex flex-col gap-6 hover:bg-white/10 dark:hover:bg-black/40 transition-colors shadow-sm group">
                   <div className="flex items-start justify-between">
                     <div className="flex flex-col gap-1.5">
                        <span className="text-[20px] font-black text-sg-heading tracking-tight leading-tight group-hover:text-purple-500 transition-colors">{dept.name}</span>
                        <div className="flex items-center gap-1.5 text-[13px] font-bold text-sg-subtext"><Building2 size={14}/> {dept.manager} (Trưởng phòng)</div>
                     </div>
                     <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xs ${statusColors}`}>
                        {dept.status}
                     </span>
                   </div>

                   {/* Progress */}
                   <div className="flex flex-col gap-2 mt-2">
                       <div className="flex items-end justify-between">
                          <span className="text-[11px] font-black text-sg-muted uppercase tracking-widest">Revenue Status</span>
                          <span className="text-[20px] font-black text-sg-heading">{p.toFixed(1)}%</span>
                       </div>
                       <div className="h-3 w-full bg-white/5 dark:bg-black/50 border border-white/5 rounded-full overflow-hidden relative shadow-inner">
                          <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${dept.status === 'WARNING' ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} style={{ width: `${p}%` }} />
                       </div>
                       <div className="flex items-center justify-between mt-1">
                          <span className="text-[12px] font-bold text-sg-subtext">Đã đạt: {formatCurrency(dept.achieved)}</span>
                       </div>
                   </div>

                   <div className="flex items-center justify-between border-t border-white/10 dark:border-white/5 pt-5 mt-auto">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 dark:bg-black/40 border border-white/5 rounded-xl shadow-inner">
                         <Users size={14} className="text-sg-muted" />
                         <span className="text-[13px] font-black text-sg-heading">{dept.membersCount} Nhân sự</span>
                      </div>
                      
                      <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 dark:bg-black/40 border border-white/10 hover:bg-purple-500 hover:border-purple-500 transition-colors group/btn">
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
