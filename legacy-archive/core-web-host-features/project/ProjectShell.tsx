import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProjectSidebar } from './components/ProjectSidebar';
import { Search, Sun, Moon, Briefcase } from 'lucide-react';
import { useAuthStore } from '../auth/store/authStore';

import { ProjectDashboardScreen } from './screens/ProjectDashboardScreen';
import { ProjectListScreen } from './screens/ProjectListScreen';
import { InventoryGrid } from './screens/InventoryGrid';
import { LegalKanbanScreen } from './screens/LegalKanbanScreen';
import { SingleProjectHub } from './screens/SingleProjectHub';

// Placeholders for nested screens
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="flex-1 h-full flex flex-col bg-transparent relative z-10 overflow-hidden">
      <div className="flex-1 p-8 flex items-center justify-center relative">
        <div className="text-center bg-white dark:bg-black/30 backdrop-blur-3xl p-12 rounded-[40px] border border-slate-200 dark:border-sg-border shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -inset-10 bg-linear-to-br from-blue-500/10 to-indigo-600/5 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-1000 origin-center" />
          <div className="w-20 h-20 mx-auto rounded-sg-xl bg-sg-btn-bg border border-sg-border flex items-center justify-center mb-6 relative shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <div className="w-10 h-10 border-4 border-sg-border border-t-cyan-500 rounded-full animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-sg-heading tracking-tight drop-shadow-md">Module "{title}" đang xây dựng</h2>
          <p className="text-sm font-bold text-sg-muted mt-3 max-w-sm mx-auto leading-relaxed">Giao diện phân phối theo tiêu chuẩn Neo-Glassmorphism v2.2. Vui lòng quay lại sau!</p>
        </div>
      </div>
    </div>
  );
}

import { ReportsScreen } from './screens/ReportsScreen';

export function ProjectShell() {
  const { user } = useAuthStore();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

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
    <div className="flex w-screen h-screen bg-sg-portal-bg overflow-hidden transition-colors duration-500">
      
      {/* ── CINEMATIC BACKDROP ── */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-sg-portal-bg/50 to-sg-portal-bg/95 z-10" />
        
        {/* Animated Mesh Auroras (Blue/Cyan/Indigo theme for Projects) */}
        <div className="absolute w-[800px] h-[800px] rounded-full bg-cyan-500 opacity-20 blur-[100px] z-0"
          style={{ animation: 'sg-aurora-1 20s ease-in-out infinite', top: '-10%', left: '-5%' }} />
        <div className="absolute w-[900px] h-[900px] rounded-full bg-indigo-600 opacity-20 blur-[120px] z-0"
          style={{ animation: 'sg-aurora-2 25s ease-in-out infinite', bottom: '-20%', right: '-10%' }} />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-500 opacity-20 blur-[100px] z-0"
          style={{ animation: 'sg-aurora-1 22s ease-in-out infinite', top: '30%', left: '30%', animationDirection: 'reverse' }} />
      </div>

      {/* Trái: Sidebar Module */}
      <div className="z-20 border-r border-slate-200 dark:border-sg-border/60 bg-white/80 dark:bg-black/60 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300">
        <ProjectSidebar />
      </div>

      {/* Phải: Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10">
        
        {/* Module Header */}
        <header className="h-[84px] bg-white/80 dark:bg-black/60 backdrop-blur-[32px] saturate-150 border-b border-slate-200 dark:border-sg-border/60 px-8 flex items-center justify-between z-30 transition-colors duration-300 shadow-[0_4px_32px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sg-lg bg-linear-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shadow-inner">
               <Briefcase size={22} className="text-cyan-500 drop-shadow-[0_2px_8px_rgba(6,182,212,0.5)]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[22px] font-black text-sg-heading tracking-tight drop-shadow-sm leading-tight">
                Trung Tâm Điều Hành Sàn
              </h1>
              <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-[1.5px] mt-0.5">SGroup Brokerage</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Context Search Box */}
            <div className="relative group hidden md:block w-72">
               <div className="absolute inset-0 bg-linear-to-r from-cyan-500/0 via-blue-500/10 to-indigo-500/0 rounded-xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>
               <div className="relative flex items-center h-11 bg-sg-btn-bg border border-sg-border hover:border-blue-500/30 rounded-xl px-4 transition-colors">
                  <Search size={16} className="text-sg-muted group-hover:text-blue-500 transition-colors" />
                  <span className="ml-3 text-[13px] font-semibold text-sg-muted group-hover:text-sg-heading transition-colors cursor-text">Tìm dự án, mã căn, giỏ hàng...</span>
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
              {isDark ? (
                <Moon size={18} className="text-sg-subtext group-hover:text-cyan-400 drop-shadow-sm" />
              ) : (
                <Sun size={18} className="text-sg-subtext group-hover:text-amber-500 drop-shadow-sm" />
              )}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[14px] font-black text-sg-heading drop-shadow-sm tracking-tight">{user?.name || 'Admin'}</span>
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded-md mt-0.5">{(user?.role === 'admin' ? 'System_Admin' : 'Project_Manager').replace('_', ' ')}</span>
              </div>
              <div className="w-11 h-11 rounded-[14px] bg-linear-to-br from-cyan-400 to-blue-600 relative group overflow-hidden shadow-[0_8px_16px_rgba(6,182,212,0.2)] hover:shadow-[0_8px_24px_rgba(6,182,212,0.4)] transition-all cursor-pointer">
                <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-[14px]" />
                <div className="absolute inset-px rounded-[13px] bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <span className="text-[16px] font-black text-white drop-shadow-md">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung Routing của Project Module */}
        <main className="flex-1 relative overflow-hidden flex flex-col bg-transparent z-10">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProjectDashboardScreen />} />
            <Route path="list" element={<ProjectListScreen />} />
            <Route path="inventory" element={<InventoryGrid />} />
            <Route path="transactions" element={<PlaceholderScreen title="Quản lý Giao Dịch & Khách Hàng" />} />
            <Route path="commission" element={<PlaceholderScreen title="Chính sách Hoa Hồng" />} />
            <Route path="legal" element={<LegalKanbanScreen />} />
            <Route path="board" element={<SingleProjectHub />} />
            <Route path="hub" element={<SingleProjectHub />} />
            <Route path="reports" element={<ReportsScreen />} />
            <Route path="settings" element={<PlaceholderScreen title="Cài đặt hệ thống" />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
