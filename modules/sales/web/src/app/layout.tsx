import type { Metadata } from "next";
import "./globals.css";
import { Users, Target, Building, LogOut, FileText, Menu, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "SGroup Sales Management",
  description: "Enterprise Sales Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-200 font-sans antialiased bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.25),rgba(2,6,23,1))] overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar - Dark Glassmorphism */}
        <aside className="w-full md:w-72 flex-shrink-0 border-r border-white/10 bg-slate-900/40 backdrop-blur-3xl shadow-2xl flex flex-col z-20 transition-all h-auto md:h-screen relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent pointer-events-none"></div>
            
            <div className="p-6 border-b border-white/10 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400/50">
                      <Target className="w-6 h-6 text-white" />
                   </div>
                   <div>
                       <h2 className="font-black text-xl tracking-tight text-white hidden md:block leading-none">
                         SGroup<span className="text-emerald-400">SALE</span>
                       </h2>
                       <p className="text-[10px] text-emerald-500/80 font-bold uppercase tracking-widest mt-1">Platform v2</p>
                   </div>
                </div>
                <button className="md:hidden text-slate-400 hover:text-white bg-white/5 p-2 rounded-lg border border-white/10">
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto hidden md:block custom-scrollbar relative z-10">
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500/50"></span> Khối Back-Office 
                </p>
                <a href="http://localhost:3001/" className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium group">
                   <div className="flex items-center gap-3">
                     <Users className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                     <span className="text-sm">Nhân Sự (HR)</span>
                   </div>
                </a>

                <a href="http://localhost:3003/projects" className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium group">
                   <div className="flex items-center gap-3">
                     <FileText className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                     <span className="text-sm">Pháp Lý Dự Án</span>
                   </div>
                </a>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <p className="px-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Không Gian Sales
                </p>
                <a href="/" className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-semibold group focus-within:bg-gradient-to-r focus-within:from-emerald-500/10 focus-within:to-transparent border border-transparent focus-within:border-emerald-500/20">
                   <div className="flex items-center gap-3">
                     <Target className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                     <span className="text-sm">Tổng Quan Kinh Doanh</span>
                   </div>
                   <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-emerald-400" />
                </a>

                <a href="/transactions" className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-semibold group focus-within:bg-gradient-to-r focus-within:from-emerald-500/10 focus-within:to-transparent border border-transparent focus-within:border-emerald-500/20">
                   <div className="flex items-center gap-3">
                     <Target className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                     <span className="text-sm">Kanban Giao Dịch</span>
                   </div>
                   <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-emerald-400" />
                </a>
                
                <a href="/inventory" className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all font-semibold group mt-1 focus-within:bg-gradient-to-r focus-within:from-emerald-500/10 focus-within:to-transparent border border-transparent focus-within:border-emerald-500/20">
                   <div className="flex items-center gap-3">
                     <Building className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                     <span className="text-sm">Rổ Hàng Dự Án</span>
                   </div>
                   <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">MỚI</span>
                </a>
            </nav>

            <div className="p-5 border-t border-white/10 hidden md:block bg-slate-900/50 backdrop-blur-lg relative z-10">
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
                      NK
                   </div>
                   <div>
                      <p className="text-sm font-bold text-white">Ngô Khắc</p>
                      <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Giám Đốc Kinh Doanh</p>
                   </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20">
                   <LogOut className="w-4 h-4" /> Thoát Hệ Thống
                </button>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative h-[calc(100vh-80px)] md:h-screen z-10 w-full">
           <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
             <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto">
               {children}
             </div>
           </div>
        </main>
      </body>
    </html>
  );
}
