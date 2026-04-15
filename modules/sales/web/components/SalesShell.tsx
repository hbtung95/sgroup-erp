import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Bot, Search, X, Send, Sparkles, Sun, Moon, Command, Users, Handshake, Building2 } from 'lucide-react';
import { useAuthStore } from '@sgroup/platform';
import { SalesSidebar, SalesSidebarItem, SalesRole } from './SalesSidebar';
import { SalesErrorBoundary } from './ErrorBoundary';

// Screen Imports
import { DashboardScreen } from '../screens/DashboardScreen';
import { CustomerScreen } from '../screens/CustomerScreen';
import { TransactionBoardScreen } from '../screens/TransactionBoardScreen';
import { TeamScreen } from '../screens/TeamScreen';
import { DepartmentScreen } from '../screens/DepartmentScreen';

/* ════════════════════════════════════════════════════════
   ROUTE KEY → COMPONENT MAP
   ════════════════════════════════════════════════════════ */

const KEY_TO_COMPONENT: Record<string, React.ComponentType<any>> = {
  SALES_DASHBOARD: DashboardScreen,
  SALES_CUSTOMERS: CustomerScreen,
  SALES_PIPELINE: TransactionBoardScreen,
  SALES_TEAM: TeamScreen,
  SALES_DEPARTMENT: DepartmentScreen,
};

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'TỔNG QUAN',
  crm: 'QUẢN LÝ KHÁCH HÀNG',
  pipeline: 'GIAO DỊCH',
  team: 'QUẢN LÝ ĐỘI NHÓM',
  director: 'ĐIỀU HÀNH CẤP CAO',
};

/* ════════════════════════════════════════════════════════
   MAIN SHELL
   ════════════════════════════════════════════════════════ */

export function SalesShell() {
  const { user } = useAuthStore();
  const userRole: SalesRole = (user?.role === 'admin' || user?.role === 'sales_director')
    ? 'sales_director'
    : user?.role === 'sales_manager'
      ? 'sales_manager'
      : 'sales_staff';

  const [activeKey, setActiveKey] = useState('SALES_DASHBOARD');
  const [activeLabel, setActiveLabel] = useState('Tổng quan Doanh số');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Command Palette & Copilot
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCopilotOpen, setCopilotOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'ai' | 'user'; val: string }[]>([
    { role: 'ai', val: 'Chào bạn, tôi là Sales Copilot. Tôi có thể giúp gì cho bạn? (Ví dụ: "Báo cáo doanh số tháng này", "Khách hàng HOT cần follow-up", v.v.)' }
  ]);

  // Toggle Theme
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

  // Cmd+K Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (item: SalesSidebarItem) => {
    setActiveKey(item.key);
    setActiveLabel(item.label);
    setActiveSection(item.section);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', val: msg }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', val: `S-Group ERP đang xử lý yêu cầu: "${msg}". (Phase 2 — AI Integration)` }]);
    }, 1000);
  };

  const ContentComponent = KEY_TO_COMPONENT[activeKey];

  const parseRoleName = (roleStr: string | undefined) => {
    if (!roleStr) return 'Chuyên Viên KD';
    if (roleStr === 'admin' || roleStr === 'sales_director') return 'Giám Đốc KD';
    if (roleStr === 'sales_manager') return 'Trưởng Phòng KD';
    return 'Chuyên Viên KD';
  };

  return (
    <div className="flex w-screen h-screen bg-sg-portal-bg overflow-hidden transition-colors duration-300">

      {/* ═══ CINEMATIC AURORA BACKDROP (Emerald/Amber for Sales) ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-[-10%] left-[-10%] w-[1200px] h-[1200px] rounded-full bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-transparent blur-[120px] animate-sg-pulse mix-blend-screen dark:mix-blend-lighten"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-linear-to-tl from-amber-500/10 via-yellow-500/5 to-transparent blur-[120px] animate-sg-pulse mix-blend-screen dark:mix-blend-lighten"
          style={{ animationDuration: '10s', animationDelay: '1s' }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-emerald-400/8 blur-[100px]"
          style={{ animation: 'sg-aurora-1 22s ease-in-out infinite', top: '30%', left: '40%', animationDirection: 'reverse' }}
        />
      </div>

      {/* ═══ LEFT: Sidebar ═══ */}
      <div className="z-10 bg-sg-card border-r border-sg-border transition-colors duration-300">
        <SalesSidebar
          activeKey={activeKey}
          onSelect={handleSelect}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
          userRole={userRole}
        />
      </div>

      {/* ═══ RIGHT: Main Area ═══ */}
      <div className="flex-1 flex flex-col relative z-0 transition-colors duration-300">

        {/* ═══ TOP BAR ═══ */}
        <header className="h-[80px] bg-white/80 dark:bg-black/60 backdrop-blur-[32px] saturate-150 border-b border-slate-200 dark:border-sg-border/60 px-8 flex items-center justify-between z-10 transition-colors duration-300 shrink-0 shadow-[0_4px_32px_rgba(0,0,0,0.03)]">
          {/* Left: Breadcrumb + Title */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px]">
                {SECTION_LABELS[activeSection] || 'SALES'}
              </span>
              <div className="w-1 h-1 rounded-full bg-emerald-500 opacity-80" />
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-[1px]">
                {activeLabel.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-black text-sg-heading tracking-tight drop-shadow-sm">
              {activeLabel}
            </h1>
          </div>

          {/* Right: Search + Theme + User */}
          <div className="flex items-center gap-4">
            {/* Search Trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="px-4 py-2 bg-sg-btn-bg hover:bg-sg-border border border-sg-border rounded-xl hidden md:flex items-center gap-4 group transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search size={16} className="text-sg-muted group-hover:text-sg-heading transition-colors" />
                <span className="text-sm font-semibold text-sg-muted group-hover:text-sg-heading transition-colors">Tìm kiếm...</span>
              </div>
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="px-1.5 py-0.5 rounded bg-sg-card border border-sg-border text-[10px] font-bold text-sg-heading tracking-wide shadow-sm">Cmd</div>
                <div className="px-1.5 py-0.5 rounded bg-sg-card border border-sg-border text-[10px] font-bold text-sg-heading tracking-wide shadow-sm">K</div>
              </div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-11 h-11 bg-sg-btn-bg hover:bg-sg-border border border-sg-border rounded-xl flex items-center justify-center transition-colors group shadow-sm"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Moon size={18} className="text-sg-subtext group-hover:text-sg-heading" />
              ) : (
                <Sun size={18} className="text-sg-subtext group-hover:text-sg-heading" />
              )}
            </button>

            <div className="h-8 w-px bg-sg-border mx-1" />

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-extrabold text-sg-heading shadow-sm">{user?.name || 'User'}</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{parseRoleName(user?.role)}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-amber-500 flex items-center justify-center shadow-[0_4px_12px_rgba(16,185,129,0.3)] ring-2 ring-white/10">
                <span className="text-[15px] font-black text-white">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
          <div className="min-h-full pb-20">
            <SalesErrorBoundary>
              {ContentComponent ? (
                <ContentComponent userRole={userRole} />
              ) : (
                <PlaceholderScreen title={activeLabel} />
              )}
            </SalesErrorBoundary>
          </div>
        </main>
      </div>

      {/* ═══ COMMAND PALETTE (Cmd+K) ═══ */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-sg-heading/20 backdrop-blur-sm animate-sg-fade-in">
          <div className="absolute inset-0 cursor-default" onClick={() => setCommandOpen(false)} />
          <div className="relative w-full max-w-[640px] bg-sg-portal-bg rounded-2xl overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.25)] border border-sg-border animate-sg-slide-up scale-100">
            <div className="flex flex-row items-center px-5 border-b border-sg-border bg-sg-card">
              <Search size={22} className="text-emerald-500 shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khách hàng, deals, nhân viên..."
                className="flex-1 h-16 px-4 text-lg font-medium text-sg-heading bg-transparent outline-none placeholder:text-sg-muted"
              />
              <div className="flex flex-row gap-1">
                <div className="p-1 rounded-md bg-sg-btn-bg"><Command size={14} className="text-sg-subtext" /></div>
                <div className="p-1 rounded-md bg-sg-btn-bg flex items-center justify-center"><span className="text-xs font-black text-sg-subtext">K</span></div>
              </div>
            </div>
            <div className="p-3 max-h-[400px] overflow-y-auto">
              <span className="text-xs font-extrabold text-sg-muted px-2 pb-2 pt-1 block tracking-wider uppercase">Hành động nhanh</span>
              {[
                { icon: Users, label: 'Tạo Lead khách hàng mới', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { icon: Handshake, label: 'Xem Pipeline giao dịch đang xử lý', color: 'text-amber-500', bg: 'bg-amber-50' },
                { icon: Building2, label: 'Báo cáo doanh số theo Phòng ban', color: 'text-indigo-500', bg: 'bg-indigo-50' },
              ].map((act, i) => (
                <button key={i} className="w-full flex flex-row items-center p-3 rounded-xl hover:bg-sg-btn-bg transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${act.bg} dark:bg-white/5`}>
                    <act.icon size={16} className={isDark ? 'text-white/80' : act.color} />
                  </div>
                  <span className="text-[15px] font-bold text-sg-heading">{act.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ SALES AI COPILOT ═══ */}
      {isCopilotOpen ? (
        <div className="fixed right-6 bottom-6 w-[380px] h-[600px] bg-sg-card/90 backdrop-blur-2xl rounded-[28px] border border-sg-border shadow-[0_16px_48px_rgba(0,0,0,0.2)] z-[10000] flex flex-col overflow-hidden animate-sg-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-amber-500 p-4 flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/20 shadow-sm">
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-white drop-shadow-sm tracking-wide">Sales Copilot</span>
                <span className="text-xs font-semibold text-white/80 tracking-wide">AI Assistant for S-Group</span>
              </div>
            </div>
            <button onClick={() => setCopilotOpen(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`
                max-w-[85%] p-3.5 rounded-2xl leading-relaxed
                ${msg.role === 'ai'
                  ? 'self-start bg-sg-btn-bg text-sg-heading rounded-bl-sm border border-sg-border'
                  : 'self-end bg-emerald-500 text-white text-right rounded-br-sm shadow-md'
                }
              `}>
                <span className="text-sm font-medium">{msg.val}</span>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-sg-border bg-sg-portal-bg">
            <div className="flex flex-row items-center bg-sg-card rounded-[20px] border border-sg-border pr-1.5 shadow-sm">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Hỏi Sales Copilot..."
                className="flex-1 min-h-[48px] px-4 py-2 text-sm font-medium text-sg-heading bg-transparent outline-none placeholder:text-sg-muted"
                onKeyDown={e => { if (e.key === 'Enter') handleSendChat(); }}
              />
              <button
                onClick={handleSendChat}
                className="w-[38px] h-[38px] rounded-[14px] bg-emerald-500 flex items-center justify-center hover:bg-emerald-400 transition-colors shadow-sm"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed right-6 bottom-6 w-16 h-16 rounded-[20px] flex items-center justify-center shadow-[0_4px_24px_rgba(16,185,129,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(16,185,129,0.4)] transition-all z-[10000] animate-sg-slide-up group border-2 border-white/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-amber-500 group-hover:from-emerald-400 group-hover:to-amber-400 transition-all" />
          <Bot size={28} className="text-white relative z-10" />
        </button>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PLACEHOLDER
   ════════════════════════════════════════════════════════ */

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center text-sg-subtext">
      <div className="bg-white dark:bg-black/30 backdrop-blur-3xl p-12 rounded-[40px] border border-slate-200 dark:border-sg-border shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 via-amber-500 to-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="w-20 h-20 mx-auto rounded-[20px] bg-sg-btn-bg border border-sg-border flex items-center justify-center mb-6 relative shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="w-10 h-10 border-4 border-sg-border border-t-emerald-500 rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-black text-sg-heading tracking-tight drop-shadow-md">Module "{title}" đang xây dựng</h2>
        <p className="text-sm font-bold text-sg-muted mt-3 max-w-sm mx-auto leading-relaxed">Giao diện phân phối theo tiêu chuẩn Neo-Glassmorphism v2.2. Vui lòng quay lại sau!</p>
      </div>
    </div>
  );
}
