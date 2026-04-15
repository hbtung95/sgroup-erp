import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { TrendingUp, Users, Target, Banknote, ShieldAlert, ArrowRight, Activity, Percent, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KpiData {
  totalLeads: number;
  conversionRate: number;
  revenue: number;
  pipelineValue: number;
  pendingApprovals: number;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

function KpiCard({ title, value, subtitle, icon: Icon, color, bg, glow, delay }: { title: string, value: string | React.ReactNode, subtitle?: string, icon: any, color: string, bg: string, glow: string, delay: number }) {
  return (
    <div className={`sg-stagger bg-white/5 dark:bg-black/20 backdrop-blur-3xl rounded-[24px] border border-white/10 dark:border-white/5 p-7 flex flex-col gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_24px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700`} style={{ animationDelay: `${delay}ms` }}>
      
      {/* Dynamic Glow Layers */}
      <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full ${bg} blur-[40px] opacity-30 group-hover:opacity-70 group-hover:-translate-y-4 group-hover:scale-125 transition-all duration-1000 ease-out`} />
      <div className={`absolute -left-10 -bottom-10 w-32 h-32 rounded-full ${glow} blur-[36px] opacity-20 group-hover:opacity-60 group-hover:translate-x-4 transition-all duration-1000 ease-out`} />
      
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

      <div className="flex items-center justify-between z-10 relative">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-black uppercase tracking-[3px] text-sg-subtext group-hover:text-sg-heading transition-colors duration-500">{title}</span>
          {subtitle && <span className="text-[11px] font-semibold text-sg-muted/80">{subtitle}</span>}
        </div>
        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center ${bg} border border-white/10 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700`}>
          <Icon size={24} className={color} strokeWidth={2.5} />
        </div>
      </div>
      <div className="mt-auto z-10 relative flex items-baseline gap-2">
        <span className="text-[32px] sm:text-[36px] font-black text-sg-heading tracking-tighter drop-shadow-sm group-hover:scale-105 origin-left transition-transform duration-500">{value}</span>
      </div>
    </div>
  );
}

function MockChartBar({ height, color, label }: { height: string; color: string; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
      <div className={`w-full max-w-[40px] rounded-t-xl transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] relative overflow-hidden group-hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]`} style={{ height }}>
        <div className={`absolute inset-0 ${color}`} />
        <div className="absolute inset-0 bg-linear-to-b from-white/30 to-transparent" />
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/20 saturate-200`} />
      </div>
      <span className="text-[11px] font-black text-sg-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function DashboardScreen() {
  const user = useAuthStore(s => s.user);
  const [data, setData] = useState<KpiData | null>(null);

  const isDirector = user?.role === 'admin' || user?.role === 'sales_director';
  const isManager = user?.role === 'sales_manager';
  const isEmployee = !isDirector && !isManager;

  useEffect(() => {
    // Simulated API Call
    setTimeout(() => {
      setData({
        totalLeads: isDirector ? 1500 : isManager ? 450 : 35,
        conversionRate: isDirector ? 15.5 : isManager ? 21.4 : 32.0,
        revenue: isDirector ? 45000000000 : isManager ? 15000000000 : 2500000000,
        pipelineValue: isDirector ? 120000000000 : isManager ? 35000000000 : 5000000000,
        pendingApprovals: isDirector ? 12 : isManager ? 3 : 0,
      });
    }, 600);
  }, [user]);

  if (!data) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:px-12 flex flex-col gap-10 custom-scrollbar relative z-10">
      
      {/* Cinematic Ambient Glow based on role */}
      <div className={`fixed top-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none -z-10 ${isDirector ? 'bg-indigo-500/10' : isManager ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`} />
      <div className={`fixed bottom-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none -z-10 ${isDirector ? 'bg-purple-500/10' : isManager ? 'bg-orange-500/10' : 'bg-teal-500/10'}`} />

      {/* Welcome Section */}
      <div className="flex flex-col gap-3 sg-stagger relative" style={{ animationDelay: '0ms' }}>
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border w-fit backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] ${isDirector ? 'bg-indigo-500/20 border-indigo-500/30' : isManager ? 'bg-amber-500/20 border-amber-500/30' : 'bg-emerald-500/20 border-emerald-500/30'}`}>
           <Activity size={14} className={isDirector ? 'text-indigo-500' : isManager ? 'text-amber-500' : 'text-emerald-500'} />
           <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDirector ? 'text-indigo-400' : isManager ? 'text-amber-400' : 'text-emerald-400'}`}>
             {isDirector ? 'Enterprise Insight' : isManager ? 'Team Operation HQ' : 'Sales Dashboard'}
           </span>
        </div>
        <h2 className="text-[40px] sm:text-[48px] font-black text-transparent bg-clip-text bg-linear-to-r from-sg-heading to-sg-heading/60 tracking-tight drop-shadow-xl leading-tight">Tổng Quan Doanh Thu</h2>
        <p className="text-[16px] font-semibold text-sg-subtext max-w-2xl leading-relaxed">
           {isDirector && 'Báo cáo tổng hợp số liệu kinh doanh M&A và hiệu năng luân chuyển dòng tiền toàn hệ thống.'}
           {isManager && 'Cập nhật tình hình làm việc của toàn Đội nhóm và tiến độ đạt target doanh thu rủng rỉnh tháng.'}
           {isEmployee && 'Chỉ số sức khỏe của tệp khách hàng cá nhân (Lead CRM) và số chỉ tiêu đạt được trong quý.'}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10">
        <KpiCard title="Revenues" value={formatCurrency(data.revenue)} subtitle={isEmployee ? 'Doanh số cá nhân' : 'Doanh số chốt hợp đồng'} icon={Banknote} color="text-emerald-500" bg="bg-emerald-500/15" glow="bg-green-500/20" delay={100} />
        {isManager || isDirector ? (
          <KpiCard title="Pipeline Value" value={formatCurrency(data.pipelineValue)} subtitle="Giá trị giỏ hàng đang theo sát" icon={TrendingUp} color="text-indigo-500" bg="bg-indigo-500/15" glow="bg-blue-500/20" delay={200} />
        ) : (
          <KpiCard title="My Pipeline" value={formatCurrency(data.pipelineValue)} subtitle="Đang chăm sóc nóng" icon={Target} color="text-fuchsia-500" bg="bg-fuchsia-500/15" glow="bg-fuchsia-500/20" delay={200} />
        )}
        <KpiCard title="Total Leads" value={data.totalLeads} subtitle={isEmployee ? 'Đang nắm giữ cá nhân' : 'Database khách hàng'} icon={Users} color="text-amber-500" bg="bg-amber-500/15" glow="bg-yellow-500/20" delay={300} />
        <KpiCard title="Win Rate" value={`${data.conversionRate}%`} subtitle="Tỷ lệ chuyển đổi thành công" icon={Percent} color="text-rose-500" bg="bg-rose-500/15" glow="bg-pink-500/20" delay={400} />
      </div>

      {/* Role-Specific Secondary Grids */}
      {isDirector && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-2 sg-stagger bg-white/5 dark:bg-black/30 backdrop-blur-[40px] border border-white/10 dark:border-white/5 rounded-[32px] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden flex flex-col" style={{ animationDelay: '500ms' }}>
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex flex-col gap-1">
                 <h3 className="text-[20px] font-black tracking-tight text-sg-heading flex items-center gap-2">Biểu Đồ Doanh Số M&A Tồn Kho</h3>
                 <span className="text-[13px] font-bold text-sg-muted">Sức khỏe doanh số 6 tháng gần nhất toàn Tập đoàn</span>
              </div>
            </div>
            <div className="flex-1 relative z-10 flex items-end gap-4 h-64 pt-10 border-b border-sg-border w-full">
               <div className="absolute top-0 left-0 w-full flex justify-between text-[11px] font-bold text-sg-muted border-b border-white/5 pb-2">
                 <span>Annual Target: 500B</span>
               </div>
               <MockChartBar height="40%" color="bg-linear-to-t from-indigo-600 to-purple-400" label="T10" />
               <MockChartBar height="60%" color="bg-linear-to-t from-indigo-600 to-purple-400" label="T11" />
               <MockChartBar height="30%" color="bg-linear-to-t from-indigo-600 to-purple-400" label="T12" />
               <MockChartBar height="80%" color="bg-linear-to-t from-rose-600 to-orange-400" label="T01" />
               <MockChartBar height="50%" color="bg-linear-to-t from-indigo-600 to-purple-400" label="T02" />
               <MockChartBar height="95%" color="bg-linear-to-t from-emerald-600 to-teal-400" label="T03" />
            </div>
          </div>
          <div className="sg-stagger bg-linear-to-br from-rose-500 to-orange-500 rounded-[32px] p-8 shadow-[0_16px_40px_rgba(244,63,94,0.3)] relative overflow-hidden text-white flex flex-col" style={{ animationDelay: '600ms' }}>
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[40px] pointer-events-none animate-pulse" />
             <div className="relative z-10 flex items-center gap-3 mb-6">
               <div className="w-12 h-12 rounded-[16px] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner"><ShieldAlert size={24} className="text-white" /></div>
               <h3 className="text-[20px] font-black tracking-tight">Cần Phê Duyệt</h3>
             </div>
             <div className="relative z-10 flex flex-col items-start gap-1 flex-1">
               <span className="text-[72px] font-black leading-none drop-shadow-lg">{data.pendingApprovals}</span>
               <span className="text-[15px] font-bold text-white/80">Phiếu Lock chờ xử lý gấp toàn khu vực</span>
             </div>
             <Link to="/SalesModule/pipeline" className="relative z-10 mt-auto w-full group">
               <div className="w-full h-14 bg-white text-rose-600 hover:text-rose-500 hover:bg-rose-50 rounded-2xl flex items-center justify-center gap-2 text-[15px] font-black shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  Board Pipeline Toàn Quốc <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </div>
             </Link>
          </div>
        </div>
      )}

      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-2 sg-stagger bg-white/5 dark:bg-black/30 backdrop-blur-[40px] border border-white/10 dark:border-white/5 rounded-[32px] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden flex flex-col" style={{ animationDelay: '500ms' }}>
            <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex flex-col gap-1">
                 <h3 className="text-[20px] font-black tracking-tight text-sg-heading flex items-center gap-2">Biểu Đồ Thành Tích Nhóm</h3>
                 <span className="text-[13px] font-bold text-sg-muted">Mức độ hoàn thành KPIs của nhóm trong Quý</span>
              </div>
            </div>
            <div className="flex-1 relative z-10 flex items-end gap-4 h-64 pt-10 border-b border-sg-border w-full">
               <div className="absolute top-0 left-0 w-full flex justify-between text-[11px] font-bold text-sg-muted border-b border-white/5 pb-2">
                 <span>Team Target: 20B</span>
               </div>
               <MockChartBar height="40%" color="bg-linear-to-t from-orange-600 to-amber-400" label="T10" />
               <MockChartBar height="60%" color="bg-linear-to-t from-orange-600 to-amber-400" label="T11" />
               <MockChartBar height="30%" color="bg-linear-to-t from-orange-600 to-amber-400" label="T12" />
               <MockChartBar height="80%" color="bg-linear-to-t from-emerald-600 to-teal-400" label="T01" />
               <MockChartBar height="50%" color="bg-linear-to-t from-orange-600 to-amber-400" label="T02" />
               <MockChartBar height="95%" color="bg-linear-to-t from-rose-600 to-pink-400" label="T03" />
            </div>
          </div>
          <div className="sg-stagger bg-linear-to-br from-amber-500 to-orange-500 rounded-[32px] p-8 shadow-[0_16px_40px_rgba(245,158,11,0.3)] relative overflow-hidden text-white flex flex-col" style={{ animationDelay: '600ms' }}>
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[40px] pointer-events-none animate-pulse" />
             <div className="relative z-10 flex items-center gap-3 mb-6">
               <div className="w-12 h-12 rounded-[16px] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner"><ShieldAlert size={24} className="text-white" /></div>
               <h3 className="text-[20px] font-black tracking-tight">Cần Duyệt Ngay</h3>
             </div>
             <div className="relative z-10 flex flex-col items-start gap-1 flex-1">
               <span className="text-[72px] font-black leading-none drop-shadow-lg">{data.pendingApprovals}</span>
               <span className="text-[15px] font-bold text-white/80">Yêu cầu Lock từ nhân sự trong team</span>
             </div>
             <Link to="/SalesModule/pipeline" className="relative z-10 mt-auto w-full group">
               <div className="w-full h-14 bg-white text-orange-600 hover:text-orange-500 hover:bg-orange-50 rounded-2xl flex items-center justify-center gap-2 text-[15px] font-black shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  Board Phê Duyệt Team <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </div>
             </Link>
          </div>
        </div>
      )}

      {isEmployee && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          <div className="sg-stagger bg-white/5 dark:bg-black/30 backdrop-blur-[40px] border border-white/10 dark:border-white/5 rounded-[32px] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.1)] transition-all duration-700 relative overflow-hidden flex flex-col" style={{ animationDelay: '500ms' }}>
             <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 blur-[50px] pointer-events-none" />
             <div className="flex items-center justify-between mb-8 relative z-10">
               <div className="flex flex-col gap-1">
                  <h3 className="text-[20px] font-black tracking-tight text-sg-heading flex items-center gap-2">Mục Tiêu Cá Nhân</h3>
                  <span className="text-[13px] font-bold text-sg-muted">Quota Tháng 4/2026</span>
               </div>
               <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-black uppercase tracking-widest">+1 DEAL MỚI</span>
             </div>

             <div className="flex flex-col gap-2 mt-auto relative z-10 bg-white/5 dark:bg-black/40 border border-white/5 rounded-2xl p-6 shadow-inner">
                <div className="flex items-end justify-between">
                   <span className="text-[13px] font-black text-sg-muted uppercase tracking-widest">Tiến Độ Doanh Số Cá Nhân</span>
                   <span className="text-[28px] font-black text-sg-heading">50.0%</span>
                </div>
                <div className="h-3 w-full bg-white/10 dark:bg-black/50 border border-white/5 rounded-full overflow-hidden relative mt-1">
                   <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `50%` }} />
                </div>
                <div className="flex items-center justify-between mt-2">
                   <span className="text-[13px] font-bold text-sg-subtext">Đã đạt: 2.50 Tỷ</span>
                   <span className="text-[13px] font-bold text-sg-subtext">Target: 5.00 Tỷ</span>
                </div>
             </div>
          </div>

          <div className="sg-stagger bg-linear-to-br from-emerald-500 to-teal-500 rounded-[32px] p-8 shadow-[0_16px_40px_rgba(16,185,129,0.3)] relative overflow-hidden text-white flex flex-col justify-end" style={{ animationDelay: '600ms' }}>
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 rounded-full blur-[40px] pointer-events-none animate-pulse" />
             
             <div className="relative z-10 flex flex-col gap-4">
                 <div className="w-16 h-16 rounded-[20px] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner mb-2 text-white">
                   <CheckCircle2 size={32} />
                 </div>
                 <h3 className="text-[32px] sm:text-[40px] font-black tracking-tight leading-none drop-shadow-md">Tuyệt Vời!</h3>
                 <p className="text-[16px] font-semibold text-white/90">Bạn đã chốt thành công căn góc A1-05 và hoàn thành 50% chỉ tiêu. Đừng dừng lại nhé!</p>
             </div>
             
             <Link to="/SalesModule/customers" className="relative z-10 mt-6 w-full group">
               <div className="w-full h-14 bg-white text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl flex items-center justify-center gap-2 text-[15px] font-black shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  Đẩy Mạnh Leads <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </div>
             </Link>
          </div>
        </div>
      )}

    </div>
  );
}
