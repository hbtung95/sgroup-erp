import React from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { DashboardScreen } from './screens/DashboardScreen';
import { CustomerScreen } from './screens/CustomerScreen';
import { TransactionBoardScreen } from './screens/TransactionBoardScreen';
import { TeamScreen } from './screens/TeamScreen';
import { DepartmentScreen } from './screens/DepartmentScreen';
import { 
  Sun, 
  Moon, 
  Search, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Briefcase,
  Contact2,
  Building2,
  Menu
} from 'lucide-react';

export function SalesShell() {
  const user = useAuthStore(s => s.user);
  const location = useLocation();
  const [isDark, setIsDark] = React.useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // RBAC Role Flags
  const isDirector = user?.role === 'admin' || user?.role === 'sales_director';
  const isManager = isDirector || user?.role === 'sales_manager';
  
  // Dynamic Nav Items based on Role
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'TỔNG QUAN', path: '/SalesModule/dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'KHÁCH HÀNG', path: '/SalesModule/customers', icon: Users },
    { id: 'pipeline', label: 'PIPELINE', path: '/SalesModule/pipeline', icon: Briefcase },
  ];

  if (isManager) {
    NAV_ITEMS.push({ id: 'team', label: 'ĐỘI NHÓM', path: '/SalesModule/team', icon: Contact2 });
  }

  if (isDirector) {
    NAV_ITEMS.push({ id: 'department', label: 'PHÒNG BAN', path: '/SalesModule/department', icon: Building2 });
  }

  const parseRoleName = (roleStr: string | undefined) => {
    if (!roleStr) return 'Sales Staff';
    if (roleStr === 'admin' || roleStr === 'sales_director') return 'Giám Đốc KD';
    if (roleStr === 'sales_manager') return 'Trưởng Phòng KD';
    return 'Chuyên Viên KD';
  };

  return (
    <div className="flex flex-col h-screen w-full relative z-0" style={{ background: 'var(--sg-bg)' }}>
      
      {/* 1. Header (Neo Glassmorphism) */}
      <header className="h-[84px] bg-white/5 dark:bg-black/30 backdrop-blur-2xl border-b border-white/10 dark:border-white/5 px-8 flex items-center justify-between z-30 transition-colors duration-300 shadow-[0_4px_32px_rgba(0,0,0,0.03)] shrink-0 hidden md:flex">
        <div className="flex flex-col">
          <h1 className="text-[22px] font-black text-sg-heading tracking-tight drop-shadow-sm leading-tight flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-linear-to-br from-rose-500 to-purple-600 shadow-inner flex items-center justify-center">
               <Briefcase size={16} className="text-white" />
             </div>
             Kinh Doanh & CRM
          </h1>
          <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-[1.5px] mt-0.5 ml-11">SGROUP ERP</span>
        </div>

        <div className="flex items-center gap-5">
            <button
              onClick={toggleTheme}
              className="w-11 h-11 bg-white/10 dark:bg-black/40 hover:bg-white/20 dark:hover:bg-black/60 border border-white/10 rounded-[14px] flex items-center justify-center transition-all group shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-0.5"
            >
              {isDark ? (
                <Moon size={18} className="text-sg-subtext group-hover:text-cyan-400 drop-shadow-sm" />
              ) : (
                <Sun size={18} className="text-sg-subtext group-hover:text-amber-500 drop-shadow-sm" />
              )}
            </button>
            
            <div className="w-px h-8 bg-sg-border/60" />
            
            <div className="flex items-center gap-3 bg-white/5 dark:bg-black/20 p-1.5 pl-4 rounded-full border border-white/10 shadow-sm">
              <div className="flex flex-col items-end mr-1">
                <span className="text-[14px] font-black text-sg-heading drop-shadow-sm tracking-tight leading-none">{user?.name || 'Nhân Viên SGROUP'}</span>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-1">{parseRoleName(user?.role)}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-rose-500 to-rose-600 relative overflow-hidden shadow-inner flex items-center justify-center border border-white/20">
                 <span className="text-[15px] font-black text-white drop-shadow-md">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
              </div>
            </div>
        </div>
      </header>

      {/* Mobile Header Placeholder */}
      <header className="h-[72px] bg-sg-btn-bg border-b border-sg-border px-4 flex items-center justify-between z-30 md:hidden">
         <span className="font-black text-[18px]">CRM</span>
         <button className="w-10 h-10 flex items-center justify-center"><Menu size={20} /></button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Ambient Splashes Behind Sidebar */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[80px] pointer-events-none -z-10" />

        {/* 2. Sidebar Navigation */}
        <nav className="w-[280px] hidden md:flex flex-col px-4 py-8 bg-white/5 dark:bg-black/20 border-r border-white/10 dark:border-white/5 backdrop-blur-3xl z-20 shrink-0">
          <div className="flex flex-col gap-1.5 flex-1">
            <span className="text-[10px] font-black text-sg-muted uppercase tracking-[0.2em] ml-4 mb-2">Main Menu</span>
            
            {NAV_ITEMS.map((item, idx) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 sg-stagger`}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Hover/Active Background Overlay */}
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${isActive ? 'bg-linear-to-r from-rose-500/10 to-transparent opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'}`} />
                  
                  {/* Active Border Hint */}
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]" />}

                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-rose-500 drop-shadow-sm' : 'text-sg-muted group-hover:text-sg-heading'}`} 
                  />
                  <span className={`relative z-10 text-[13px] tracking-wide transition-all duration-300 ${isActive ? 'font-black text-sg-heading' : 'font-bold text-sg-subtext group-hover:text-sg-heading group-hover:translate-x-1'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>

          {/* Quick Support / Bottom Section */}
          <div className="mt-auto px-4 py-5 bg-linear-to-br from-white/5 to-transparent rounded-[20px] border border-white/5">
             <h4 className="text-[11px] font-black text-sg-heading uppercase tracking-wider mb-1">CRM Support Center</h4>
             <p className="text-[11px] font-semibold text-sg-muted mb-3 leading-relaxed">Có vấn đề với luồng phê duyệt Pipeline?</p>
             <button className="w-full h-9 bg-white/10 hover:bg-rose-500/20 text-[12px] font-bold text-sg-heading hover:text-rose-500 uppercase tracking-widest rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-rose-500/30 shadow-sm">Liên hệ Admin</button>
          </div>
        </nav>

        {/* 3. Main Content Area */}
        <main className="flex-1 min-w-0 flex flex-col relative z-20 overflow-hidden">
          <Routes>
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="customers" element={<CustomerScreen />} />
            <Route path="pipeline" element={<TransactionBoardScreen />} />
            {isManager && <Route path="team" element={<TeamScreen />} />}
            {isDirector && <Route path="department" element={<DepartmentScreen />} />}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
