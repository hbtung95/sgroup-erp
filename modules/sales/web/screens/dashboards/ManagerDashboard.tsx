import React, { useMemo } from 'react';
import {
  DollarSign, Target, Users, Clock, PieChart, Trophy, Medal,
  TrendingUp, Award
} from 'lucide-react';
import { useDashboardKPIs, usePipelineSummary, useTopSellers, formatVND } from '../../hooks/useSalesData';
import { SkeletonKPICard, SkeletonChart, CinematicDrawer } from '../../components/shared';
import { KPICard, STAGE_CONFIG } from '../../components/shared/DashboardWidgets';

export function ManagerDashboard() {
  const { data: kpi, loading: kpiLoading } = useDashboardKPIs();
  const { data: pipeline, loading: pipelineLoading } = usePipelineSummary();
  const { data: topSellers, loading: sellersLoading } = useTopSellers(10);

  const totalPipelineValue = useMemo(() => {
    if (!pipeline) return 0;
    return pipeline.reduce((sum, s) => sum + s.value, 0);
  }, [pipeline]);

  const personalKpi = useMemo(() => {
    if (!kpi) return null;
    return {
      revenue: kpi.revenue / 5,
      pipelineValue: kpi.pipelineValue / 5,
      totalLeads: Math.round(kpi.totalLeads / 5),
      pendingApprovals: 2, // fake personal
    };
  }, [kpi]);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between sg-stagger" style={{ animationDelay: '0ms' }}>
        <h2 className="text-[20px] font-black text-sg-heading">Dashboard Quản Lý Đội Nhóm</h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl text-[12px] font-black">
          Hiệu suất Team: Tốt
        </div>
      </div>

      {kpiLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={<Target size={20} />} label="VND Doanh Thu Nhóm"
            value={kpi?.revenue || 0} formatter={formatVND} suffix="VNĐ"
            trend={12.5} delay={0}
            gradient="from-emerald-500/20 to-emerald-600/10" iconColor="text-emerald-500"
          />
          <KPICard
            icon={<PieChart size={20} />} label="Pipeline Team"
            value={kpi?.pipelineValue || 0} formatter={formatVND} suffix="VNĐ"
            trend={8.3} delay={60}
            gradient="from-blue-500/20 to-indigo-600/10" iconColor="text-blue-500"
          />
          <KPICard
            icon={<Users size={20} />} label="Khách Đang Chăm"
            value={kpi?.totalLeads || 0} delay={120}
            trend={-2.1}
            gradient="from-amber-500/20 to-orange-600/10" iconColor="text-amber-500"
          />
          <KPICard
            icon={<Trophy size={20} />} label="Top Sale Tháng"
            value={topSellers?.[0]?.revenue || 0} formatter={formatVND} suffix="VNĐ" delay={180}
            trend={15}
            gradient="from-purple-500/20 to-purple-600/10" iconColor="text-purple-500"
          />
        </div>
      )}

      {/* Của bản thân */}
      {personalKpi && !kpiLoading && (
        <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-5 shadow-sg-md sg-stagger" style={{ animationDelay: '200ms' }}>
          <h3 className="text-[14px] font-black text-sg-heading mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Chỉ Số Cá Nhân Của Bạn
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] font-bold text-sg-muted uppercase">Doanh thu cá nhân</span>
              <p className="text-[16px] font-black text-emerald-500">{formatVND(personalKpi.revenue)}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-sg-muted uppercase">Pipeline cá nhân</span>
              <p className="text-[16px] font-black text-blue-500">{formatVND(personalKpi.pipelineValue)}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-sg-muted uppercase">Khách đang chăm</span>
              <p className="text-[16px] font-black text-amber-500">{personalKpi.totalLeads} KH</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-sg-muted uppercase">Booking chờ</span>
              <p className="text-[16px] font-black text-rose-500">{personalKpi.pendingApprovals} phiếu</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BẢNG XẾP HẠNG TEAM */}
        <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger flex flex-col h-full" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Trophy size={18} className="text-orange-500" />
              </div>
              <h3 className="text-[15px] font-black text-sg-heading">Bảng Xếp Hạng Đội Nhóm</h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 bg-sg-card rounded border border-sg-border">Top Performance</span>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {sellersLoading ? (
               <div className="h-full flex items-center justify-center text-sg-muted animate-pulse">Đang tải dữ liệu...</div>
            ) : (
              (topSellers || []).map((seller, i) => (
                <div key={seller.staffId} className="p-3 rounded-xl border border-sg-border bg-sg-card/30 flex items-center justify-between group overflow-hidden hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    {i === 0 ? <Medal size={20} className="text-yellow-500" /> :
                     i === 1 ? <Medal size={20} className="text-slate-400" /> :
                     i === 2 ? <Medal size={20} className="text-amber-600" /> :
                     <span className="w-5 text-center text-[12px] font-bold text-sg-muted">#{i + 1}</span>}
                    
                    <div>
                      <p className="text-[13px] font-bold text-sg-heading">{seller.staffName}</p>
                      <p className="text-[11px] text-sg-muted uppercase tracking-wider">{seller.deals} Deals chốt</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[13px] block font-black text-emerald-500">{formatVND(seller.revenue)}</span>
                    <span className="text-[10px] block font-semibold text-sg-muted">GMV: {(seller.gmv / 1e9).toFixed(1)} Tỷ</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PIE CHART - PIPELINE */}
        {pipelineLoading ? (
          <SkeletonChart height="h-[280px]" />
        ) : (
          <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger flex flex-col h-full" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <PieChart size={18} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-black text-sg-heading">Phễu Bán Hàng Team</h3>
                <span className="text-[11px] font-bold text-sg-muted">{formatVND(totalPipelineValue)} tổng giá trị</span>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
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
    </div>
  );
}
