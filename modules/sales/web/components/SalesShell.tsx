import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  Sun, Moon, TrendingUp, Search,
} from 'lucide-react';
import { SalesSidebar } from './SalesSidebar';
import { SalesSearchModal } from './SalesSearchModal';
import { SalesCopilot } from './SalesCopilot';
import { SalesErrorBoundary } from './ErrorBoundary';
import { ToastProvider } from './shared/Toast';
import { RoleProvider, useSalesRole } from './shared/RoleContext';

// ═══ Lazy-loaded Screens ═══
import { DashboardScreen } from '../screens/DashboardScreen';
import { CustomerScreen } from '../screens/CustomerScreen';
import { TransactionBoardScreen } from '../screens/TransactionBoardScreen';
import { TeamScreen } from '../screens/TeamScreen';
import { DepartmentScreen } from '../screens/DepartmentScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LoanCalculatorScreen } from '../screens/LoanCalculatorScreen';
import { InventoryBoardScreen } from '../screens/InventoryBoardScreen';

// ═══ Placeholder for modules under construction ═══
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="flex-1 h-full flex flex-col bg-transparent relative z-10 overflow-hidden">
      <div className="flex-1 p-8 flex items-center justify-center relative">
        <div className="text-center bg-white dark:bg-black/30 backdrop-blur-3xl p-12 rounded-[40px] border border-slate-200 dark:border-sg-border shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-amber-500 to-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -inset-10 bg-linear-to-br from-emerald-500/10 to-amber-600/5 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-1000 origin-center" />
          <div className="w-20 h-20 mx-auto rounded-sg-xl bg-sg-btn-bg border border-sg-border flex items-center justify-center mb-6 relative shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <div className="w-10 h-10 border-4 border-sg-border border-t-emerald-500 rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-sg-heading tracking-tight drop-shadow-md">Module "{title}" đang phát triển</h2>
          <p className="text-sm font-bold text-sg-muted mt-3 max-w-sm mx-auto leading-relaxed">Giao diện phân phối theo tiêu chuẩn Neo-Glassmorphism v2.2. Vui lòng quay lại sau!</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ROLE SWITCHER (Demo Component)
// ═══════════════════════════════════════════════════════════

function UserRoleSwitcher() {
  const { role, setRole } = useSalesRole();
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { id: 'sales_staff', label: 'Sales Staff', desc: 'Chuyên viên' },
    { id: 'sales_manager', label: 'Sales Manager', desc: 'Trưởng phòng' },
    { id: 'sales_director', label: 'Sales Director', desc: 'Giám đốc' }
  ] as const;

  const currentRole = roles.find(r => r.id === role) || roles[2];

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-sg-card/50 p-1.5 pr-3 rounded-2xl transition-colors border border-transparent hover:border-sg-border/50"
      >
        <div className="flex flex-col items-end">
          <span className="text-[14px] font-black text-sg-heading drop-shadow-sm tracking-tight">Nguyễn Demo</span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
            {currentRole.desc}
          </span>
        </div>
        <div className="w-11 h-11 rounded-[14px] bg-linear-to-br from-emerald-400 to-amber-500 relative overflow-hidden shadow-[0_8px_16px_rgba(16,185,129,0.2)] group-hover:shadow-[0_8px_24px_rgba(16,185,129,0.4)] transition-all">
          <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-[14px]" />
          <div className="absolute inset-px rounded-[13px] bg-linear-to-br from-emerald-500 to-amber-500 flex items-center justify-center">
            <span className="text-[16px] font-black text-white drop-shadow-md">N</span>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-[110%] w-56 bg-white dark:bg-black/80 backdrop-blur-3xl border border-slate-200 dark:border-sg-border rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-3 py-2 mb-2 border-b border-sg-border/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-sg-muted">MÔ PHỎNG VAI TRÒ</span>
            </div>
            <div className="flex flex-col gap-1">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setIsOpen(false); }}
                  className={`flex flex-col items-start px-3 py-2 rounded-xl transition-colors ${role === r.id ? 'bg-emerald-500/10 border border-emerald-500/20' : 'hover:bg-sg-card/60 border border-transparent'}`}
                >
                  <span className={`text-[13px] font-bold ${role === r.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-sg-heading'}`}>{r.label}</span>
                  <span className="text-[11px] font-medium text-sg-muted">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SALES SHELL — Main Layout + URL-based Routing
// ═══════════════════════════════════════════════════════════

export function SalesShell() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // ═══ Keyboard shortcuts ═══
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsCopilotOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCopilotOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  return (
    <RoleProvider>
    <ToastProvider>
    <SalesErrorBoundary>
      <div className="flex w-screen h-screen bg-sg-portal-bg overflow-hidden transition-colors duration-500">

        {/* ── CINEMATIC BACKDROP ── */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-sg-portal-bg/50 to-sg-portal-bg/95 z-10" />
          <div className="absolute w-[800px] h-[800px] rounded-full bg-emerald-500 opacity-20 blur-[100px] z-0"
            style={{ animation: 'sg-aurora-1 20s ease-in-out infinite', top: '-10%', left: '-5%' }} />
          <div className="absolute w-[900px] h-[900px] rounded-full bg-amber-600 opacity-20 blur-[120px] z-0"
            style={{ animation: 'sg-aurora-2 25s ease-in-out infinite', bottom: '-20%', right: '-10%' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full bg-emerald-400 opacity-15 blur-[100px] z-0"
            style={{ animation: 'sg-aurora-1 22s ease-in-out infinite', top: '30%', left: '30%', animationDirection: 'reverse' }} />
        </div>

        {/* ── SIDEBAR ── */}
        <div className="z-20 border-r border-slate-200 dark:border-sg-border/60 bg-white/80 dark:bg-black/60 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300">
          <SalesSidebar />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">

          {/* ═══ Module Header ═══ */}
          <header className="h-[84px] bg-white/80 dark:bg-black/60 backdrop-blur-[32px] saturate-150 border-b border-slate-200 dark:border-sg-border/60 px-8 flex items-center justify-between z-30 transition-colors duration-300 shadow-[0_4px_32px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-sg-lg bg-linear-to-br from-emerald-500/20 to-amber-600/20 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                <TrendingUp size={22} className="text-emerald-500 drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[22px] font-black text-sg-heading tracking-tight drop-shadow-sm leading-tight">
                  Phân Hệ Kinh Doanh
                </h1>
                <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-[1.5px] mt-0.5">SGroup Sales Operations</span>
              </div>
            </div>

            <div className="flex items-center gap-5">
              {/* Context Search */}
              <div className="relative group hidden md:block w-72">
                <div className="absolute inset-0 bg-linear-to-r from-emerald-500/0 via-emerald-500/10 to-amber-500/0 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />
                <div
                  className="relative flex items-center h-11 bg-sg-btn-bg border border-sg-border hover:border-emerald-500/30 rounded-xl px-4 transition-colors cursor-pointer"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search size={16} className="text-sg-muted group-hover:text-emerald-500 transition-colors" />
                  <span className="ml-3 text-[13px] font-semibold text-sg-muted group-hover:text-sg-heading transition-colors cursor-text">
                    Tìm KH, mã căn, giao dịch...
                  </span>
                  <div className="ml-auto flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <kbd className="px-1.5 py-0.5 rounded bg-sg-card border border-sg-border text-[9px] font-extrabold text-sg-heading shadow-sm uppercase">Cmd</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-sg-card border border-sg-border text-[9px] font-extrabold text-sg-heading shadow-sm">K</kbd>
                  </div>
                </div>
              </div>

              <div className="w-px h-8 bg-sg-border/60" />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-11 h-11 bg-sg-btn-bg hover:bg-sg-card border border-sg-border rounded-[14px] flex items-center justify-center transition-all group shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
              >
                {isDark 
                  ? <Moon size={18} className="text-sg-subtext group-hover:text-emerald-400 drop-shadow-sm" />
                  : <Sun size={18} className="text-sg-subtext group-hover:text-amber-500 drop-shadow-sm" />
                }
              </button>

              {/* User Avatar & Role Switcher */}
              <UserRoleSwitcher />
            </div>
          </header>

          {/* ═══ URL-Based Routing ═══ */}
          <main className="flex-1 relative overflow-hidden flex flex-col bg-transparent">
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardScreen />} />
              <Route path="customers" element={<CustomerScreen />} />
              <Route path="transactions" element={<TransactionBoardScreen />} />
              <Route path="team" element={<TeamScreen />} />
              <Route path="departments" element={<DepartmentScreen />} />
              <Route path="reports" element={<ReportsScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
              <Route path="loan-calculator" element={<LoanCalculatorScreen />} />
              <Route path="inventory" element={<InventoryBoardScreen />} />
              <Route path="commission" element={<PlaceholderScreen title="Bảng Tính Hoa Hồng" />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </main>
        </div>

        {/* ═══ Extracted Modals ═══ */}
        <SalesSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <SalesCopilot isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      </div>
    </SalesErrorBoundary>
    </ToastProvider>
    </RoleProvider>
  );
}
