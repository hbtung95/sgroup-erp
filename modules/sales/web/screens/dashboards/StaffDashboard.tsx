import React, { useState, useEffect } from 'react';
import { DollarSign, Target, Users, TrendingUp, Activity, Plus, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { useDashboardKPIs, formatVND, formatPercent } from '../../hooks/useSalesData';
import { salesOpsApi, SalesActivity } from '../../api/salesApi';
import { SkeletonKPICard, EmptyState } from '../../components/shared';
import { KPICard } from '../../components/shared/DashboardWidgets';
import { ActivityEntryModal } from '../../components/ActivityEntryModal';

export function StaffDashboard() {
  const { data: kpi, loading: kpiLoading } = useDashboardKPIs();
  const [activities, setActivities] = useState<SalesActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const res = await salesOpsApi.listActivities();
      // Lấy 3 hoạt động gần nhất của mình
      setActivities(res.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      {/* ══════ HEADER ══════ */}
      <div className="flex items-center justify-between sg-stagger" style={{ animationDelay: '0ms' }}>
        <h2 className="text-[20px] font-black text-sg-heading">Dashboard Cá Nhân</h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[12px] font-black pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Online</span>
        </div>
      </div>

      {/* ══════ KPI STAT CARDS ══════ */}
      {kpiLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon={<DollarSign size={20} />} label="Hoa Hồng Tạm Tính"
            value={(kpi?.revenue || 0) * 0.05} formatter={formatVND} suffix="VNĐ"
            trend={15.2} delay={0}
            gradient="from-emerald-500/20 to-emerald-600/10" iconColor="text-emerald-500"
          />
          <KPICard
            icon={<Target size={20} />} label="Pipeline Cá Nhân"
            value={kpi?.pipelineValue || 0} formatter={formatVND} suffix="VNĐ"
            trend={4.1} delay={60}
            gradient="from-blue-500/20 to-indigo-600/10" iconColor="text-blue-500"
          />
          <KPICard
            icon={<TrendingUp size={20} />} label="Conversion Rate"
            value={kpi?.conversionRate || 0} formatter={(v: number) => formatPercent(v)}
            trend={2.5} delay={120}
            gradient="from-violet-500/20 to-purple-600/10" iconColor="text-violet-500"
          />
          <KPICard
            icon={<Activity size={20} />} label="Điểm Cống Hiến"
            value={kpi?.totalActivityPoints || 0} delay={180}
            trend={0}
            gradient="from-amber-500/20 to-orange-600/10" iconColor="text-amber-500"
          />
        </div>
      )}

      {/* ══════ TWO COLUMNS: ACTIVITIES & RECENT DEALS ══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Nhật ký hôm nay */}
        <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger flex flex-col h-full" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <FileText size={18} className="text-violet-500" />
              </div>
              <h3 className="text-[15px] font-black text-sg-heading">Nhật Ký Hôm Nay</h3>
            </div>
            <button 
              onClick={() => setIsActivityModalOpen(true)}
              className="w-8 h-8 rounded-full bg-sg-btn-bg border border-sg-border flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-10 opacity-50"><Activity className="animate-spin text-sg-muted" /></div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 opacity-80">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Activity size={20} className="text-sg-muted" />
                </div>
                <p className="text-[12px] font-bold text-sg-heading">Chưa Ghi Nhận Hoạt Động</p>
                <p className="text-[10px] text-sg-muted mt-1">Ghi nhận để tích điểm Point ngay</p>
                <button onClick={() => setIsActivityModalOpen(true)} className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg text-[11px] font-black shadow-lg shadow-emerald-500/30">
                  Nhập Hoạt Động
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((act, i) => (
                  <div key={i} className="p-4 rounded-xl border border-sg-border/50 bg-sg-card/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-sg-heading">Ghi nhận +{act.points} Point</p>
                      <p className="text-[11px] text-sg-muted flex gap-2 mt-1">
                        <span>{act.callsCount} Call</span>
                        <span>{act.newLeads} Lead</span>
                        <span>{act.meetingsMade} Meet</span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-sg-muted border border-sg-border px-2 py-1 rounded-md">
                      {act.activityDate ? new Date(act.activityDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Today'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bảng Vàng Team */}
        <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border p-6 shadow-sg-md sg-stagger flex flex-col h-full" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Users size={18} className="text-amber-500" />
            </div>
            <h3 className="text-[15px] font-black text-sg-heading">Xếp Hạng Team Của Tôi</h3>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center pb-6">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 shadow-xl shadow-purple-500/30 flex items-center justify-center border-4 border-white dark:border-black z-10 relative">
                <Briefcase size={32} className="text-white" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center border-4 border-white dark:border-black text-white font-black shadow-lg shadow-amber-500/40">
                #3
              </div>
            </div>
            <h4 className="text-[18px] font-black text-sg-heading mb-1">Đang bám sát!</h4>
            <p className="text-[12px] font-bold text-sg-muted text-center max-w-[200px]">
              Bạn đang đứng vị trí Top 3 trong phòng. Cố gắng ghi sổ thêm 1 Giữ Chỗ để lên Top 2!
            </p>
            <button className="mt-6 w-full py-3 rounded-xl bg-sg-btn-bg text-[12px] font-black hover:bg-slate-200 dark:hover:bg-sg-card transition-colors">
              Xem chi tiết bảng xếp hạng
            </button>
          </div>
        </div>
      </div>

      <ActivityEntryModal 
        isOpen={isActivityModalOpen} 
        onClose={() => {
          setIsActivityModalOpen(false);
          fetchActivities();
        }} 
      />
    </div>
  );
}
