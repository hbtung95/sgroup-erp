"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, ArrowRight, BarChart3, TrendingUp, Layers, Users } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SkeletonStatCard } from "@/components/SkeletonLoader";
import { getDashboardStats, getTotalStatusBreakdown } from "@/lib/projectApi";
import type { DashboardStats, StatusCount } from "@/lib/types";
import { PRODUCT_STATUS_MAP } from "@/lib/types";

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

  const absorptionRate = stats && stats.totalUnits > 0
    ? ((stats.soldUnits / stats.totalUnits) * 100).toFixed(1)
    : "0";

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Hero Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 dark:from-blue-400 dark:via-cyan-400 dark:to-emerald-400">
              Quản Trị Dự Án
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Trung tâm Dữ liệu Chính — Quản lý dự án bất động sản</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard
              icon={<Building2 className="w-5 h-5" />}
              label="Tổng Dự Án"
              value={stats?.totalProjects ?? 0}
              subtitle={`${stats?.activeProjects ?? 0} đang mở bán`}
              color="text-blue-500 dark:text-blue-400"
            />
            <StatCard
              icon={<Layers className="w-5 h-5" />}
              label="Tổng Sản Phẩm"
              value={stats?.totalUnits ?? 0}
              subtitle={`${stats?.soldUnits ?? 0} đã bán`}
              color="text-emerald-500 dark:text-emerald-400"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Tỷ Lệ Hấp Thụ"
              value={`${absorptionRate}%`}
              subtitle="Đã bán / Tổng số căn"
              color="text-amber-500 dark:text-amber-400"
            />
            <StatCard
              icon={<BarChart3 className="w-5 h-5" />}
              label="Doanh Thu Ước Tính"
              value={`${((stats?.totalRevenue ?? 0)).toLocaleString("vi-VN")} Tỷ`}
              subtitle="Giá TB × Số căn đã bán"
              color="text-purple-500 dark:text-purple-400"
            />
          </>
        )}
      </div>

      {/* Status Breakdown */}
      {breakdown.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-8 border border-slate-200 dark:border-white/5">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Phân Bổ Trạng Thái Sản Phẩm</h3>
          <div className="flex gap-2 flex-wrap">
            {breakdown.map((b) => {
              const config = (PRODUCT_STATUS_MAP as Record<string, { label: string; color: string; bg: string; border: string }>)[b.status];
              return (
                <div key={b.status} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${config?.bg || "bg-slate-100 dark:bg-slate-500/10"} ${config?.border || "border-slate-200 dark:border-slate-500/20"}`}>
                  <span className={`w-2 h-2 rounded-full ${config?.color.replace("text-", "bg-") || "bg-slate-400"}`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{config?.label || b.status}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{b.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/projects" className="group">
          <div className="glass-card rounded-2xl p-6 transition-all hover:-translate-y-1 h-full border border-slate-200 dark:border-white/5">
            <div className="bg-blue-100 dark:bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Building2 className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Quản Lý Dự Án</h2>
            <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 leading-relaxed">
              Xem danh sách, tạo mới và quản lý toàn bộ các dự án bất động sản.
            </p>
            <span className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors">
              Mở danh sách <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>

        <div className="glass-card rounded-2xl p-6 border-dashed border-slate-300 dark:border-white/10">
          <div className="bg-emerald-100 dark:bg-emerald-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Plus className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Thêm Dự Án Mới</h2>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 leading-relaxed">Thiết lập dữ liệu master cho dự án mới.</p>
          <Link href="/projects" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95 inline-block">
            Khởi tạo bảng hàng
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-white/5">
          <div className="bg-purple-100 dark:bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Users className="text-purple-600 dark:text-purple-400 w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Báo Cáo & Phân Tích</h2>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-4 leading-relaxed">
            Xem báo cáo doanh số, tỷ lệ hấp thụ và hiệu suất bán hàng.
          </p>
          <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Sắp ra mắt</span>
        </div>
      </div>
    </div>
  );
}
