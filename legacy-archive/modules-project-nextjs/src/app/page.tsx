"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Layers,
  Crown,
  Activity,
  ShieldCheck,
  Target,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { getDashboardStats, getTotalStatusBreakdown } from "@/lib/projectApi";
import type { DashboardStats, StatusCount } from "@/lib/types";
import { PRODUCT_STATUS_MAP } from "@/lib/types";

// ──────────── Sub-Components ────────────

function KPICard({
  icon,
  label,
  subtitle,
  value,
  unit,
  accentFrom,
  accentTo,
  borderClass,
  glowClass,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  value: string | number;
  unit?: string;
  accentFrom: string;
  accentTo: string;
  borderClass: string;
  glowClass: string;
  iconBg: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-300 group
        bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl
        hover:-translate-y-2 hover:shadow-2xl
        ${borderClass}`}
    >
      {/* Accent glow */}
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity ${glowClass}`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-1 relative z-10">
        <div>
          <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-0.5">{label}</p>
          <p className="text-[10px] font-medium text-slate-400/60 dark:text-slate-600 italic">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border border-white/10 ${iconBg}`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="mt-5 relative z-10">
        <span className={`text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${accentFrom} ${accentTo}`}>
          {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
        </span>
        {unit && <span className="text-lg font-bold text-slate-400 dark:text-slate-500 ml-1.5">{unit}</span>}
      </div>

      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 h-1 rounded-r-full bg-gradient-to-r ${accentFrom} ${accentTo} transition-all duration-700 group-hover:w-full w-1/3 opacity-60`} />
    </div>
  );
}

// ──────────── Main Page ────────────

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [breakdown, setBreakdown] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats().catch(() => null),
      getTotalStatusBreakdown().catch(() => []),
    ]).then(([s, b]) => {
      setStats(s);
      setBreakdown(b || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto antialiased">
      {/* ═══════ Hero ═══════ */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/5 border border-amber-200 dark:border-amber-500/20 mb-4">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-[0.2em]">Cổng Điều Hành CPO</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Quản Trị Dự Án<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 dark:from-blue-400 dark:via-cyan-400 dark:to-emerald-400">
            Bất Động Sản
          </span>
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium text-sm max-w-xl leading-relaxed">
          Báo cáo đa chiều về rổ hàng, pháp lý dự án và các chỉ số kinh doanh lõi với độ trễ 0. 
          <span className="inline-flex items-center ml-2 text-emerald-600 dark:text-emerald-400 font-bold">
            <Activity className="w-3.5 h-3.5 mr-1" /> Cập nhật thời gian thực
          </span>
        </p>
      </div>

      {/* ═══════ 6 KPI Cards ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-3xl p-6 bg-white/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/5 animate-pulse h-[155px]">
              <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-16 mb-2" />
              <div className="h-2 bg-slate-100 dark:bg-white/3 rounded w-12 mb-8" />
              <div className="h-8 bg-slate-200 dark:bg-white/5 rounded w-10" />
            </div>
          ))
        ) : (
          <>
            <KPICard
              icon={<Building2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />}
              label="Tổng Dự Án"
              subtitle="Active Pipelines"
              value={stats?.totalProjects ?? 0}
              accentFrom="from-blue-600" accentTo="to-blue-400"
              borderClass="border-blue-100 dark:border-blue-500/20"
              glowClass="bg-blue-500"
              iconBg="bg-blue-50 dark:bg-blue-500/10"
            />
            <KPICard
              icon={<Target className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
              label="Đang Bán"
              subtitle="Live Inventory"
              value={stats?.activeProjects ?? 0}
              accentFrom="from-emerald-600" accentTo="to-emerald-400"
              borderClass="border-emerald-100 dark:border-emerald-500/20"
              glowClass="bg-emerald-500"
              iconBg="bg-emerald-50 dark:bg-emerald-500/10"
            />
            <KPICard
              icon={<TrendingUp className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
              label="Hấp Thụ"
              subtitle={`Đã ráp: ${stats?.soldProducts ?? 0}/${stats?.totalProducts ?? 0}`}
              value={`${stats?.absorptionRate ?? 0}%`}
              accentFrom="from-amber-500" accentTo="to-yellow-400"
              borderClass="border-amber-100 dark:border-amber-500/20"
              glowClass="bg-amber-500"
              iconBg="bg-amber-50 dark:bg-amber-500/10"
            />
            <KPICard
              icon={<CheckCircle2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
              label="Đã Bán Hết"
              subtitle="Hoá hồi hoàn thiện"
              value={stats?.completedProjects ?? 0}
              accentFrom="from-indigo-600" accentTo="to-indigo-400"
              borderClass="border-indigo-100 dark:border-indigo-500/20"
              glowClass="bg-indigo-500"
              iconBg="bg-indigo-50 dark:bg-indigo-500/10"
            />
            <KPICard
              icon={<BarChart3 className="w-5 h-5 text-rose-500 dark:text-rose-400" />}
              label="Doanh Số"
              subtitle="Gross Market Value"
              value={(stats?.totalRevenue ?? 0).toFixed(1)}
              unit="Tỷ"
              accentFrom="from-rose-500" accentTo="to-pink-400"
              borderClass="border-rose-100 dark:border-rose-500/20"
              glowClass="bg-rose-500"
              iconBg="bg-rose-50 dark:bg-rose-500/10"
            />
            <KPICard
              icon={<Wallet className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />}
              label="Hoa Hồng"
              subtitle="Dự Kiến Cắt Phí"
              value={(stats?.totalCommission ?? 0).toFixed(2)}
              unit="Tỷ"
              accentFrom="from-cyan-500" accentTo="to-teal-400"
              borderClass="border-cyan-100 dark:border-cyan-500/20"
              glowClass="bg-cyan-500"
              iconBg="bg-cyan-50 dark:bg-cyan-500/10"
            />
          </>
        )}
      </div>

      {/* ═══════ Cơ Cấu Kho Hàng ═══════ */}
      {breakdown.length > 0 && (
        <div className="rounded-3xl p-8 mb-8 border bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200/50 dark:border-white/10 relative overflow-hidden shadow-lg dark:shadow-2xl">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
          <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em] mb-5 flex items-center gap-2 relative z-10">
            <ShieldCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            Cơ Cấu Trạng Thái Kho Hàng
          </h3>

          {/* Visual Bar */}
          <div className="flex gap-0.5 h-4 rounded-full overflow-hidden mb-5 border border-slate-200/50 dark:border-white/10 relative z-10 bg-slate-100/50 dark:bg-slate-800/50">
            {breakdown.map((b) => {
              const total = breakdown.reduce((a, c) => a + c.count, 0);
              const pct = total > 0 ? (b.count / total) * 100 : 0;
              const config = (PRODUCT_STATUS_MAP as Record<string, { label: string; color: string; bg: string }>)[b.status];
              const barColor = config?.color.replace("text-", "bg-").split(" ")[0] ?? "bg-slate-400";
              return (
                <div key={b.status} className={`${barColor} transition-all duration-700 first:rounded-l-full last:rounded-r-full opacity-70 hover:opacity-100 cursor-pointer`} style={{ width: `${pct}%` }} title={`${config?.label ?? b.status}: ${b.count}`} />
              );
            })}
          </div>

          <div className="flex gap-3 flex-wrap relative z-10">
            {breakdown.map((b) => {
              const config = (PRODUCT_STATUS_MAP as Record<string, { label: string; color: string; bg: string; border: string }>)[b.status];
              return (
                <div key={b.status} className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm ${config?.bg ?? "bg-slate-100 dark:bg-slate-500/10"} ${config?.border ?? "border-slate-200 dark:border-slate-500/20"}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${config?.color.replace("text-", "bg-").split(" ")[0] ?? "bg-slate-400"}`} />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{config?.label || b.status}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{b.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════ Lối Tắt Nghiệp Vụ ═══════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/projects" className="group">
          <div className="rounded-3xl p-7 transition-all duration-300 hover:-translate-y-2 h-full border bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200/50 dark:border-white/10 relative overflow-hidden hover:shadow-xl dark:hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)] hover:border-blue-300 dark:hover:border-blue-500/30">
            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="bg-blue-50 dark:bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-blue-200 dark:border-blue-500/20 relative z-10">
              <Building2 className="text-blue-600 dark:text-blue-400 w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 relative z-10 tracking-tight">Mở Rổ Hàng Trực Tiếp</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 leading-relaxed relative z-10 font-medium">
              Xem danh sách, tạo mới và quản lý toàn bộ các dự án bất động sản đang triển khai.
            </p>
            <span className="inline-flex items-center text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors relative z-10">
              Mở danh sách <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </span>
          </div>
        </Link>

        <div className="rounded-3xl p-7 border-dashed border-2 border-slate-200 dark:border-white/10 relative overflow-hidden hover:-translate-y-1 transition-all duration-300 group bg-white/40 dark:bg-slate-900/20 backdrop-blur-xl">
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="bg-emerald-50 dark:bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-emerald-200 dark:border-emerald-500/20 relative z-10">
            <Plus className="text-emerald-600 dark:text-emerald-400 w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 relative z-10 tracking-tight">Thiết Lập Dự Án Mới</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 leading-relaxed relative z-10 font-medium">
            Khởi tạo bảng hàng, thiết lập dữ liệu gốc và cấu hình chính sách giá cho dự án mới.
          </p>
          <Link href="/projects" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-bold hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)] transition-all active:scale-95 inline-block relative z-10">
            Khởi tạo bảng hàng
          </Link>
        </div>

        <div className="rounded-3xl p-7 border bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-slate-200/50 dark:border-white/10 relative overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="bg-purple-50 dark:bg-purple-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-purple-200 dark:border-purple-500/20 relative z-10">
            <Layers className="text-purple-600 dark:text-purple-400 w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 relative z-10 tracking-tight">Báo Cáo & Phân Tích</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 leading-relaxed relative z-10 font-medium">
            Xem báo cáo doanh số, tỷ lệ hấp thụ và hiệu suất bán hàng theo từng dự án.
          </p>
          <span className="text-sm font-bold text-slate-400 dark:text-slate-500 relative z-10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Sắp ra mắt
          </span>
        </div>
      </div>
    </div>
  );
}
