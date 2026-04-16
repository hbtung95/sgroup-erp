import React, { useState } from 'react';
import {
  FileText, BarChart3, Users, Building2, PieChart,
  TrendingUp, Download, Loader2, Calendar, ArrowUpRight,
} from 'lucide-react';
import {
  useTeamPerformance, useTopSellers, useMonthlyRevenue,
  formatVND, formatPercent,
} from '../hooks/useSalesData';
import { SkeletonChart, SkeletonLeaderboard, AnimatedCounter, EmptyState } from '../components/shared';

// ═══════════════════════════════════════════════════════════
// REPORTS SCREEN — Analytics with charts + stagger animations
// Neo-Glassmorphism v2.2 • sg-stagger
// ═══════════════════════════════════════════════════════════

type TabKey = 'overview' | 'team' | 'staff' | 'project';

export function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const currentYear = new Date().getFullYear();

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Tổng Quan',  icon: <BarChart3 size={14} /> },
    { key: 'team',     label: 'Theo Team',  icon: <Building2 size={14} /> },
    { key: 'staff',    label: 'Theo NV',    icon: <Users size={14} /> },
    { key: 'project',  label: 'Theo DA',    icon: <PieChart size={14} /> },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-slate-100 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4 sg-stagger" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <FileText size={18} className="text-violet-500" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-sg-heading">Báo Cáo & Phân Tích</h2>
              <span className="text-[11px] font-bold text-sg-muted">Năm {currentYear}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[12px] font-black pointer-events-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Đồng bộ từ CRM</span>
            </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-sg-btn-bg border border-sg-border rounded-xl text-[12px] font-bold text-sg-muted hover:text-sg-heading transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Download size={14} className="relative z-10" /> <span className="relative z-10">Xuất Báo Cáo</span>
          </button>
        </div>
      </div>
        <div className="flex items-center gap-2 sg-stagger" style={{ animationDelay: '60ms' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                activeTab === tab.key
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'bg-sg-btn-bg border-sg-border text-sg-muted hover:text-sg-heading hover:border-sg-border'
              }`}
            >{tab.icon} {tab.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {activeTab === 'overview' && <OverviewReport />}
        {activeTab === 'team' && <TeamReport />}
        {activeTab === 'staff' && <StaffReport />}
        {activeTab === 'project' && <ProjectReport />}
      </div>
    </div>
  );
}

function OverviewReport() {
  const { data: monthly, loading } = useMonthlyRevenue();

  if (loading) return <div className="space-y-6"><SkeletonChart /><SkeletonChart /></div>;

  const totalRevenue = (monthly || []).reduce((s, m) => s + m.revenue, 0);
  const totalGMV = (monthly || []).reduce((s, m) => s + m.gmv, 0);
  const totalDeals = (monthly || []).reduce((s, m) => s + m.deals, 0);
  const maxRevenue = Math.max(...(monthly || []).map(m => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Tổng GMV" value={totalGMV} formatter={formatVND} sub="Giá trị giao dịch" color="text-blue-500" gradient="from-blue-500/10 to-indigo-500/5" delay={100} />
        <SummaryCard label="Tổng Doanh Thu" value={totalRevenue} formatter={formatVND} sub="Hoa hồng thực thu" color="text-emerald-500" gradient="from-emerald-500/10 to-teal-500/5" delay={160} />
        <SummaryCard label="Tổng Deals" value={totalDeals} sub="Giao dịch thành công" color="text-amber-500" gradient="from-amber-500/10 to-orange-500/5" delay={220} />
      </div>

      {/* Visual Chart */}
      <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger" style={{ animationDelay: '280ms' }}>
        <h3 className="text-[15px] font-black text-sg-heading mb-6">Biểu Đồ Doanh Thu</h3>
        <div className="flex items-end gap-3 h-[200px] px-2 mb-4">
          {(monthly || []).map((m, i) => {
            const height = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                <span className="text-[8px] font-bold text-sg-muted opacity-0 group-hover:opacity-100 transition-opacity">{formatVND(m.revenue)}</span>
                <div className="w-full bg-linear-to-t from-violet-500/40 to-violet-400/15 group-hover:from-violet-600 group-hover:to-violet-400 rounded-t-lg transition-all shadow-sm"
                  style={{ height: `${Math.max(height, 3)}%`, animation: `bar-grow 800ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both` }} />
                <span className="text-[10px] font-bold text-sg-muted">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger" style={{ animationDelay: '340ms' }}>
        <h3 className="text-[15px] font-black text-sg-heading mb-4">Chi Tiết Theo Tháng</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-sg-border/40">
              <th className="px-4 py-3 text-left text-[10px] font-black text-sg-muted uppercase tracking-widest">Tháng</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-sg-muted uppercase tracking-widest">GMV</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-sg-muted uppercase tracking-widest">Doanh Thu</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-sg-muted uppercase tracking-widest">Deals</th>
              <th className="px-4 py-3 text-right text-[10px] font-black text-sg-muted uppercase tracking-widest">Avg Deal</th>
            </tr>
          </thead>
          <tbody>
            {(monthly || []).map((m, idx) => (
              <tr key={m.month} className="border-b border-slate-50 dark:border-sg-border/20 hover:bg-sg-card/30 transition-colors sg-stagger" style={{ animationDelay: `${400 + idx * 30}ms` }}>
                <td className="px-4 py-3 text-[13px] font-bold text-sg-heading">{m.label}</td>
                <td className="px-4 py-3 text-right text-[13px] font-semibold text-sg-heading">{formatVND(m.gmv)}</td>
                <td className="px-4 py-3 text-right text-[13px] font-bold text-emerald-500">{formatVND(m.revenue)}</td>
                <td className="px-4 py-3 text-right text-[13px] font-semibold text-sg-heading">{m.deals}</td>
                <td className="px-4 py-3 text-right text-[13px] font-semibold text-sg-muted">{m.deals > 0 ? formatVND(m.gmv / m.deals) : '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-emerald-500/20 bg-emerald-500/5">
              <td className="px-4 py-3 text-[13px] font-black text-sg-heading">Tổng cộng</td>
              <td className="px-4 py-3 text-right text-[13px] font-black text-sg-heading">{formatVND(totalGMV)}</td>
              <td className="px-4 py-3 text-right text-[13px] font-black text-emerald-500">{formatVND(totalRevenue)}</td>
              <td className="px-4 py-3 text-right text-[13px] font-black text-sg-heading">{totalDeals}</td>
              <td className="px-4 py-3 text-right text-[13px] font-black text-sg-muted">{totalDeals > 0 ? formatVND(totalGMV / totalDeals) : '—'}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function TeamReport() {
  const { data: teams, loading } = useTeamPerformance();
  if (loading) return <SkeletonChart />;
  if (!teams || teams.length === 0) return <EmptyState icon={<Building2 size={40} className="text-violet-500" />} title="Chưa có dữ liệu Team" description="Dữ liệu sẽ xuất hiện khi có giao dịch." />;

  const maxGMV = Math.max(...teams.map(t => t.gmv), 1);

  return (
    <div className="space-y-6">
      {/* Horizontal bar chart */}
      <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger" style={{ animationDelay: '100ms' }}>
        <h3 className="text-[15px] font-black text-sg-heading mb-5">So Sánh GMV Giữa Các Team</h3>
        <div className="space-y-4">
          {teams.map((t, idx) => (
            <div key={t.teamId} className="sg-stagger" style={{ animationDelay: `${200 + idx * 60}ms` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-bold text-sg-heading">{t.teamName}</span>
                <span className="text-[12px] font-black text-emerald-500">{formatVND(t.gmv)}</span>
              </div>
              <div className="h-3 bg-sg-btn-bg rounded-full overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-linear-to-r from-emerald-400 to-cyan-500 shadow-sm"
                  style={{ width: `${(t.gmv / maxGMV) * 100}%`, animation: `bar-width 1000ms cubic-bezier(0.16,1,0.3,1) ${idx * 100}ms both` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail table */}
      <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger" style={{ animationDelay: '400ms' }}>
        <h3 className="text-[15px] font-black text-sg-heading mb-4">Chi Tiết Hiệu Suất</h3>
        <table className="w-full">
          <thead><tr className="border-b border-slate-100 dark:border-sg-border/40">
            <th className="px-4 py-3 text-left text-[10px] font-black text-sg-muted uppercase">Team</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-sg-muted uppercase">Total</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-sg-muted uppercase">Chốt</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-sg-muted uppercase">GMV</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-sg-muted uppercase">Revenue</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-sg-muted uppercase">Win%</th>
          </tr></thead>
          <tbody>
            {teams.map((t, idx) => (
              <tr key={t.teamId} className="border-b border-slate-50 dark:border-sg-border/20 hover:bg-sg-card/30 transition-colors sg-stagger" style={{ animationDelay: `${500 + idx * 40}ms` }}>
                <td className="px-4 py-3 text-[13px] font-bold text-sg-heading">{t.teamName}</td>
                <td className="px-4 py-3 text-right text-[13px] font-semibold">{t.totalDeals}</td>
                <td className="px-4 py-3 text-right text-[13px] font-bold text-emerald-500">{t.closedDeals}</td>
                <td className="px-4 py-3 text-right text-[13px] font-semibold">{formatVND(t.gmv)}</td>
                <td className="px-4 py-3 text-right text-[13px] font-bold text-emerald-500">{formatVND(t.revenue)}</td>
                <td className="px-4 py-3 text-right text-[13px] font-bold">{t.totalDeals > 0 ? formatPercent((t.closedDeals / t.totalDeals) * 100) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StaffReport() {
  const { data: sellers, loading } = useTopSellers(20);
  if (loading) return <SkeletonLeaderboard rows={8} />;
  if (!sellers || sellers.length === 0) return <EmptyState icon={<Users size={40} className="text-amber-500" />} title="Chưa có dữ liệu" description="Xếp hạng sẽ xuất hiện khi có giao dịch." />;

  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger" style={{ animationDelay: '100ms' }}>
      <h3 className="text-[15px] font-black text-sg-heading mb-5">Xếp Hạng Nhân Viên Sales</h3>
      <div className="space-y-3">
        {sellers.map((s, idx) => (
          <div key={s.staffId} className="flex items-center gap-4 p-4 rounded-xl bg-sg-card/50 border border-sg-border/50 hover:border-emerald-500/20 hover:-translate-y-0.5 transition-all sg-stagger" style={{ animationDelay: `${200 + idx * 40}ms` }}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[14px] font-black text-white shadow-lg ${
              idx === 0 ? 'bg-linear-to-br from-amber-400 to-amber-600 shadow-amber-500/30'
              : idx === 1 ? 'bg-linear-to-br from-slate-300 to-slate-500'
              : idx === 2 ? 'bg-linear-to-br from-orange-500 to-orange-700'
              : 'bg-sg-muted/30'
            }`}>#{idx + 1}</div>
            <div className="flex-1">
              <span className="block text-[14px] font-black text-sg-heading">{s.staffName}</span>
              <span className="block text-[11px] font-medium text-sg-muted">{s.teamName}</span>
            </div>
            <div className="text-right space-y-0.5">
              <span className="block text-[14px] font-black text-emerald-500">{formatVND(s.gmv)}</span>
              <span className="block text-[10px] font-bold text-sg-muted">{s.deals} deals • HH: {formatVND(s.revenue)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectReport() {
  return (
    <EmptyState
      icon={<PieChart size={40} className="text-violet-500" />}
      title="Báo Cáo Theo Dự Án"
      description="Đang phát triển — Cần tích hợp dữ liệu từ module Project."
    />
  );
}

// ═══ Shared Components ═══

function SummaryCard({ label, value, formatter, sub, color, gradient, delay }: {
  label: string; value: number; formatter?: (v: number) => string; sub: string; color: string; gradient: string; delay: number;
}) {
  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[20px] border border-slate-200/80 dark:border-sg-border p-5 shadow-sg-sm hover:shadow-sg-md hover:-translate-y-0.5 transition-all relative overflow-hidden group sg-stagger" style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-linear-to-br ${gradient} blur-xl opacity-40 group-hover:opacity-70 transition-opacity`} />
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      <div className="relative z-10">
        <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">{label}</span>
        <AnimatedCounter value={value} formatter={formatter || ((v: number) => Math.round(v).toLocaleString('vi-VN'))} className={`block text-[24px] font-black mt-1 ${color}`} />
        <span className="text-[11px] font-medium text-sg-muted">{sub}</span>
      </div>
    </div>
  );
}

// Inject animation
if (typeof document !== 'undefined') {
  const styleId = 'sg-report-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes bar-grow { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
      @keyframes bar-width { from { width: 0%; } }
    `;
    document.head.appendChild(style);
  }
}
