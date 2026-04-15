import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Grid, FileText, TrendingUp, Settings, Handshake, Wallet } from 'lucide-react';
export const MENU_GROUPS = [
  {
    title: 'QUẢN LÝ NGUỒN HÀNG',
    items: [
      { path: 'dashboard', label: 'Dashboard Điều Hành', icon: LayoutDashboard },
      { path: 'list', label: 'Danh mục Dự án', icon: Building2 },
      { path: 'inventory', label: 'Rổ hàng Tổng (Master)', icon: Grid },
      { path: 'legal', label: 'Kho Sales Kit & Pháp lý', icon: FileText },
    ]
  },
  {
    title: 'ĐIỀU PHỐI & PHÂN TÍCH',
    items: [
      { path: 'transactions', label: 'Quản lý Giao Dịch Sàn', icon: Handshake },
      { path: 'commission', label: 'Cấu hình Hoa Hồng', icon: Wallet },
      { path: 'reports', label: 'Báo cáo Phân phối', icon: TrendingUp },
    ]
  }
];

export function ProjectSidebar() {
  return (
    <div className="w-[280px] h-full flex flex-col pt-6 pb-6 relative z-10">
      {/* Module Title */}
      <div className="px-6 pb-8">
        <div className="flex items-center gap-4 bg-sg-bg/40 p-3.5 rounded-[20px] border border-sg-border shadow-sm">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_8px_16px_rgba(6,182,212,0.3)] border border-white/10">
            <Building2 size={24} className="text-white drop-shadow-md" />
          </div>
          <div>
            <h1 className="text-[17px] font-black tracking-tight text-sg-heading drop-shadow-sm leading-none">BROKERAGE</h1>
            <p className="text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mt-1">Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-6 custom-scrollbar">
        {MENU_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-2">
            <h3 className="px-4 text-[10px] font-black text-sg-subtext uppercase tracking-widest">{group.title}</h3>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={`/ProjectModule/${item.path}`}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-[16px] transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/5 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_4px_24px_rgba(6,182,212,0.15)] pointer-events-none z-10' 
                        : 'text-sg-subtext border border-transparent hover:bg-sg-bg/50 hover:border-sg-border hover:shadow-sm hover:text-sg-heading'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Subtle active glow dot */}
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-500 rounded-r-full shadow-[0_0_12px_rgba(6,182,212,0.8)]" />}
                      
                      <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' : 'text-sg-muted group-hover:bg-sg-btn-bg group-hover:text-sg-heading'}`}>
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110'}`} />
                      </div>
                      <span className={`text-[13px] tracking-wide transition-all ${isActive ? 'font-black drop-shadow-sm' : 'font-bold'}`}>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="px-4 pt-4 mt-auto">
        <NavLink
            to="/ProjectModule/settings"
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-[16px] transition-all duration-300 group ${
                isActive 
                  ? 'bg-sg-btn-bg text-sg-heading font-black border border-sg-border shadow-sm' 
                  : 'text-sg-subtext hover:bg-sg-bg/50 hover:border-sg-border border border-transparent hover:shadow-sm hover:text-sg-heading font-bold'
              }`
            }
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-sg-btn-bg text-sg-muted group-hover:text-sg-heading">
             <Settings size={18} className="shrink-0 group-hover:rotate-45 group-hover:scale-110 transition-all duration-500" />
          </div>
          <span className="text-[14px] tracking-wide">Cài đặt Dự án</span>
        </NavLink>
      </div>
    </div>
  );
}
