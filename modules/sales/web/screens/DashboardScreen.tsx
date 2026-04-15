import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@sgroup/platform';
import {
  TrendingUp, Users, Target, Banknote, ShieldAlert, ArrowRight,
  Activity, Percent, ArrowUpRight, CheckCircle2, Crown, Zap,
  Sparkles, Layers, BarChart3, Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════ */

function StatCard({ title, value, subtitle, icon: Icon, color, bg, glow, delay }: {
  title: string; value: string | number | React.ReactNode; subtitle?: string; icon: any; color: string; bg: string; glow: string; delay: number;
}) {
  return (
    <div className={`sg-stagger bg-white dark:bg-black/20 backdrop-blur-3xl rounded-[24px] border border-slate-200/80 dark:border-white/5 p-6 flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_24px_50px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-700`} style={{ animationDelay: `${delay}ms` }}>
      {/* Dynamic Glow Layers */}
      <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full ${bg} blur-[40px] opacity-30 group-hover:opacity-70 group-hover:-translate-y-4 group-hover:scale-125 transition-all duration-1000 ease-out`} />
      <div className={`absolute -left-10 -bottom-10 w-32 h-32 rounded-full ${glow} blur-[36px] opacity-20 group-hover:opacity-60 group-hover:translate-x-4 transition-all duration-1000 ease-out`} />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

      <div className="flex items-center justify-between z-10 relative">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-black uppercase tracking-[2.5px] text-sg-subtext group-hover:text-sg-heading transition-colors duration-500">{title}</span>
          {subtitle && <span className="text-[10px] font-semibold text-sg-muted/70">{subtitle}</span>}
        </div>
        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center ${bg} border border-white/10 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700`}>
          <Icon size={22} className={color} strokeWidth={2.5} />
        </div>
      </div>
      <div className="mt-auto z-10 relative flex items-baseline gap-2">
        <span className="text-[34px] font-black text-sg-heading tracking-tighter drop-shadow-sm group-hover:scale-105 origin-left transition-transform duration-500">{value}</span>
      </div>
      {/* Bottom accent bar */}
      <div className={`absolute bottom-0 left-0 h-[3px] ${bg.replace('/15', '/60').replace('/20', '/60')} w-1/3 group-hover:w-full transition-all duration-[1.2s] ease-out rounded-r`} />
    </div>
  );
}

function MockChartBar({ height, color, label, value }: { height: string; color: string; label: string; value?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end cursor-pointer">
      {/* Tooltip */}
      {value && (
        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-sg-heading text-sg-bg text-[11px] font-black px-3 py-1.5 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-50 pointer-events-none">
          {value}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-sg-heading rotate-45" />
        </div>
      )}
      <span className="text-[12px] font-black text-sg-heading opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mb-1">{value}</span>
      <div
        className="w-full max-w-[32px] rounded-t-xl transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]"
        style={{ height, background: color }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-white/30 to-transparent" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/20 saturate-200" />
      </div>
      <span className="text-[9px] font-extrabold text-sg-subtext uppercase tracking-wider text-center leading-tight">{label}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TYPES & HELPERS
   ════════════════════════════════════════════════════════ */

interface KpiData {
  totalLeads: number;
  conversionRate: number;
  revenue: number;
  pipelineValue: number;
  pendingApprovals: number;
  closedDeals: number;
}

const formatCurrency = (val: number) => {
  if (val >= 1000000000) return `${(val / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tỷ`;
  if (val >= 1000000) return `${(val / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} Triệu`;
  return new Intl.NumberFormat('vi-VN').format(val);
};

/* ════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════════════════ */

export function DashboardScreen() {
  const user = useAuthStore(s => s.user);
  const [data, setData] = useState<KpiData | null>(null);

  const isDirector = user?.role === 'admin' || user?.role === 'sales_director';
  const isManager = user?.role === 'sales_manager';
  const isEmployee = !isDirector && !isManager;

  useEffect(() => {
    setTimeout(() => {
      setData({
        totalLeads: isDirector ? 1500 : isManager ? 450 : 35,
        conversionRate: isDirector ? 15.5 : isManager ? 21.4 : 32.0,
        revenue: isDirector ? 45000000000 : isManager ? 15000000000 : 2500000000,
        pipelineValue: isDirector ? 120000000000 : isManager ? 35000000000 : 5000000000,
        pendingApprovals: isDirector ? 12 : isManager ? 3 : 0,
        closedDeals: isDirector ? 128 : isManager ? 42 : 8,
      });
    }, 400);
  }, [user]);

  if (!data) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <span className="text-sm font-semibold text-sg-subtext">Đang tải dữ liệu tổng quan...</span>
    </div>
  );

  const monthlyData = [
    { label: 'T10', value: '3.2 Tỷ', height: '40%', color: 'linear-gradient(180deg, #10b981 0%, #059669 100%)' },
    { label: 'T11', value: '5.1 Tỷ', height: '60%', color: 'linear-gradient(180deg, #10b981 0%, #059669 100%)' },
    { label: 'T12', value: '2.8 Tỷ', height: '30%', color: 'linear-gradient(180deg, #10b981 0%, #059669 100%)' },
    { label: 'T01', value: '7.5 Tỷ', height: '80%', color: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' },
    { label: 'T02', value: '4.6 Tỷ', height: '50%', color: 'linear-gradient(180deg, #10b981 0%, #059669 100%)' },
    { label: 'T03', value: '8.9 Tỷ', height: '95%', color: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:px-12 flex flex-col gap-12 custom-scrollbar relative z-10 transition-all">

      {/* Cinematic Ambient Glow */}
      <div className="fixed top-20 right-20 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-20 w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* ═══════ Executive Command Header ═══════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 sg-stagger relative" style={{ animationDelay: '0ms' }}>
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-amber-500/10 border border-emerald-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <Crown size={12} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">
                {isDirector ? 'Hệ thống Điều Hành Giám Đốc' : isManager ? 'Trung Tâm Quản Lý Team' : 'Bảng Điều Khiển Cá Nhân'}
              </span>
            </div>
            <div className="inline-flex items-center text-emerald-500 font-extrabold text-[10px] bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              LIVE
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="text-[42px] font-black text-sg-heading tracking-tighter leading-[1.1] mb-2 drop-shadow-sm">
              Tổng Quan Doanh Số<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 drop-shadow-lg">Kinh Doanh & CRM</span>
            </h2>
            <p className="text-[14px] font-bold text-sg-subtext max-w-lg leading-relaxed opacity-80">
              {isDirector && 'Báo cáo tổng hợp số liệu kinh doanh M&A và hiệu năng toàn hệ thống theo thời gian thực.'}
              {isManager && 'Cập nhật tình hình đội nhóm, tiến độ KPI và pipeline giao dịch đang xử lý.'}
              {isEmployee && 'Chỉ số sức khỏe tệp khách hàng và tiến độ đạt chỉ tiêu doanh số cá nhân.'}
            </p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="flex items-center gap-4 bg-white/40 dark:bg-black/20 backdrop-blur-3xl p-4 rounded-[28px] border border-white/20 dark:border-white/5 shadow-xl">
          <div className="flex flex-col px-4 border-r border-sg-border/50">
            <span className="text-[10px] font-black text-sg-muted uppercase tracking-widest mb-1">Doanh Số</span>
            <span className="text-[22px] font-black text-emerald-500">{formatCurrency(data.revenue)}</span>
          </div>
          <div className="flex flex-col px-4 border-r border-sg-border/50">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Win Rate</span>
            <span className="text-[22px] font-black text-amber-500">{data.conversionRate}%</span>
          </div>
          <div className="flex flex-col px-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Deals</span>
            <span className="text-[22px] font-black text-blue-500">{data.closedDeals}</span>
          </div>
        </div>
      </div>

      {/* ═══════ 6 KPI StatCards ═══════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 relative z-10">
        <StatCard title="Doanh Số" value={formatCurrency(data.revenue)} subtitle="Chốt hợp đồng" icon={Banknote} color="text-emerald-500" bg="bg-emerald-500/15" glow="bg-teal-500/20" delay={100} />
        <StatCard title="Pipeline" value={formatCurrency(data.pipelineValue)} subtitle="Giỏ hàng đang theo sát" icon={TrendingUp} color="text-indigo-500" bg="bg-indigo-500/15" glow="bg-blue-500/20" delay={200} />
        <StatCard title="Total Leads" value={data.totalLeads} subtitle="Database khách hàng" icon={Users} color="text-amber-500" bg="bg-amber-500/15" glow="bg-yellow-500/20" delay={300} />
        <StatCard title="Win Rate" value={`${data.conversionRate}%`} subtitle="Tỷ lệ chuyển đổi" icon={Percent} color="text-rose-500" bg="bg-rose-500/15" glow="bg-pink-500/20" delay={400} />
        <StatCard title="Deals Chốt" value={data.closedDeals} subtitle="Hợp đồng thành công" icon={CheckCircle2} color="text-cyan-500" bg="bg-cyan-500/15" glow="bg-cyan-400/20" delay={500} />
        <StatCard title="Chờ Duyệt" value={data.pendingApprovals} subtitle="Phiếu Lock cần xử lý" icon={ShieldAlert} color="text-purple-500" bg="bg-purple-500/15" glow="bg-fuchsia-500/20" delay={600} />
      </div>

      {/* ═══════ Main Content Grid ═══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

        {/* Cột Trái: Biểu Đồ Doanh Số */}
        <div className="lg:col-span-2 flex flex-col gap-10">

          {/* Revenue Chart */}
          <div className="sg-stagger bg-white dark:bg-black/40 backdrop-blur-[40px] border border-slate-200/80 dark:border-white/5 rounded-[32px] p-8 shadow-md hover:shadow-[0_24px_60px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 bg-linear-to-tl from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] font-black tracking-tight text-sg-heading flex items-center gap-2">
                  Biểu Đồ Doanh Số <Zap size={18} className="text-amber-500" />
                </h3>
                <span className="text-[12px] font-bold text-sg-muted">Sức khỏe doanh số 6 tháng gần nhất</span>
              </div>
              <div className="text-[12px] font-black text-white hover:text-white flex items-center gap-1.5 transition-all bg-sg-heading hover:bg-emerald-500 px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 cursor-pointer">
                XEM CHI TIẾT <ArrowRight size={14} />
              </div>
            </div>
            <div className="flex items-end gap-3 h-40 px-2 pb-2 relative z-10">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_25%] border-b border-sg-border pointer-events-none" />
              {monthlyData.map((d, i) => (
                <MockChartBar key={i} height={d.height} color={d.color} label={d.label} value={d.value} />
              ))}
            </div>
          </div>

          {/* Recent Transactions (giống Project Dashboard pattern) */}
          <div className="flex flex-col gap-6 sg-stagger" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between pl-2">
              <h3 className="text-[18px] font-black tracking-tight text-sg-heading flex items-center gap-2">
                <Layers size={18} className="text-emerald-500" /> Giao Dịch Gần Đây
              </h3>
            </div>
            <div className="bg-white dark:bg-black/30 backdrop-blur-[32px] border border-slate-200/80 dark:border-white/5 rounded-[32px] overflow-hidden shadow-md relative p-2">
              <div className="absolute inset-0 bg-linear-to-bl from-emerald-500/5 to-transparent pointer-events-none" />
              <div className="flex flex-col gap-1 relative z-10">
                {[
                  { code: 'A1-05', customer: 'Nguyễn Văn A', project: 'GL-Project', price: '2.50 Tỷ', status: 'Chờ Lock', statusColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                  { code: 'B2-10', customer: 'Trần Thị B', project: 'GL-Project', price: '3.10 Tỷ', status: 'Đã Lock', statusColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                  { code: 'C3-15', customer: 'Lê Văn C', project: 'Rivera Park', price: '1.80 Tỷ', status: 'Đã Cọc', statusColor: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20' },
                  { code: 'D4-20', customer: 'Phạm Thị D', project: 'Aqua City', price: '4.20 Tỷ', status: 'Đã Chốt', statusColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                ].map((tx, idx) => (
                  <div key={idx} className="flex items-center gap-5 p-4 sm:p-5 rounded-[24px] hover:bg-white/50 dark:hover:bg-white/5 transition-all group relative overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />
                    <div className="w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 text-emerald-500 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700">
                      <span className="text-[16px] font-black">{tx.code}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[16px] font-extrabold text-sg-heading truncate group-hover:text-emerald-600 transition-colors">{tx.customer}</h4>
                      <span className="text-[12px] font-semibold text-sg-muted mt-0.5 truncate block tracking-wide">
                        {tx.project} • {tx.price} VNĐ
                      </span>
                    </div>
                    <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-xs shrink-0 ${tx.statusColor}`}>
                      {tx.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cột Phải: Tóm Tắt Nhanh */}
        <div className="flex flex-col gap-8 sg-stagger" style={{ animationDelay: '500ms' }}>

          {/* Quick Summary */}
          <div className="bg-white dark:bg-black/30 backdrop-blur-[32px] border border-slate-200/80 dark:border-white/5 rounded-[32px] p-6 shadow-md relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />
            <h3 className="text-[14px] font-black text-sg-heading uppercase tracking-[2px] mb-5 flex items-center gap-2 relative z-10">
              <Sparkles size={16} className="text-amber-500" /> Tổng Quan Nhanh
            </h3>
            <div className="space-y-4 relative z-10">
              {[
                { label: 'Doanh số tháng này', value: formatCurrency(data.revenue), color: 'text-emerald-500' },
                { label: 'Giá trị Pipeline', value: formatCurrency(data.pipelineValue), color: 'text-indigo-500' },
                { label: 'Khách hàng HOT', value: `${Math.round(data.totalLeads * 0.2)}`, color: 'text-rose-500' },
                { label: 'Tỷ lệ chuyển đổi', value: `${data.conversionRate}%`, color: 'text-amber-500' },
                { label: 'Deals đang xử lý', value: `${data.pendingApprovals + data.closedDeals}`, color: 'text-sg-heading' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-b-0">
                  <span className="text-[13px] font-bold text-sg-subtext">{item.label}</span>
                  <span className={`text-[15px] font-black ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          {isDirector && (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[32px] p-8 shadow-[0_16px_40px_rgba(16,185,129,0.3)] relative overflow-hidden text-white flex flex-col">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[40px] pointer-events-none animate-pulse" />
              <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                  <ShieldAlert size={24} className="text-white" />
                </div>
                <h3 className="text-[20px] font-black tracking-tight">Cần Phê Duyệt</h3>
              </div>
              <div className="relative z-10 flex flex-col items-start gap-1 flex-1">
                <span className="text-[72px] font-black leading-none drop-shadow-lg">{data.pendingApprovals}</span>
                <span className="text-[15px] font-bold text-white/80">Phiếu Lock chờ xử lý gấp</span>
              </div>
            </div>
          )}

          {isManager && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-[32px] p-8 shadow-[0_16px_40px_rgba(245,158,11,0.3)] relative overflow-hidden text-white flex flex-col">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[40px] pointer-events-none animate-pulse" />
              <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-[16px] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                  <Target size={24} className="text-white" />
                </div>
                <h3 className="text-[20px] font-black tracking-tight">Target Team</h3>
              </div>
              <div className="relative z-10 flex flex-col items-start gap-1 flex-1">
                <span className="text-[48px] font-black leading-none drop-shadow-lg">65%</span>
                <span className="text-[15px] font-bold text-white/80">Tiến độ hoàn thành KPI Quý</span>
              </div>
            </div>
          )}

          {isEmployee && (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-[32px] p-8 shadow-[0_16px_40px_rgba(16,185,129,0.3)] relative overflow-hidden text-white flex flex-col justify-end">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[40px] pointer-events-none animate-pulse" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner mb-2">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="text-[32px] font-black tracking-tight leading-none drop-shadow-md">Tuyệt Vời!</h3>
                <p className="text-[16px] font-semibold text-white/90">Bạn đã hoàn thành 50% chỉ tiêu. Tiếp tục phát huy!</p>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-white/60 rounded-full" style={{ width: '50%' }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[13px] font-bold text-white/80">Đã đạt: 2.50 Tỷ</span>
                  <span className="text-[13px] font-bold text-white/80">Target: 5.00 Tỷ</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
