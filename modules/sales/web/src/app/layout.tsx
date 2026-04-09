import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Users, Target, Building, LogOut } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SGroup ERP - Sales Module",
  description: "Phân hệ quản trị Kinh Doanh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 min-h-screen`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 glass-panel border-r border-white/40 shadow-xl flex flex-col z-20 m-4 rounded-3xl overflow-hidden relative">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10"></div>
             
             <div className="p-6 border-b border-white/20">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                      S
                   </div>
                   <h2 className="font-extrabold text-xl tracking-tight text-indigo-950">SGroup<span className="text-indigo-600">Sales</span></h2>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Enterprise Trading Platform</p>
             </div>

             <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
                
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white/60 transition-all font-medium group">
                   <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   Dashboard
                </Link>

                <Link href="/transactions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white/60 transition-all font-medium group">
                   <Target className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   Giao Dịch (Kanban)
                </Link>

                <Link href="/customers" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white/60 transition-all font-medium group">
                   <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   Khách Hàng
                </Link>
                
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6">Rổ Hàng Toàn Quốc</p>
                <Link href="/inventory" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white/60 transition-all font-medium group">
                   <Building className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   Bảng Hàng Dự Án
                </Link>
             </nav>

             <div className="p-4 border-t border-white/20 bg-white/30 backdrop-blur-md">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-inner flex items-center justify-center text-white font-bold border-2 border-white">
                      NV
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-800">Sales Staff</p>
                      <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md inline-block">NVKD - Team Alpha</p>
                   </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                   <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
             </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
              {children}
          </main>
        </div>
      </body>
    </html>
  );
}
