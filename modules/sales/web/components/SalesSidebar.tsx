import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3, Users, Layers, Building2, UserCheck,
  FileText, TrendingUp, Settings, ChevronLeft, ChevronRight,
  Sparkles, DollarSign, Calculator, Grid, Activity, BookmarkPlus, ShieldCheck, LogOut, Trophy
} from 'lucide-react';
import { useSalesRole } from './shared/RoleContext';

// ═══════════════════════════════════════════════════════════
// SALES SIDEBAR — Role-Based Menu Bundles
// ═══════════════════════════════════════════════════════════

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  badge?: number;
  section?: string;
}

const STAFF_MENU: SidebarItem[] = [
  // ── MỤC 1: TỔNG QUAN ──
  { id: 'dashboard',    label: 'Dashboard',      icon: BarChart3,    path: 'dashboard',    section: 'TỔNG QUAN' },
  { id: 'leaderboard',  label: 'Bảng Xếp Hạng',  icon: Trophy,       path: 'leaderboard' },
  { id: 'inventory',    label: 'Bảng Hàng',      icon: Grid,         path: 'inventory' },
  // ── MỤC 2: NĂNG SUẤT ──
  { id: 'activities',   label: 'Nhật Ký Kinh Doanh', icon: Activity,  path: 'activities',   section: 'NĂNG SUẤT' },
  { id: 'bookings',     label: 'Giữ Chỗ',        icon: BookmarkPlus, path: 'bookings' },
  { id: 'deposits',     label: 'Đặt Cọc',        icon: ShieldCheck,  path: 'deposits' },
  { id: 'transactions', label: 'Giao Dịch',      icon: Layers,       path: 'transactions' },
  // ── MỤC 3: HỒ SƠ CÁ NHÂN ──
  { id: 'profile',      label: 'Thông Tin Cá Nhân', icon: UserCheck, path: 'profile',      section: 'HỒ SƠ CÁ NHÂN' },
  { id: 'timesheet',    label: 'Chấm Công',      icon: Calculator,   path: 'timesheet' },
  { id: 'payroll',      label: 'Bảng Lương',     icon: DollarSign,   path: 'payroll' },
];

const MANAGER_MENU: SidebarItem[] = [
  // ── MỤC 1: TỔNG QUAN ──
  { id: 'dashboard',    label: 'Dashboard',      icon: BarChart3,    path: 'dashboard',    section: 'TỔNG QUAN' },
  { id: 'leaderboard',  label: 'Bảng Xếp Hạng',  icon: Trophy,       path: 'leaderboard' },
  { id: 'inventory',    label: 'Bảng Hàng',      icon: Grid,         path: 'inventory' },
  // ── MỤC 2: QUẢN LÝ KINH DOANH ──
  { id: 'team_activities', label: 'Nhật Ký Kinh Doanh', icon: Activity,     path: 'team_activities', section: 'QUẢN LÝ KINH DOANH' },
  { id: 'team_bookings',   label: 'Giữ Chỗ',        icon: BookmarkPlus, path: 'team_bookings' },
  { id: 'team_deposits',   label: 'Đặt Cọc',        icon: ShieldCheck,  path: 'team_deposits' },
  { id: 'team_transactions', label: 'Giao Dịch',      icon: Layers,       path: 'team_transactions' },
  { id: 'team',         label: 'Danh Sách Đội Nhóm', icon: Users,        path: 'team' },
  // ── MỤC 3: NĂNG SUẤT ──
  { id: 'activities',   label: 'Nhật Ký Kinh Doanh', icon: Activity,  path: 'activities',   section: 'NĂNG SUẤT' },
  { id: 'bookings',     label: 'Giữ Chỗ',        icon: BookmarkPlus, path: 'bookings' },
  { id: 'deposits',     label: 'Đặt Cọc',        icon: ShieldCheck,  path: 'deposits' },
  { id: 'transactions', label: 'Giao Dịch',      icon: Layers,       path: 'transactions' },
  // ── MỤC 4: HỒ SƠ CÁ NHÂN ──
  { id: 'profile',      label: 'Thông Tin Cá Nhân', icon: UserCheck, path: 'profile',      section: 'HỒ SƠ CÁ NHÂN' },
  { id: 'timesheet',    label: 'Chấm Công',      icon: Calculator,   path: 'timesheet' },
  { id: 'payroll',      label: 'Bảng Lương',     icon: DollarSign,   path: 'payroll' },
];

const DIRECTOR_MENU: SidebarItem[] = [
  // ── MỤC 1: TỔNG QUAN ──
  { id: 'dashboard',    label: 'Dashboard',         icon: BarChart3, path: 'dashboard',    section: 'TỔNG QUAN' },
  { id: 'leaderboard',  label: 'Bảng Xếp Hạng',     icon: Trophy,    path: 'leaderboard' },
  { id: 'inventory',    label: 'Bảng Hàng',         icon: Grid,      path: 'inventory' },
  // ── MỤC 2: QUẢN LÝ KINH DOANH ──
  { id: 'team_activities', label: 'Nhật Ký Kinh Doanh', icon: Activity,     path: 'team_activities', section: 'QUẢN LÝ KINH DOANH' },
  { id: 'team_bookings',   label: 'Giữ Chỗ',            icon: BookmarkPlus, path: 'team_bookings' },
  { id: 'team_deposits',   label: 'Đặt Cọc',            icon: ShieldCheck,  path: 'team_deposits' },
  { id: 'team_transactions', label: 'Giao Dịch',          icon: Layers,       path: 'team_transactions' },
  { id: 'team',         label: 'Danh Sách Đội Nhóm',   icon: Users,     path: 'team' },
  // ── MỤC 3: NĂNG SUẤT ──
  { id: 'activities',   label: 'Nhật Ký Kinh Doanh', icon: Activity,  path: 'activities',   section: 'NĂNG SUẤT' },
  { id: 'bookings',     label: 'Giữ Chỗ',        icon: BookmarkPlus, path: 'bookings' },
  { id: 'deposits',     label: 'Đặt Cọc',        icon: ShieldCheck,  path: 'deposits' },
  { id: 'transactions', label: 'Giao Dịch',      icon: Layers,       path: 'transactions' },
  // ── MỤC 4: HỒ SƠ CÁ NHÂN ──
  { id: 'profile',      label: 'Thông Tin Cá Nhân', icon: UserCheck, path: 'profile',      section: 'HỒ SƠ CÁ NHÂN' },
  { id: 'timesheet',    label: 'Chấm Công',      icon: Calculator,   path: 'timesheet' },
  { id: 'payroll',      label: 'Bảng Lương',     icon: DollarSign,   path: 'payroll' },
];

export function SalesSidebar() {
  const { role: userRole } = useSalesRole();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname.split('/').pop() || 'dashboard';

  let currentMenu = STAFF_MENU;
  if (userRole === 'sales_manager') currentMenu = MANAGER_MENU;
  if (userRole === 'sales_director' || userRole === 'admin') currentMenu = DIRECTOR_MENU;

  return (
    <aside className={`h-full flex flex-col bg-white dark:bg-[#0a0a0a] transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>

      {/* ── Logo ── */}
      <div className={`h-[84px] flex items-center border-b border-slate-100 dark:border-sg-border/40 ${isCollapsed ? 'justify-center px-2' : 'px-5 gap-3'}`}>
        <div className="w-11 h-11 rounded-[14px] bg-linear-to-br from-emerald-500 to-amber-500 flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.25)] shrink-0">
          <TrendingUp size={20} className="text-white drop-shadow-md" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-[16px] font-black text-sg-heading tracking-tight truncate">SGroup</span>
            <span className="text-[9px] font-bold text-sg-subtext uppercase tracking-[2px]">Sales Module</span>
          </div>
        )}
      </div>

      {/* ── Navigation Items ── */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {currentMenu.map(item => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id}>
              {/* Section divider */}
              {item.section && !isCollapsed && (
                <div className="pt-3 pb-1 px-4 first:pt-0">
                  <span className="text-[9px] font-black text-sg-muted/70 uppercase tracking-[2px]">{item.section}</span>
                </div>
              )}
              {item.section && isCollapsed && (
                <div className="my-1.5 mx-2 h-px bg-sg-border/30" />
              )}
              <button
               onClick={() => navigate(`/SalesModule/${item.path}`)}
               title={isCollapsed ? item.label : undefined}
               className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative ${
                 isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
               } ${
                 isActive
                   ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_12px_rgba(16,185,129,0.1)]'
                   : 'border border-transparent text-sg-muted hover:bg-sg-card/60 hover:text-sg-heading hover:border-sg-border/50'
               }`}
             >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full shadow-[2px_0_8px_rgba(16,185,129,0.4)]" />
              )}

              <Icon size={18} className={`shrink-0 transition-colors ${
                isActive ? 'text-emerald-500 drop-shadow-[0_2px_4px_rgba(16,185,129,0.4)]' : 'group-hover:text-sg-heading'
              }`} />

              {!isCollapsed && (
                <>
                  <span className={`text-[13px] font-bold truncate ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {item.label}
                  </span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-500">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
            </React.Fragment>
          );
        })}
      </nav>



      {/* ── Footer Actions ── */}
      <div className="border-t border-slate-100 dark:border-sg-border/40 p-3 flex flex-col gap-2">
        <button
          onClick={() => window.location.href = '/'}
          className={`w-full flex items-center gap-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors group ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
          title="Thoát về Portal"
        >
          <LogOut size={16} className="text-rose-500 group-hover:-translate-x-1 transition-transform" />
          {!isCollapsed && <span className="text-[13px] font-bold text-rose-500">Về Portal</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center py-2.5 rounded-xl bg-sg-btn-bg border border-sg-border hover:bg-sg-card transition-colors"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? <ChevronRight size={16} className="text-sg-muted" /> : <ChevronLeft size={16} className="text-sg-muted" />}
        </button>
      </div>
    </aside>
  );
}
