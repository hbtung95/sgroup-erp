import React, { useMemo } from 'react';
import { useProjects, useLegalDocs, useInventory } from '../hooks/useProjects';
import { RE_PROJECT_STATUS, RE_LEGAL_PROCEDURE_STATUS, RE_PRODUCT_STATUS } from '../constants';
import { Target, AlertCircle, CheckCircle2, Building2, ArrowRight, MapPin, Box, Scale, TrendingUp, DollarSign, Banknote, Wallet, Zap, Crown, Activity, Layers, ShieldCheck, BarChart3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════ */

function StatCard({ title, value, subtitle, icon: Icon, color, bg, glow, delay }: {
  title: string; value: string | number; subtitle: string | null; icon: any; color: string; bg: string; glow: string; delay: number;
}) {
  return (
    <div className={`sg-stagger bg-white dark:bg-black/20 backdrop-blur-3xl rounded-sg-xl border border-slate-200/80 dark:border-white/5 p-6 flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_24px_50px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-700`} style={{ animationDelay: `${delay}ms` }}>
      
      {/* Dynamic Glow Layers */}
      <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full ${bg} blur-2xl opacity-30 group-hover:opacity-70 group-hover:-translate-y-4 group-hover:scale-125 transition-all duration-1000 ease-out`} />
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

function ModernGridLineChart({ data }: { data: { label: string; value: number; color: string; bgHover: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-36 px-2 pb-2 relative">
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[100%_25%] border-b border-sg-border pointer-events-none" />
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10 h-full justify-end cursor-pointer">
          {/* Tooltip */}
          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-sg-heading text-sg-bg text-[11px] font-black px-3 py-1.5 rounded-lg shadow-xl translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-50 pointer-events-none">
            {d.label}: {d.value} căn
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-sg-heading rotate-45" />
          </div>

          <span className="text-[12px] font-black text-sg-heading opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mb-1">{d.value}</span>
          <div
            className={`w-full max-w-[30px] rounded-t-xl transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]`}
            style={{
              height: `${Math.max((d.value / max) * 100, 5)}%`,
              background: d.color,
            }}
          >
            <div className="absolute inset-0 bg-linear-to-b from-white/30 to-transparent" />
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${d.bgHover} saturate-200 blur-sm`} />
          </div>
          <span className="text-[9px] font-extrabold text-sg-subtext uppercase tracking-wider text-center leading-tight">{d.label.substring(0,5)}</span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════════════════ */

export function ProjectDashboardScreen() {
  const { data: projects } = useProjects();
  const { data: legalDocs } = useLegalDocs();
  const { data: inventory } = useInventory();

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'SELLING').length;
    const upcoming = projects.filter(p => p.status === 'UPCOMING').length;
    const completed = projects.filter(p => p.status === 'HANDOVER' || p.status === 'CLOSED').length;
    const totalUnits = projects.reduce((s, p) => s + (p.totalUnits || 0), 0);
    const totalSold = projects.reduce((s, p) => s + (p.soldUnits || 0), 0);
    const absorptionRate = totalUnits > 0 ? Math.round((totalSold / totalUnits) * 100) : 0;

    const totalGrossVolume = projects.reduce((s, p) => s + (p.soldUnits || 0) * (p.avgPrice || 0), 0);
    const totalExpectedCommission = projects.reduce((s, p) => s + ((p.soldUnits || 0) * (p.avgPrice || 0) * ((p.feeRate || 0) / 100)), 0);

    return { total, active, upcoming, completed, totalUnits, totalSold, absorptionRate, totalGrossVolume, totalExpectedCommission };
  }, [projects]);

  const inventoryStats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    inventory.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    return statusCounts;
  }, [inventory]);

  const recentLegalDocs = useMemo(() => legalDocs.slice(0, 4), [legalDocs]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:px-12 flex flex-col gap-12 custom-scrollbar relative z-10 transition-all">
      
      {/* Cinematic Ambient Glow */}
      <div className="fixed top-20 right-20 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-20 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* ═══════ Executive Command Header ═══════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 sg-stagger relative group" style={{ animationDelay: '0ms' }}>
        
        {/* Title Block */}
        <div className="flex flex-col gap-4 relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <Crown size={12} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">Hệ thống Điều Hành Giám Đốc</span>
            </div>
            <div className="inline-flex items-center text-emerald-500 font-extrabold text-[10px] bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              LIVE
            </div>
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-[42px] font-black text-sg-heading tracking-tighter leading-[1.1] mb-2 drop-shadow-sm">
              Quản Trị Chiến Lược<br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-cyan-500 to-emerald-500 drop-shadow-lg">Dự Án Bất Động Sản</span>
            </h2>
            <div className="flex items-center gap-4">
               <p className="text-[14px] font-bold text-sg-subtext max-w-lg leading-relaxed opacity-80">
                 Phân tích đa chiều dữ liệu rổ hàng, tình trạng pháp lý và chỉ số hấp thụ thị trường theo thời gian thực.
               </p>
            </div>
          </div>
        </div>

        {/* Quick Summary Cards - Integrated into header */}
        <div className="flex items-center gap-4 bg-white/40 dark:bg-black/20 backdrop-blur-3xl p-4 rounded-[28px] border border-white/20 dark:border-white/5 shadow-xl">
           <div className="flex flex-col px-4 border-r border-sg-border/50">
              <span className="text-[10px] font-black text-sg-muted uppercase tracking-widest mb-1">Dự án</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-[22px] font-black text-sg-heading">{projects.length}</span>
                 <span className="text-[12px] font-extrabold text-sg-subtext">Total</span>
              </div>
           </div>
           <div className="flex flex-col px-4 border-r border-sg-border/50">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Đang bán</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-[22px] font-black text-emerald-500">{stats.active}</span>
                 <span className="text-[12px] font-extrabold text-sg-subtext">Active</span>
              </div>
           </div>
           <div className="flex flex-col px-4">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Sản phẩm</span>
              <div className="flex items-baseline gap-1">
                 <span className="text-[22px] font-black text-blue-500">{inventory.length.toLocaleString()}</span>
                 <span className="text-[12px] font-extrabold text-sg-subtext">SKU</span>
              </div>
           </div>
        </div>
      </div>

      {/* ═══════ 6 Thẻ KPI Chiến Lược ═══════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 relative z-10">
        <StatCard title="Tổng Dự Án" value={stats.total} subtitle="Toàn bộ tuyến dự án" icon={Building2} color="text-blue-500" bg="bg-blue-500/15" glow="bg-indigo-500/20" delay={100} />
        <StatCard title="Đang Mở Bán" value={stats.active} subtitle="Rổ hàng đang giao dịch" icon={Target} color="text-emerald-500" bg="bg-emerald-500/15" glow="bg-emerald-400/20" delay={200} />
        <StatCard title="Hấp Thụ" value={`${stats.absorptionRate}%`} subtitle={`Đã ráp: ${stats.totalSold.toLocaleString('vi-VN')} căn`} icon={TrendingUp} color="text-amber-500" bg="bg-amber-500/15" glow="bg-orange-500/20" delay={300} />
        <StatCard title="Hoàn Thiện" value={stats.completed} subtitle="Đã bàn giao / đã đóng" icon={CheckCircle2} color="text-purple-500" bg="bg-purple-500/15" glow="bg-fuchsia-500/20" delay={400} />
        <StatCard title="Doanh Số" value={`${(stats.totalGrossVolume / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} Tỷ`} subtitle="Tổng giá trị giao dịch" icon={Banknote} color="text-rose-500" bg="bg-rose-500/15" glow="bg-pink-500/20" delay={500} />
        <StatCard title="Hoa Hồng" value={`${(stats.totalExpectedCommission / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tỷ`} subtitle="Dự kiến phí môi giới" icon={Wallet} color="text-cyan-500" bg="bg-cyan-500/15" glow="bg-blue-500/20" delay={600} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* ═══════ Cột Trái: Biểu Đồ Rổ Hàng + Dự Án ═══════ */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* Biểu Đồ Phân Bổ Rổ Hàng */}
          <div className="sg-stagger bg-white dark:bg-black/40 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 rounded-sg-2xl p-8 shadow-md hover:shadow-[0_24px_60px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 bg-linear-to-tl from-cyan-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex flex-col gap-1">
                 <h3 className="text-[18px] font-black tracking-tight text-sg-heading flex items-center gap-2">
                   Phân Bổ Rổ Hàng <Zap size={18} className="text-amber-500" />
                 </h3>
                 <span className="text-[12px] font-bold text-sg-muted">Dữ liệu thời gian thực từ hệ thống quản lý kho</span>
              </div>
              <Link to="/ProjectModule/inventory" className="text-[12px] font-black text-white hover:text-white flex items-center gap-1.5 transition-all bg-sg-heading hover:bg-cyan-500 px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">
                XEM CHI TIẾT <ArrowRight size={14} />
              </Link>
            </div>
            <ModernGridLineChart data={
              Object.entries(RE_PRODUCT_STATUS).map(([key, cfg]) => ({
                label: cfg.label,
                value: inventoryStats[key] || 0,
                color: key === 'AVAILABLE' ? 'linear-gradient(180deg, #34d399 0%, #059669 100%)' :
                       key === 'LOCKED' ? 'linear-gradient(180deg, #fb923c 0%, #ea580c 100%)' :
                       key === 'DEPOSIT' ? 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)' :
                       key === 'SOLD' ? 'linear-gradient(180deg, #fb7185 0%, #e11d48 100%)' :
                       key === 'COMPLETED' ? 'linear-gradient(180deg, #94a3b8 0%, #475569 100%)' :
                       key === 'RESERVED' ? 'linear-gradient(180deg, #facc15 0%, #ca8a04 100%)' :
                       'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)',
                bgHover: key === 'AVAILABLE' ? 'bg-emerald-500' : key === 'LOCKED' ? 'bg-orange-500' : key === 'DEPOSIT' ? 'bg-blue-500' : key === 'SOLD' ? 'bg-rose-500' : 'bg-slate-500'
              }))
            } />

            {/* Legend Pills */}
            <div className="flex flex-wrap gap-2 mt-6 relative z-10">
              {Object.entries(RE_PRODUCT_STATUS).map(([key, cfg]) => {
                const count = inventoryStats[key] || 0;
                if (count === 0) return null;
                return (
                  <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
                    {cfg.label}: {count}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danh Sách Dự Án Đang Phân Phối */}
          <div className="flex flex-col gap-6 sg-stagger" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between pl-2">
              <h3 className="text-[18px] font-black tracking-tight text-sg-heading flex items-center gap-2">
                <Layers size={18} className="text-blue-500" /> Dự Án Đang Phân Phối
              </h3>
              <Link to="/ProjectModule/list" className="text-[13px] font-black text-cyan-600 hover:text-cyan-500 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full hover:bg-cyan-500/10">
                XEM TẤT CẢ <ArrowRight size={14} />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-black/30 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 rounded-sg-2xl overflow-hidden shadow-md relative p-2">
              <div className="absolute inset-0 bg-linear-to-bl from-blue-500/5 to-transparent pointer-events-none" />
              {projects.length === 0 ? (
                <div className="p-12 text-center relative z-10">
                  <div className="w-16 h-16 rounded-full bg-sg-btn-bg flex items-center justify-center mx-auto mb-4 border border-sg-border">
                    <Building2 size={24} className="text-sg-muted" />
                  </div>
                  <p className="text-[15px] font-black text-sg-heading">Chưa có dự án nào.</p>
                  <Link to="/ProjectModule/list" className="text-[13px] font-black text-cyan-500 mt-2 inline-block hover:-translate-y-0.5 transition-transform">+ Khởi tạo dự án mới</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-1 relative z-10">
                  {projects.slice(0, 5).map((proj, idx) => {
                    const statusCfg = RE_PROJECT_STATUS[proj.status] || RE_PROJECT_STATUS.UPCOMING;
                    const projectSold = proj.soldUnits || 0;
                    const projectTotal = proj.totalUnits || 1;
                    const projectPct = Math.round((projectSold / projectTotal) * 100);
                    return (
                      <Link to={`/ProjectModule/board?id=${proj.id}`} key={proj.id} className="flex items-center gap-5 p-4 sm:p-5 rounded-sg-xl hover:bg-white/50 dark:hover:bg-white/5 transition-all group relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
                        
                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 border ${statusCfg.bg.replace('/10', '/20')} ${statusCfg.color} shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700`}>
                          <Building2 size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[16px] font-extrabold text-sg-heading truncate group-hover:text-cyan-600 transition-colors">{proj.name}</h4>
                          <span className="text-[12px] font-semibold text-sg-muted mt-0.5 truncate block tracking-wide">
                            {proj.code} • Phụ trách: {proj.managerName || 'Chưa gán'} • Đã bán: {projectSold}/{projectTotal} ({projectPct}%)
                          </span>
                          {/* Mini progress bar */}
                          <div className="mt-2 h-1.5 bg-slate-200/50 dark:bg-white/5 rounded-full overflow-hidden w-full max-w-[200px]">
                            <div className={`h-full rounded-full transition-all duration-1000 ${projectPct > 80 ? 'bg-emerald-500' : projectPct > 40 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${projectPct}%` }} />
                          </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 pl-4">
                          <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-xs ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                            {statusCfg.label}
                          </span>
                          <span className="text-[12px] font-black text-sg-muted flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <MapPin size={12} className="text-amber-500" /> {proj.location}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════ Cột Phải: Pháp Lý & Tóm Tắt ═══════ */}
        <div className="flex flex-col gap-8 sg-stagger" style={{ animationDelay: '500ms' }}>
          
          {/* Tóm Tắt Nhanh */}
          <div className="bg-white dark:bg-black/30 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 rounded-sg-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none" />
            <h3 className="text-[14px] font-black text-sg-heading uppercase tracking-[2px] mb-5 flex items-center gap-2 relative z-10">
              <Sparkles size={16} className="text-amber-500" /> Tổng Quan Nhanh
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-[13px] font-bold text-sg-subtext">Tổng quỹ căn</span>
                <span className="text-[15px] font-black text-sg-heading">{stats.totalUnits.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-[13px] font-bold text-sg-subtext">Đã bán thành công</span>
                <span className="text-[15px] font-black text-emerald-500">{stats.totalSold.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-[13px] font-bold text-sg-subtext">Tồn kho khả dụng</span>
                <span className="text-[15px] font-black text-blue-500">{(stats.totalUnits - stats.totalSold).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                <span className="text-[13px] font-bold text-sg-subtext">Sắp mở bán</span>
                <span className="text-[15px] font-black text-purple-500">{stats.upcoming}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] font-bold text-sg-subtext">Rổ hàng quản lý</span>
                <span className="text-[15px] font-black text-sg-heading">{inventory.length} sản phẩm</span>
              </div>
            </div>
          </div>

          {/* Dòng Chảy Pháp Lý */}
          <div className="flex items-center justify-between pl-2">
            <h3 className="text-[18px] font-black tracking-tight text-sg-heading flex items-center gap-2">
              <Scale size={18} className="text-rose-500" /> Pháp Lý & Chính Sách
            </h3>
            <Link to="/ProjectModule/legal" className="text-[13px] font-black text-rose-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2 rounded-full">
              KANBAN <ArrowRight size={14} />
            </Link>
          </div>

          {recentLegalDocs.length === 0 ? (
            <div className="bg-white dark:bg-black/30 backdrop-blur-2xl border border-slate-200/80 dark:border-white/5 rounded-sg-2xl p-12 text-center shadow-md">
              <div className="w-16 h-16 rounded-full bg-sg-btn-bg flex items-center justify-center mx-auto mb-4 border border-sg-border">
                <Scale size={24} className="text-sg-muted" />
              </div>
              <p className="text-[15px] font-black text-sg-heading">Chưa có hồ sơ pháp lý.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recentLegalDocs.map(doc => {
                const dStatus = RE_LEGAL_PROCEDURE_STATUS[doc.status];
                const accentColor = doc.status === 'APPROVED' ? 'bg-emerald-500' : doc.status === 'SUBMITTED' ? 'bg-blue-500' : doc.status === 'ISSUE_FIXING' ? 'bg-orange-500' : 'bg-slate-400';
                return (
                  <div key={doc.id} className={`bg-slate-50 dark:bg-black/40 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 rounded-sg-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-lg hover:-translate-y-1.5 hover:bg-slate-100 dark:hover:bg-black/60 transition-all cursor-pointer relative overflow-hidden group`}>
                    
                    {/* Glowing Blob */}
                    <div className={`absolute top-0 right-0 w-32 h-32 ${dStatus?.bg?.replace('/10', '/30') || 'bg-slate-500/20'} rounded-full blur-2xl pointer-events-none group-hover:scale-[1.5] transition-transform duration-700 ease-out`} />
                    
                    {/* Accent strip */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${accentColor} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    
                    <div className="flex items-start justify-between gap-4 relative z-10">
                      <h5 className="text-[14px] font-black text-sg-heading line-clamp-2 leading-snug group-hover:text-cyan-600 transition-colors">{doc.title}</h5>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap border shadow-sm ${dStatus?.bg} ${dStatus?.color} ${dStatus?.border || 'border-sg-border'} shrink-0`}>
                        {dStatus?.label}
                      </span>
                    </div>
                    <p className="text-[12px] font-semibold text-sg-subtext line-clamp-2 relative z-10 opacity-70">{doc.description}</p>
                    
                    <div className="flex items-center justify-between mt-1 relative z-10 pt-3 border-t border-slate-200/50 dark:border-white/5">
                      <span className="text-[12px] font-black text-sg-heading flex items-center gap-2">
                        <Scale size={13} className="text-rose-500" /> 
                        {doc.assigneeName || 'Đội Pháp Lý'}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-linear-to-br from-slate-700 to-slate-900 border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-cyan-400 transition-all">
                        <span className="text-[10px] font-black text-white">{doc.assigneeName ? doc.assigneeName.slice(0, 1).toUpperCase() : '?'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
