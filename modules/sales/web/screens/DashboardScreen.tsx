import React, { useMemo, useState } from 'react';
import {
  TrendingUp, Users, Target, DollarSign, ArrowUpRight,
  ArrowDownRight, Clock, BarChart3, PieChart, Activity,
  Briefcase, Award, Building2, Loader2, Plus,
} from 'lucide-react';
import {
  useDashboardKPIs, useMonthlyRevenue, usePipelineSummary,
  useTopSellers, formatVND, formatPercent,
} from '../hooks/useSalesData';
import { SkeletonKPICard, SkeletonChart, SkeletonLeaderboard, AnimatedCounter } from '../components/shared';
import { useSalesRole } from '../components/shared/RoleContext';
import { ActivityEntryModal } from '../components/ActivityEntryModal';

// ═══════════════════════════════════════════════════════════
// DASHBOARD SCREEN — Cinematic KPIs + Analytics
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string; barColor: string }> = {
  PROSPECTING: { label: 'Tiềm năng',  color: 'text-slate-500',   bg: 'bg-slate-500/10',   barColor: 'from-slate-400 to-slate-500' },
  QUALIFIED:   { label: 'Đủ ĐK',      color: 'text-blue-500',    bg: 'bg-blue-500/10',    barColor: 'from-blue-400 to-blue-600' },
  BOOKING:     { label: 'Giữ chỗ',    color: 'text-amber-500',   bg: 'bg-amber-500/10',   barColor: 'from-amber-400 to-amber-600' },
  DEPOSIT:     { label: 'Đặt cọc',    color: 'text-orange-500',  bg: 'bg-orange-500/10',  barColor: 'from-orange-400 to-orange-600' },
  CONTRACT:    { label: 'Ký HĐMB',    color: 'text-indigo-500',  bg: 'bg-indigo-500/10',  barColor: 'from-indigo-400 to-indigo-600' },
  CLOSED:      { label: 'Thành công',  color: 'text-emerald-500', bg: 'bg-emerald-500/10', barColor: 'from-emerald-400 to-emerald-600' },
  LOST:        { label: 'Mất',         color: 'text-rose-500',    bg: 'bg-rose-500/10',    barColor: 'from-rose-400 to-rose-600' },
};

export function DashboardScreen() {
  const { role } = useSalesRole();
  const [isActivityModalOpen, setActivityModalOpen] = useState(false);
  const { data: kpi, loading: kpiLoading } = useDashboardKPIs();
  const { data: monthlyData, loading: monthlyLoading } = useMonthlyRevenue();
  const { data: pipeline, loading: pipelineLoading } = usePipelineSummary();
  const { data: topSellers, loading: sellersLoading } = useTopSellers(5);

  const maxMonthlyRevenue = useMemo(() => {
    if (!monthlyData) return 1;
    return Math.max(...monthlyData.map(m => m.revenue), 1);
  }, [monthlyData]);

  const totalPipelineValue = useMemo(() => {
    if (!pipeline) return 0;
    return pipeline.reduce((sum, s) => sum + s.value, 0);
  }, [pipeline]);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">

      {/* ══════ HEADER ══════ */}
      <div className="flex items-center justify-between sg-stagger" style={{ animationDelay: '0ms' }}>
        <h2 className="text-[20px] font-black text-sg-heading">
          {role === 'sales_staff' ? 'Dashboard Cá Nhân' : role === 'sales_manager' ? 'Dashboard Đội Nhóm' : 'Tổng Quan Công Ty'}
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[12px] font-black pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Đồng bộ từ CRM</span>
        </div>
      </div>

      {/* ══════ KPI STAT CARDS ══════ */}
      {kpiLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonKPICard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <KPICard
            icon={<DollarSign size={20} />} label="Doanh Thu (HH)"
            value={kpi?.revenue ?? 0} formatter={formatVND} suffix="VNĐ"
            trend={12.5} delay={0}
            gradient="from-emerald-500/20 to-emerald-600/10" iconColor="text-emerald-500"
          />
          <KPICard
            icon={<Target size={20} />} label="Pipeline Value"
            value={kpi?.pipelineValue ?? 0} formatter={formatVND} suffix="VNĐ"
            trend={8.3} delay={60}
            gradient="from-blue-500/20 to-indigo-600/10" iconColor="text-blue-500"
          />
          <KPICard
            icon={<Users size={20} />} label="Tổng Leads"
            value={kpi?.totalLeads ?? 0} delay={120}
            trend={-2.1}
            gradient="from-amber-500/20 to-orange-600/10" iconColor="text-amber-500"
          />
          <KPICard
            icon={<TrendingUp size={20} />} label="Conversion Rate"
            value={kpi?.conversionRate ?? 0} formatter={(v: number) => formatPercent(v)}
            trend={1.8} delay={180}
            gradient="from-violet-500/20 to-purple-600/10" iconColor="text-violet-500"
          />
          <KPICard
            icon={<Clock size={20} />} label="Chờ Duyệt"
            value={kpi?.pendingApprovals ?? 0} delay={240}
            gradient="from-rose-500/20 to-pink-600/10" iconColor="text-rose-500"
          />
        </div>
      )}

      {/* ══════ CHARTS ROW ══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly Revenue Chart */}
        {monthlyLoading ? (
          <div className="lg:col-span-2"><SkeletonChart /></div>
        ) : (
          <div className="lg:col-span-2 bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md hover:shadow-sg-lg transition-shadow sg-stagger" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <BarChart3 size={18} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-[15px] font-black text-sg-heading">Doanh Thu Theo Tháng</h3>
                  <span className="text-[11px] font-bold text-sg-muted">Năm 2026</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-sg-muted">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Revenue</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20" /> GMV</div>
              </div>
            </div>

            <div className="flex items-end gap-2 h-[220px] px-2">
              {(monthlyData || []).map((m, i) => {
                const height = maxMonthlyRevenue > 0 ? (m.revenue / maxMonthlyRevenue) * 100 : 0;
                const currentMonth = new Date().getMonth() + 1;
                const isCurrent = m.month === currentMonth;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                    {/* Value tooltip */}
                    <span className="text-[9px] font-bold text-sg-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatVND(m.revenue)}
                    </span>
                    {/* Bar */}
                    <div className="w-full relative">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-80 ${
                          isCurrent
                            ? 'bg-linear-to-t from-emerald-600 to-emerald-400 shadow-[0_-4px_16px_rgba(16,185,129,0.4)]'
                            : 'bg-linear-to-t from-emerald-500/40 to-emerald-400/15'
                        }`}
                        style={{
                          height: `${Math.max(height, 4)}%`,
                          animation: `bar-grow 800ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 50}ms both`,
                        }}
                      />
                      {/* Shimmer on hover */}
                      <div className="absolute inset-0 bg-linear-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                    </div>
                    {/* Label */}
                    <span className={`text-[10px] font-bold ${isCurrent ? 'text-emerald-500' : 'text-sg-muted'}`}>
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pipeline Funnel */}
        {pipelineLoading ? (
          <SkeletonChart height="h-[280px]" />
        ) : (
          <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <PieChart size={18} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-sg-heading">Phễu Bán Hàng</h3>
                <span className="text-[11px] font-bold text-sg-muted">{formatVND(totalPipelineValue)} tổng giá trị</span>
              </div>
            </div>

            <div className="space-y-3">
              {(pipeline || []).map((stage, idx) => {
                const config = STAGE_CONFIG[stage.stage] || { label: stage.stage, color: 'text-slate-500', bg: 'bg-slate-500/10', barColor: 'from-slate-400 to-slate-500' };
                const pct = totalPipelineValue > 0 ? (stage.value / totalPipelineValue) * 100 : 0;
                return (
                  <div key={stage.stage} className="group sg-stagger" style={{ animationDelay: `${300 + idx * 60}ms` }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[11px] font-bold ${config.color}`}>{config.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-sg-muted">{stage.count} deals</span>
                        <span className="text-[9px] font-black text-sg-heading bg-sg-card/50 px-1.5 py-0.5 rounded">{formatVND(stage.value)}</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-sg-btn-bg rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${config.barColor} transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm`}
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          animation: `bar-width 1000ms cubic-bezier(0.16, 1, 0.3, 1) ${idx * 100}ms both`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══════ BOTTOM ROW ══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Sellers */}
        {sellersLoading ? (
          <SkeletonLeaderboard />
        ) : (
          <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Award size={18} className="text-amber-500" />
              </div>
              <h3 className="text-[15px] font-black text-sg-heading">
                {role === 'sales_staff' ? 'Bảng Xếp Hạng' : role === 'sales_manager' ? 'Top Thành Viên' : 'Top Sales Toàn Công Ty'}
              </h3>
            </div>

            <div className="space-y-3">
              {(topSellers || []).map((seller, idx) => (
                <div
                  key={seller.staffId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-sg-card/50 border border-sg-border/50 hover:border-emerald-500/20 hover:-translate-y-0.5 transition-all group sg-stagger"
                  style={{ animationDelay: `${400 + idx * 60}ms` }}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-black text-white shadow-md ${
                    idx === 0 ? 'bg-linear-to-br from-amber-400 to-amber-600 shadow-amber-500/30'
                    : idx === 1 ? 'bg-linear-to-br from-slate-300 to-slate-500'
                    : idx === 2 ? 'bg-linear-to-br from-orange-500 to-orange-700'
                    : 'bg-sg-muted/30'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[13px] font-bold text-sg-heading truncate group-hover:text-emerald-500 transition-colors">{seller.staffName}</span>
                    <span className="block text-[10px] font-medium text-sg-muted">{seller.teamName} • {seller.deals} deals</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[13px] font-black text-emerald-500">{formatVND(seller.gmv)}</span>
                    <span className="block text-[10px] font-bold text-sg-muted">GMV</span>
                  </div>
                </div>
              ))}
              {(!topSellers || topSellers.length === 0) && (
                <div className="py-8 text-center text-[13px] font-bold text-sg-muted">Chưa có dữ liệu</div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Activity size={18} className="text-violet-500" />
            </div>
            <h3 className="text-[15px] font-black text-sg-heading">Thống Kê Nhanh</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <QuickStat label="KPI Hoạt Động" value={kpi?.pointsKPI ?? 0} formatter={v => v + '%'} icon={<Target size={16} />} color="text-emerald-500" bgColor="bg-emerald-500/10 border-emerald-500/20" delay={500} />
            <QuickStat label="Điểm Cống Hiến" value={kpi?.totalActivityPoints ?? 0} icon={<Award size={16} />} color="text-amber-500" bgColor="bg-amber-500/10 border-amber-500/20" delay={550} />
            <QuickStat label="Deals Đang Mở" value={kpi ? (kpi.totalDeals - kpi.closedDeals) : 0} icon={<Briefcase size={16} />} color="text-blue-500" bgColor="bg-blue-500/10 border-blue-500/20" delay={600} />
            <QuickStat label="Deals Đã Chốt" value={kpi?.closedDeals ?? 0} icon={<Target size={16} />} color="text-emerald-500" bgColor="bg-emerald-500/10 border-emerald-500/20" delay={650} />
            <QuickStat label="Nhân Sự Active" value={kpi?.activeStaff ?? 0} icon={<Users size={16} />} color="text-blue-500" bgColor="bg-blue-500/10 border-blue-500/20" delay={700} />
            <QuickStat label="Số Team" value={kpi?.teamCount ?? 0} icon={<Building2 size={16} />} color="text-violet-500" bgColor="bg-violet-500/10 border-violet-500/20" delay={750} />
          </div>
        </div>
      </div>

      {/* ══════ FLOATING ACTION & MODALS ══════ */}
      {role !== 'admin' && (
        <button
          onClick={() => setActivityModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 hover:-translate-y-1 hover:shadow-emerald-500/60 flex items-center justify-center transition-all z-40 sg-stagger group"
          style={{ animationDelay: '800ms' }}
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      )}

      <ActivityEntryModal 
        isOpen={isActivityModalOpen} 
        onClose={() => setActivityModalOpen(false)} 
      />
    </div>
  );
}

// ═══ SUB-COMPONENTS ═══

interface KPICardProps {
  icon: React.ReactNode; label: string; value: number;
  formatter?: (v: number) => string;
  suffix?: string; trend?: number; delay: number;
  gradient: string; iconColor: string;
}

function KPICard({ icon, label, value, formatter, suffix, trend, delay, gradient, iconColor }: KPICardProps) {
  return (
    <div
      className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-sg-xl border border-slate-200/80 dark:border-sg-border p-5 shadow-sg-sm hover:shadow-sg-md transition-all hover:-translate-y-1 group relative overflow-hidden sg-stagger"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Ambient glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-linear-to-br ${gradient} blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-700`} />
      {/* Glass shimmer sweep */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${gradient} border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <p className="text-[10px] font-bold text-sg-muted uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <AnimatedCounter
            value={value}
            formatter={formatter || ((v: number) => Math.round(v).toLocaleString('vi-VN'))}
            className="text-[22px] font-black text-sg-heading tracking-tight"
          />
          {suffix && <span className="text-[10px] font-bold text-sg-muted">{suffix}</span>}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-[11px] font-bold ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}% vs tháng trước
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStat({ label, value, icon, color, bgColor, delay, formatter }: {
  label: string; value: number; icon: React.ReactNode; color: string; bgColor: string; delay: number; formatter?: (v: number) => string;
}) {
  return (
    <div className={`p-3.5 rounded-xl border bg-sg-card/50 hover:bg-sg-card/80 hover:-translate-y-0.5 transition-all group sg-stagger ${bgColor.includes('border') ? bgColor : `border-sg-border/50 ${bgColor}`}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">{label}</span>
      </div>
      <AnimatedCounter
        value={value}
        formatter={formatter || ((v: number) => Math.round(v).toLocaleString('vi-VN'))}
        className="text-[18px] font-black text-sg-heading"
      />
    </div>
  );
}

// Inject bar animation keyframes
if (typeof document !== 'undefined') {
  const styleId = 'sg-dashboard-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes bar-grow {
        from { transform: scaleY(0); transform-origin: bottom; }
        to { transform: scaleY(1); transform-origin: bottom; }
      }
      @keyframes bar-width {
        from { width: 0%; }
      }
    `;
    document.head.appendChild(style);
  }
}
