import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, UserCog, CalendarCheck, FileText,
  ChevronLeft, ChevronRight, LogOut, Wallet, BookOpen,
  GraduationCap, TrendingUp, UserCircle, Plus, Briefcase
} from 'lucide-react';
import { useAuthStore } from '../auth/store/authStore';

export type HRRole = 'hr_staff' | 'hr_manager' | 'hr_director' | 'admin' | 'ceo';

export interface HRSidebarItem {
  key: string;
  label: string;
  icon: any;
  section: 'dashboard' | 'directory' | 'time_attendance' | 'payroll' | 'recruitment' | 'performance_training' | 'admin';
  minRole: HRRole[];
}

const ALL_ROLES: HRRole[] = ['hr_staff', 'hr_manager', 'hr_director', 'admin', 'ceo'];

const SIDEBAR_ITEMS: HRSidebarItem[] = [
  { key: 'HR_DASHBOARD', label: 'Tổng quan HR', icon: LayoutDashboard, section: 'dashboard', minRole: ALL_ROLES },
  { key: 'HR_DIRECTORY', label: 'Danh bạ Nhân sự', icon: Users, section: 'directory', minRole: ALL_ROLES },
  { key: 'HR_PROFILE', label: 'Hồ sơ Chi tiết', icon: UserCog, section: 'directory', minRole: ALL_ROLES },
  { key: 'HR_TIMEKEEPING', label: 'Chấm công', icon: CalendarCheck, section: 'time_attendance', minRole: ALL_ROLES },
  { key: 'HR_LEAVES', label: 'Nghỉ phép & Đơn từ', icon: FileText, section: 'time_attendance', minRole: ALL_ROLES },
  { key: 'HR_PAYROLL', label: 'Bảng lương (Payroll)', icon: Wallet, section: 'payroll', minRole: ['hr_manager', 'hr_director', 'admin', 'ceo'] },
  { key: 'HR_BENEFITS', label: 'Phúc lợi & BHXH', icon: Briefcase, section: 'payroll', minRole: ['hr_manager', 'hr_director', 'admin', 'ceo'] },
  { key: 'HR_RECRUITMENT', label: 'Tuyển dụng (ATS)', icon: UserCog, section: 'recruitment', minRole: ALL_ROLES },
  { key: 'HR_PERFORMANCE', label: 'Đánh giá Năng lực', icon: TrendingUp, section: 'performance_training', minRole: ALL_ROLES },
  { key: 'HR_TRAINING', label: 'Đào tạo & Phát triển', icon: GraduationCap, section: 'performance_training', minRole: ALL_ROLES },
  { key: 'HR_ORG_CONFIG', label: 'Cơ Cấu Tổ Chức', icon: Users, section: 'admin', minRole: ['admin', 'ceo', 'hr_director'] },
  { key: 'HR_POLICIES', label: 'Chính sách HR', icon: BookOpen, section: 'admin', minRole: ALL_ROLES },
];

interface Props {
  activeKey: string;
  onSelect: (item: HRSidebarItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: HRRole;
}

export function HRSidebar({ activeKey, onSelect, collapsed, onToggleCollapse, userRole = 'hr_staff' }: Props) {
  const { logout, user } = useAuthStore();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const visibleItems = SIDEBAR_ITEMS.filter(item => item.minRole.includes(userRole));
  const sections = [
    { key: 'dashboard', label: '' },
    { key: 'directory', label: 'HỒ SƠ NHÂN SỰ' },
    { key: 'time_attendance', label: 'CHẤM CÔNG & NGHỈ PHÉP' },
    { key: 'payroll', label: 'LƯƠNG THƯỞNG (C&B)' },
    { key: 'recruitment', label: 'TUYỂN DỤNG' },
    { key: 'performance_training', label: 'ĐÁNH GIÁ & ĐÀO TẠO' },
    { key: 'admin', label: 'QUẢN TRỊ & HÀNH CHÍNH' },
  ];

  const renderItem = (item: HRSidebarItem) => {
    const isActive = activeKey === item.key;
    const IconComp = item.icon;
    return (
      <button
        key={item.key}
        onClick={() => onSelect(item)}
        className={`w-[calc(100%-24px)] flex items-center mx-3 mb-1 px-3 py-3 rounded-2xl transition-all duration-300 border border-transparent
          ${isActive ? (isDark ? 'bg-sg-red/15 border-sg-red/20' : 'bg-red-50 shadow-[0_4px_14px_rgba(236,72,153,0.12)] border-red-100') : 'hover:bg-sg-btn-bg'}
        `}
      >
        <div className="w-6 flex items-center justify-center flex-shrink-0">
          <IconComp size={20} className={isActive ? 'text-sg-red' : 'text-sg-muted'} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        {!collapsed && (
          <span className={`ml-3.5 text-sm truncate flex-1 text-left tracking-[0.2px]
            ${isActive ? 'font-extrabold text-sg-red' : 'font-semibold text-sg-subtext'}
          `}>
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className={`
      relative h-screen flex flex-col border-r transition-all duration-300
      bg-sg-card border-sg-border
      ${collapsed ? 'w-20' : 'w-[260px]'}
    `}>
      {/* Header — Premium Brand */}
      <div className="h-20 flex flex-row justify-between items-center px-4 border-b border-sg-border">
        <div className={`flex flex-row items-center overflow-hidden ${collapsed ? 'gap-0 flex-none' : 'gap-3 flex-1'}`}>
          {/* Brand Badge with Gradient */}
          <div className="w-[38px] h-[38px] rounded-xl flex justify-center items-center flex-shrink-0 bg-gradient-to-br from-sg-red-light to-sg-red shadow-sg-brand">
            <span className="text-[15px] font-black text-white tracking-[1.5px]">HR</span>
          </div>
          {/* Brand Text */}
          <div className={`flex flex-col flex-1 transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <span className="text-sm font-extrabold text-sg-heading tracking-[0.8px] truncate">NHÂN SỰ</span>
            <span className="text-[10px] font-bold text-sg-red tracking-[2px] mt-0.5 whitespace-nowrap">HR MODULE</span>
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-sg-btn-bg border border-sg-border hover:bg-sg-border transition-colors flex-shrink-0 z-10"
        >
          {collapsed ? <ChevronRight size={14} className="text-sg-muted" strokeWidth={2.5} /> : <ChevronLeft size={14} className="text-sg-muted" strokeWidth={2.5} />}
        </button>
      </div>



      {/* Menu */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-2">
        {sections.map(sec => {
          const sectionItems = visibleItems.filter(i => i.section === sec.key);
          if (sectionItems.length === 0) return null;
          return (
            <div key={sec.key}>
              {!collapsed && sec.label && (
                <div className="text-[11px] font-extrabold tracking-[1.8px] uppercase text-sg-muted px-6 mt-4 mb-2.5 truncate">
                  {sec.label}
                </div>
              )}
              {sectionItems.map(renderItem)}
              <div className="h-px mx-6 my-1.5 bg-sg-border" />
            </div>
          );
        })}
      </div>

      {/* User Profile & Footer Area */}
      <div className="p-3 border-t border-sg-border flex flex-col gap-2">
        <div className={`flex items-center ${collapsed ? 'justify-center mx-auto' : 'justify-between'}`}>
           <button 
              onClick={() => onSelect({ key: 'HR_PROFILE', label: 'Hồ sơ Của Tôi', icon: UserCircle, section: 'dashboard', minRole: ALL_ROLES })}
              className={`flex items-center flex-1 rounded-xl transition-all border border-transparent overflow-hidden ${collapsed ? 'p-0 w-9 h-9 justify-center' : 'p-2 mr-2'}
                ${activeKey === 'HR_PROFILE' ? (isDark ? 'bg-sg-red/15 border-sg-red/20' : 'bg-red-50 border-red-100') : 'hover:bg-sg-btn-bg'}
              `}
              title="Hồ sơ của tôi"
            >
              <div className="w-9 h-9 rounded-full bg-sg-btn-bg flex items-center justify-center flex-shrink-0 border border-sg-border pointer-events-none">
                <UserCircle size={18} className="text-sg-heading" />
              </div>
              {!collapsed && (
                <div className="ml-2.5 flex flex-col text-left truncate flex-1 min-w-0 pointer-events-none">
                  <span className="text-[12px] font-extrabold text-sg-heading truncate">{user?.name || 'User'}</span>
                  <span className="text-[9px] font-bold text-sg-subtext uppercase tracking-[1px] truncate mt-0.5">{userRole.replace('_', ' ')}</span>
                </div>
              )}
            </button>

            {!collapsed && (
              <button 
                onClick={() => window.location.href = '/'} 
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-colors group shadow-sm" title="Về Workspace"
              >
                <LayoutDashboard size={15} className="text-sg-muted group-hover:text-sg-heading" />
              </button>
            )}
        </div>
        
        {collapsed ? (
            <button 
              onClick={() => window.location.href = '/'} 
              className="w-9 h-9 mt-1 rounded-xl flex items-center justify-center flex-shrink-0 bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-colors group mx-auto shadow-sm" title="Về Workspace"
            >
              <LayoutDashboard size={15} className="text-sg-muted group-hover:text-sg-heading" />
            </button>
        ) : null}
      </div>
    </aside>
  );
}
