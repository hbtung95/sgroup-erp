import React, { useState, useMemo, useEffect } from 'react';
import { Bot, Command, Search, X, Send, Sparkles, FileText, Users, Calendar, Sun, Moon } from 'lucide-react';
import { HRErrorBoundary } from './components/ErrorBoundary';
import { HRSidebar, HRSidebarItem, HRRole } from './HRSidebar';
import { useAuthStore } from '../auth/store/authStore';
import { useHRRoute } from './hooks/useHRRoute';

// Import Batch 1 Screens
import { HRDashboard } from './screens/HRDashboard';
import { StaffDirectoryScreen } from './screens/StaffDirectoryScreen';

// Import Batch 2 Screens
import { EmployeeProfileScreen } from './screens/EmployeeProfileScreen';
import { OrgConfigScreen } from './screens/OrgConfigScreen';

// Import Batch 3 Screens
import { TimekeepingScreen } from './screens/TimekeepingScreen';
import { LeavesScreen } from './screens/LeavesScreen';
import { PayrollScreen } from './screens/PayrollScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { BenefitsScreen } from './screens/BenefitsScreen';
import { PoliciesScreen } from './screens/PoliciesScreen';
import { PerformanceScreen } from './screens/PerformanceScreen';
import { RecruitmentScreen } from './screens/RecruitmentScreen';

const KEY_TO_COMPONENT: Record<string, React.ComponentType<any>> = {
  HR_DASHBOARD: HRDashboard,
  HR_DIRECTORY: StaffDirectoryScreen,
  HR_PROFILE: EmployeeProfileScreen,
  HR_ORG_CONFIG: OrgConfigScreen,
  HR_TIMEKEEPING: TimekeepingScreen,
  HR_LEAVES: LeavesScreen,
  HR_PAYROLL: PayrollScreen,
  HR_BENEFITS: BenefitsScreen,
  HR_PERFORMANCE: PerformanceScreen,
  HR_RECRUITMENT: RecruitmentScreen,
  HR_TRAINING: TrainingScreen,
  HR_POLICIES: PoliciesScreen,
};

export function HRShell() {
  const validKeys = useMemo(() => [
    'HR_DASHBOARD', 'HR_DIRECTORY', 'HR_PROFILE', 'HR_ORG_CONFIG', 'HR_TIMEKEEPING', 'HR_LEAVES',
    'HR_PAYROLL', 'HR_BENEFITS', 'HR_RECRUITMENT', 'HR_PERFORMANCE', 'HR_TRAINING', 'HR_POLICIES'
  ], []);
  
  const { activeKey, params, navigate } = useHRRoute(validKeys);
  const [activeLabel, setActiveLabel] = useState('Tổng quan HR');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  
  // Floating AI & CmdK
  const [isCopilotOpen, setCopilotOpen] = useState(false);
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'ai'|'user', val: string}[]>([
    { role: 'ai', val: 'Chào bạn, tôi là HR Copilot. Tôi có thể giúp gì cho bạn hôm nay? (Ví dụ: "Hôm nay ai nghỉ phép?", "Tính lương tháng 3", v.v.)' }
  ]);

  const { user } = useAuthStore();
  const userRole: HRRole = user?.role === 'admin' ? 'admin' : 'hr_staff';

  // Toggle Theme Function
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

  // Command Palette Cmd+K Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (item: HRSidebarItem) => {
    navigate(item.key);
    setActiveLabel(item.label);
    setActiveSection(item.section);
  };

  const ContentComponent = KEY_TO_COMPONENT[activeKey];

  const sectionLabels: Record<string, string> = {
    dashboard: 'TỔNG QUAN',
    directory: 'HỒ SƠ NHÂN SỰ',
    time_attendance: 'CHẤM CÔNG & NGHỈ PHÉP',
    payroll: 'LƯƠNG THƯỞNG (C&B)',
    recruitment: 'TUYỂN DỤNG',
    performance_training: 'ĐÁNH GIÁ & ĐÀO TẠO',
    admin: 'QUẢN TRỊ & HÀNH CHÍNH',
  };

  return (
    <div className="flex w-screen h-screen bg-sg-portal-bg overflow-hidden transition-colors duration-300">
      
      {/* Dynamic Aurora backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[1200px] h-[1200px] rounded-full bg-linear-to-br from-sg-red/10 via-pink-500/5 to-transparent blur-[120px] animate-sg-pulse mix-blend-screen dark:mix-blend-lighten" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-linear-to-tl from-purple-500/10 via-sg-red-dark/5 to-transparent blur-[120px] animate-sg-pulse delay-1000 mix-blend-screen dark:mix-blend-lighten" style={{ animationDuration: '10s' }} />
      </div>

      <div className="z-10 bg-sg-card border-r border-sg-border transition-colors duration-300">
        <HRSidebar
          activeKey={activeKey}
          onSelect={handleSelect}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
          userRole={userRole}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative z-0 transition-colors duration-300">
        
        {/* TopBar */}
        <header className="h-[80px] bg-sg-header-bg/80 backdrop-blur-xl border-b border-sg-border px-8 flex items-center justify-between z-10 transition-colors duration-300 shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px]">
                {sectionLabels[activeSection] || 'HR'}
              </span>
              <div className="w-1 h-1 rounded-full bg-sg-red opacity-80" />
              <span className="text-[11px] font-extrabold text-sg-red uppercase tracking-[1px]">
                {activeLabel.toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-black text-sg-heading tracking-tight drop-shadow-sm">
              {activeLabel}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommandOpen(true)}
              className="px-4 py-2 bg-sg-btn-bg hover:bg-sg-border border border-sg-border rounded-xl hidden md:flex items-center gap-4 group transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search size={16} className="text-sg-muted group-hover:text-sg-heading transition-colors" />
                <span className="text-sm font-semibold text-sg-muted group-hover:text-sg-heading transition-colors">Tìm kiếm...</span>
              </div>
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="px-1.5 py-0.5 rounded bg-sg-card border border-sg-border text-[10px] font-bold text-sg-heading tracking-wide shadow-sm">
                  Cmd
                </div>
                <div className="px-1.5 py-0.5 rounded bg-sg-card border border-sg-border text-[10px] font-bold text-sg-heading tracking-wide shadow-sm">
                  K
                </div>
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
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-extrabold text-sg-heading shadow-sm">{user?.name || 'User'}</span>
                <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-wide">{userRole.replace('_', ' ')}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sg-red to-sg-red-dark flex items-center justify-center shadow-sg-brand ring-2 ring-white/10">
                <span className="text-[15px] font-black text-white">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
          <div className="min-h-full pb-20">
            <HRErrorBoundary>
              {ContentComponent ? (
                <ContentComponent userRole={userRole} routeParams={params} />
              ) : (
                <PlaceholderScreen title={activeLabel} />
              )}
            </HRErrorBoundary>
          </div>
        </main>
      </div>

      {/* ═══ COMMAND PALETTE (Cmd+K) ═══ */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-sg-heading/20 backdrop-blur-sm animate-sg-fade-in">
          <div className="absolute inset-0 cursor-default" onClick={() => setCommandOpen(false)} />
          <div className="relative w-full max-w-[640px] bg-sg-portal-bg rounded-2xl overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.25)] border border-sg-border animate-sg-slide-up scale-100">
             <div className="flex flex-row items-center px-5 border-b border-sg-border bg-sg-card">
                <Search size={22} className="text-blue-500 shrink-0" />
                <input
                   autoFocus
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Tìm kiếm nhân sự, phòng ban, chính sách..."
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
                  { icon: FileText, label: 'Tạo biểu mẫu Đánh giá năng lực mới', color: 'text-purple-500', bg: 'bg-purple-50' },
                  { icon: Users, label: 'Tra cứu danh sách nhân sự mới on-board', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { icon: Calendar, label: 'Duyệt 14 đơn nghỉ phép chờ xử lý', color: 'text-amber-500', bg: 'bg-amber-50' },
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

      {/* ═══ HR COPILOT ═══ */}
      {isCopilotOpen ? (
        <div className="fixed right-6 bottom-6 w-[380px] h-[600px] bg-sg-card/90 backdrop-blur-2xl rounded-[28px] border border-sg-border shadow-sg-lg z-10000 flex flex-col overflow-hidden animate-sg-slide-up">
           {/* Header */}
           <div className="bg-linear-to-br from-sg-red to-sg-red-dark p-4 flex flex-row items-center justify-between">
             <div className="flex flex-row items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/20 shadow-sm">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-white drop-shadow-sm tracking-wide">HR Copilot</span>
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
                    : 'self-end bg-sg-red text-white text-right rounded-br-sm shadow-md'
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
                   placeholder="Hỏi HR Copilot..."
                   className="flex-1 min-h-[48px] px-4 py-2 text-sm font-medium text-sg-heading bg-transparent outline-none placeholder:text-sg-muted"
                   onKeyDown={e => {
                     if(e.key === 'Enter' && chatInput.trim()){
                       setChatMessages([...chatMessages, { role: 'user', val: chatInput }]);
                       setChatInput('');
                       setTimeout(() => {
                         setChatMessages(prev => [...prev, { role: 'ai', val: `S-Group ERP đang xử lý yêu cầu: "${chatInput}". (Phase 2)` }]);
                       }, 1000);
                     }
                   }}
                />
                <button 
                  onClick={() => {
                     if(chatInput.trim()){
                       setChatMessages([...chatMessages, { role: 'user', val: chatInput }]);
                       setChatInput('');
                       setTimeout(() => {
                         setChatMessages(prev => [...prev, { role: 'ai', val: `S-Group ERP đang xử lý yêu cầu: "${chatInput}". (Phase 2)` }]);
                       }, 1000);
                     }
                  }}
                  className="w-[38px] h-[38px] rounded-[14px] bg-sg-red flex items-center justify-center hover:bg-sg-red-light transition-colors shadow-sm"
                >
                   <Send size={16} className="text-white" />
                </button>
              </div>
           </div>
        </div>
      ) : (
        <button 
          onClick={() => setCopilotOpen(true)} 
          className="fixed right-6 bottom-6 w-16 h-16 rounded-sg-2xl flex items-center justify-center shadow-sg-brand hover:-translate-y-1 hover:shadow-sg-lg transition-all z-10000 animate-sg-slide-up group border-2 border-white/20 overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-br from-sg-red to-sg-red-dark group-hover:from-sg-red-light group-hover:to-sg-red transition-all" />
          <Bot size={28} className="text-white relative z-10" />
        </button>
      )}

    </div>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center text-sg-subtext">
      <div className="text-4xl text-sg-muted mb-4 opacity-70">🚧</div>
      <h3 className="text-xl font-bold text-sg-heading mb-2">{title}</h3>
      <p className="max-w-sm text-sm font-medium">Màn hình này đang trong quá trình phát triển (Phase 2).</p>
    </div>
  );
}
