import React, { useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { 
  Users, 
  Search, 
  Target,
  TrendingUp,
  Activity,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';

const MOCK_TEAM = [
  { id: '1', name: 'Nguyễn Văn A', role: 'Sales Executive', status: 'ACTIVE', target: 5000000000, achieved: 2500000000, conversionRate: 18, pendingDeals: 3 },
  { id: '2', name: 'Trần Thị B', role: 'Senior Sales', status: 'ACTIVE', target: 8000000000, achieved: 6100000000, conversionRate: 22, pendingDeals: 1 },
  { id: '3', name: 'Lê Văn C', role: 'Sales Executive', status: 'ON_LEAVE', target: 3000000000, achieved: 500000000, conversionRate: 8, pendingDeals: 0 },
  { id: '4', name: 'Phạm Thị D', role: 'Sales Executive', status: 'ACTIVE', target: 4000000000, achieved: 4200000000, conversionRate: 25, pendingDeals: 5 },
];

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export function TeamScreen() {
  const [search, setSearch] = useState('');

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-hidden pb-10">
      <div className="fixed top-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="px-6 sm:px-10 lg:px-12 py-8 border-b border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/30 backdrop-blur-3xl relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sg-stagger" style={{ animationDelay: '0ms' }}>
          <div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 w-fit mb-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
               <Users size={14} className="text-amber-500 drop-shadow-sm" />
               <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">Management Space</span>
            </div>
            <h2 className="text-[36px] sm:text-[40px] font-black text-transparent bg-clip-text bg-linear-to-r from-sg-heading to-sg-heading/70 tracking-tight drop-shadow-lg leading-none">Quản Lý Đội Nhóm</h2>
          </div>
          
          <div className="relative flex items-center h-14 bg-white/10 dark:bg-black/40 backdrop-blur-2xl border border-white/10 dark:border-white/5 hover:border-amber-500/40 rounded-2xl px-5 transition-all w-full sm:w-80 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <Search size={18} className="text-sg-muted group-hover:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhân viên..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none ml-3 text-[14px] font-bold text-sg-heading w-full placeholder:text-sg-muted/60"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 sm:px-10 lg:px-12 py-8 overflow-y-auto custom-scrollbar flex flex-col gap-8">
        
        {/* KPI Summary for Team */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sg-stagger" style={{ animationDelay: '100ms' }}>
           <div className="bg-white/5 dark:bg-black/30 border border-white/10 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[30px] group-hover:bg-amber-500/20 transition-all pointer-events-none" />
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Users size={20} /></div>
                <span className="text-[14px] font-bold text-sg-muted uppercase tracking-wider">Tổng Nhân Sự</span>
             </div>
             <div className="flex items-end justify-between">
                <span className="text-[32px] font-black text-sg-heading">4</span>
                <span className="text-[12px] font-black text-emerald-500 mb-2 flex items-center gap-1">+1 <ArrowUpRight size={14}/></span>
             </div>
           </div>

           <div className="bg-white/5 dark:bg-black/30 border border-white/10 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[30px] group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Target size={20} /></div>
                <span className="text-[14px] font-bold text-sg-muted uppercase tracking-wider">Hoàn Thành Tiêu Chí</span>
             </div>
             <div className="flex items-end justify-between">
                <span className="text-[32px] font-black text-sg-heading">65%</span>
                <span className="text-[12px] font-black text-emerald-500 mb-2 flex items-center gap-1">+12% <ArrowUpRight size={14}/></span>
             </div>
           </div>

           <div className="bg-white/5 dark:bg-black/30 border border-white/10 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[30px] group-hover:bg-rose-500/20 transition-all pointer-events-none" />
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500"><Activity size={20} /></div>
                <span className="text-[14px] font-bold text-sg-muted uppercase tracking-wider">Deals Trễ Hạn</span>
             </div>
             <div className="flex items-end justify-between">
                <span className="text-[32px] font-black text-sg-heading">2</span>
                <span className="text-[12px] font-black text-rose-500 mb-2 flex items-center gap-1">+2 <TrendingDown size={14}/></span>
             </div>
           </div>
        </div>

        {/* Members Grid */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[18px] font-black tracking-tight flex items-center gap-2"><div className="w-1.5 h-6 bg-amber-500 rounded-full" /> Danh Sách Chuyên Viên</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sg-stagger" style={{ animationDelay: '200ms' }}>
            {MOCK_TEAM.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).map((member, idx) => {
              const p = Math.min((member.achieved / member.target) * 100, 100);
              return (
                <div key={member.id} className="bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 backdrop-blur-2xl p-6 rounded-3xl flex flex-col gap-5 hover:bg-white/10 dark:hover:bg-black/40 transition-colors shadow-sm">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-inner flex items-center justify-center text-[14px] font-black text-white shrink-0">
                          {member.name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[16px] font-black text-sg-heading">{member.name}</span>
                           <span className="text-[12px] font-bold text-sg-muted">{member.role}</span>
                        </div>
                     </div>
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-xs border ${member.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-sg-muted/10 text-sg-muted border-sg-border'}`}>
                        {member.status}
                     </span>
                   </div>

                   {/* Progress Bar Area */}
                   <div className="flex flex-col gap-2 p-4 bg-white/5 dark:bg-black/50 rounded-2xl border border-white/5">
                      <div className="flex items-center justify-between">
                         <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-widest">Tiến Độ Doanh Số</span>
                         <span className="text-[13px] font-black text-sg-heading">{formatCurrency(member.achieved)} / {formatCurrency(member.target)}</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mt-1 relative">
                         <div className="absolute top-0 left-0 h-full bg-linear-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000" style={{ width: `${p}%` }} />
                      </div>
                   </div>

                   <div className="flex items-center justify-between border-t border-white/10 dark:border-white/5 pt-4 mt-1">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider mb-1">Win Rate</span>
                         <span className="text-[14px] font-black text-sg-heading flex items-center gap-1.5"><TrendingUp size={14} className="text-amber-500"/> {member.conversionRate}%</span>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider mb-1">Đang Xin Chọn Căn</span>
                         <span className="text-[14px] font-black text-rose-500">{member.pendingDeals} Deals</span>
                      </div>
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
