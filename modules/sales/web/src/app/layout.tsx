import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Users, Target, Building, LogOut, FileText, Grid, Menu } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SGroup ERP",
  description: "Enterprise Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-200 font-sans antialiased bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.3),rgba(2,6,23,1))] overflow-hidden flex flex-col md:flex-row`}>
        
        {/* Sidebar - Dark Glassmorphism */}
        <aside className="w-full md:w-64 flex-shrink-0 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl flex flex-col z-20 transition-all h-auto md:h-screen">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <span className="font-bold text-white text-lg leading-none">S</span>
                   </div>
                   <h2 className="font-bold text-lg tracking-tight text-white hidden md:block">
                     SGroup<span className="text-blue-400 ml-1">ERP</span>
                   </h2>
                </div>
                <button className="md:hidden text-slate-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto hidden md:block">
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-2">DASHBOARD</p>
                
                <a href="http://localhost:3001/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium group">
                   <Users className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                   <span className="text-sm">Nhân Sự (HR)</span>
                </a>

                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6">QUẢN LÝ DỰ ÁN</p>
                <a href="http://localhost:3003/projects" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium group">
                   <FileText className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                   <span className="text-sm">Pháp Lý Dự Án</span>
                </a>

                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 mt-6">QUẢN LÝ KINH DOANH</p>
                <a href="http://localhost:3004/transactions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium group">
                   <Target className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
                   <span className="text-sm">Giao Dịch (Kanban)</span>
                </a>
                
                <a href="http://localhost:3004/inventory" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium group">
                   <Building className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
                   <span className="text-sm">Kho Xem Theo Dự Án</span>
                </a>
            </nav>

            <div className="p-4 border-t border-white/10 hidden md:block bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium border border-white/10">
                      AD
                   </div>
                   <div>
                      <p className="text-sm font-medium text-slate-200">Administrator</p>
                      <p className="text-[11px] text-blue-400 font-medium">System Manager</p>
                   </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2 text-[13px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                   <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative h-[calc(100vh-80px)] md:h-screen">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
