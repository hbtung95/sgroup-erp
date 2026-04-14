"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Building, MapPin } from "lucide-react";
import { ProjectCreateModal } from "./ProjectCreateModal";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { useToast } from "@/components/Toast";
import { listProjects, getDashboardStats } from "@/lib/projectApi";
import type { Project, DashboardStats } from "@/lib/types";
import { Layers, TrendingUp, BarChart3 } from "lucide-react";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Tất cả", value: "" },
  { label: "Đang bán", value: "SELLING" },
  { label: "Sắp mở", value: "UPCOMING" },
  { label: "Bàn giao", value: "HANDOVER" },
  { label: "Đã đóng", value: "CLOSED" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();

  const fetchProjects = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const res = await listProjects({ search: query, limit: 50 });
      setProjects(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không rõ nguyên nhân";
      toast("error", "Không thể tải danh sách dự án: " + message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await getDashboardStats();
      setStats(s);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProjects(search);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, fetchProjects]);

  const filteredProjects = activeTab
    ? projects.filter((p) => p.status === activeTab)
    : projects;

  const absorptionRate = stats && stats.totalUnits > 0
    ? ((stats.soldUnits / stats.totalUnits) * 100).toFixed(1)
    : "0";

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
            Danh sách Dự án
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Tổng cộng {total} dự án trong hệ thống
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-1.5" /> Thêm Dự Án
        </button>
      </div>

      {/* KPI Mini Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
            <Building className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tổng DA</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{stats.totalProjects}</p>
            </div>
          </div>
          <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
            <Layers className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tổng Căn</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{stats.totalUnits.toLocaleString()}</p>
            </div>
          </div>
          <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Đã bán</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{stats.soldUnits.toLocaleString()}</p>
            </div>
          </div>
          <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hấp thụ</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{absorptionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <ProjectCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { fetchProjects(search); fetchStats(); }}
      />

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl px-3 flex items-center gap-2">
          <Search className="text-slate-400 dark:text-slate-500 w-4 h-4" />
          <input
            placeholder="Tìm theo tên, mã, chủ đầu tư, vị trí..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none py-2.5 px-1 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-1 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200 dark:border-white/5 rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.value
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="Không tìm thấy dự án"
          description={search ? `Không có dự án nào phù hợp với "${search}". Thử tìm kiếm khác.` : "Chưa có dự án nào. Bấm nút Thêm Dự Án để bắt đầu."}
          action={
            !search ? (
              <button onClick={() => setIsModalOpen(true)} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                <Plus className="w-4 h-4 inline mr-1" /> Thêm Dự Án
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <Link href={`/projects/${p.id}`} key={p.id} className="block group">
              <div className="glass-card rounded-2xl p-6 transition-all hover:-translate-y-1 h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 font-bold px-2.5 py-1 rounded-md text-xs border border-blue-200 dark:border-blue-500/20">
                      {p.code}
                    </span>
                    <StatusBadge status={p.status} type="project" />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  {p.name}
                </h3>

                <div className="space-y-1.5">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Building className="w-3.5 h-3.5 mr-2 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{p.developer || "Chưa cập nhật CĐT"}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 mr-2 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{p.location || "Chưa có vị trí"}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/5 flex justify-between items-center text-sm">
                  <div className="text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{p.soldUnits}</span> / {p.totalUnits} căn
                  </div>
                  <div className="w-24 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.3)] transition-all"
                      style={{ width: `${p.totalUnits > 0 ? Math.min((p.soldUnits / p.totalUnits) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
