"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { LayoutDashboard, Building, Target, Grid, LogOut, Menu, ChevronLeft, Sun, Moon, type LucideIcon } from "lucide-react";
import { ToastProvider } from "@/components/Toast";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const navItems: NavGroup[] = [
  { group: "TỔNG QUAN", items: [
    { href: "/", label: "Trang chủ", icon: LayoutDashboard },
  ]},
  { group: "QUẢN LÝ DỰ ÁN", items: [
    { href: "/projects", label: "Danh sách Dự Án", icon: Building },
  ]},
  { group: "LIÊN KẾT", items: [
    { href: "http://localhost:3001/", label: "Nhân Sự (HR)", icon: Target, external: true },
    { href: "http://localhost:3004/transactions", label: "Giao Dịch", icon: Grid, external: true },
  ]},
];

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebar = (
    <aside className={`flex-shrink-0 border-r border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl flex flex-col z-20 transition-all duration-300 h-screen ${collapsed ? "w-[72px]" : "w-64"}`}>
      {/* Logo */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <span className="font-bold text-white text-lg leading-none">S</span>
          </div>
          {!collapsed && (
            <h2 className="font-bold text-lg tracking-tight text-slate-800 dark:text-white">
              SGroup<span className="text-blue-500 dark:text-blue-400 ml-1">ERP</span>
            </h2>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors hidden md:block">
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group}>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 mt-4">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const active = !item.external && isActive(item.href);
              const Icon = item.icon;
              const className = `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium group ${
                active ? "active bg-blue-50/80 text-blue-700 dark:bg-blue-500/10 dark:text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              } ${collapsed ? "justify-center" : ""}`;
              const content = (
                <>
                  <Icon className={`w-[18px] h-[18px] flex-shrink-0 sidebar-icon ${active ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"} transition-colors`} />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </>
              );

              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className={className}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={className}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User & Theme */}
      <div className={`p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 ${collapsed ? "px-2" : ""}`}>
        <div className={`flex items-center gap-3 mb-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
            AD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between pr-1">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Admin</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Project Manager</p>
              </div>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                  title="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
            </div>
          )}
        </div>
        {!collapsed && (
          <button className="w-full flex items-center justify-center gap-2 py-2 text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        )}
        {collapsed && mounted && (
           <button
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             className="w-full mt-2 flex items-center justify-center p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
             title="Toggle theme"
           >
             {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
           </button>
        )}
      </div>
    </aside>
  );

  return (
    <ToastProvider>
      <div className="flex h-screen">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="relative w-64 h-full">{sidebar}</div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden md:block">{sidebar}</div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-screen w-full relative z-10">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}

