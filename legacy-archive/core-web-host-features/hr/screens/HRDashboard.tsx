import React from 'react';
import { Users, Briefcase, Clock, Building, Cake, Zap } from 'lucide-react';
import { useHRDashboard, useDepartments, useDashboardEvents, useDashboardActivities } from '../hooks/useHR';
import { SGStatsCard } from '../../../components/ui/SGStatsCard';
import { SGGlassPanel } from '../../../components/ui/SGGlassPanel';

export function HRDashboard() {
  const { data: dashboard, isLoading } = useHRDashboard();
  const { data: rawDepts } = useDepartments();
  const { data: rawEvents } = useDashboardEvents();
  const { data: rawActivities } = useDashboardActivities();

  const departments = Array.isArray(rawDepts) ? rawDepts : (rawDepts as any)?.data ?? [];
  const allEvents = Array.isArray(rawEvents) ? rawEvents : (rawEvents as any)?.data ?? [];
  const allActivities = Array.isArray(rawActivities) ? rawActivities : (rawActivities as any)?.data ?? [];

  const KPI_CARDS = [
    { id: 'k1', label: 'TỔNG NHÂN SỰ', value: dashboard?.totalEmployees ?? 0, unit: 'người',
      icon: Users, variant: 'purple' as const },
    { id: 'k2', label: 'ĐANG LÀM VIỆC', value: dashboard?.activeEmployees ?? 0, unit: '',
      icon: Briefcase, variant: 'success' as const },
    { id: 'k3', label: 'THỬ VIỆC', value: dashboard?.probationEmployees ?? 0, unit: '',
      icon: Users, variant: 'info' as const },
    { id: 'k4', label: 'ĐƠN CHỜ DUYỆT', value: dashboard?.pendingLeaves ?? 0, unit: '',
      icon: Clock, variant: 'warning' as const },
  ];

  const DEPT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1', '#f43f5e'];
  
  const deptList = (departments || []).map((d: any, i: number) => {
    const totalEmp = dashboard?.totalEmployees || 1;
    const count = d._count?.employees ?? 0;
    return { ...d, count, pct: Math.max(1, Math.round((count / totalEmp) * 100)), color: DEPT_COLORS[i % DEPT_COLORS.length] };
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-sg-red/30 border-t-sg-red rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-sg-subtext">Đang tải dữ liệu tổng quan...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-sg-fade-in pb-32">
      
      {/* Header Area */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-[20px] bg-linear-to-br from-sg-red to-purple-500 flex items-center justify-center shadow-sg-brand shadow-sg-red/30">
          <Briefcase size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-sg-heading tracking-tight mb-1">TỔNG QUAN HR</h2>
          <p className="text-[15px] font-semibold text-sg-muted">Dữ liệu thời gian thực — Hệ thống Nhân sự SGroup</p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {KPI_CARDS.map(k => (
          <SGStatsCard
            key={k.id}
            label={k.label}
            value={k.value}
            unit={k.unit}
            icon={k.icon}
            variant={k.variant}
          />
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Wider) */}
        <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
          
          {/* Department Breakdown */}
          <SGGlassPanel padding="lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-sg-red/20 bg-sg-red/10">
                 <Building size={20} className="text-sg-red" />
              </div>
              <h3 className="text-xl font-black text-sg-heading flex-1">Cơ cấu Nhân sự theo Phòng ban</h3>
              <button className="text-sm font-bold text-sg-red hover:underline decoration-2 underline-offset-4">Xem tất cả</button>
            </div>

            {deptList.length === 0 && (
              <p className="py-8 text-center text-sg-subtext font-medium text-sm">Chưa có phòng ban nào được thiết lập.</p>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Doughnut Chart using SVG stroke-dasharray */}
              <div className="relative w-[280px] h-[280px] shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 drop-shadow-sm">
                  {(() => {
                    let cumulativePercent = 0;
                    return deptList.map((d: any, i: number) => {
                      const radius = 80;
                      const circumference = 2 * Math.PI * radius;
                      const strokeDasharray = `${(d.pct / 100) * circumference} ${circumference}`;
                      const strokeDashoffset = -((cumulativePercent / 100) * circumference);
                      cumulativePercent += d.pct;
                      return (
                        <circle
                          key={d.id}
                          cx="100"
                          cy="100"
                          r={radius}
                          fill="none"
                          stroke={d.color}
                          strokeWidth="24"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-1000 ease-out hover:stroke-[28px] cursor-pointer"
                          style={{
                            filter: `drop-shadow(0 0 4px ${d.color}40)`,
                          }}
                        />
                      );
                    });
                  })()}
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center animate-sg-fade-in pointer-events-none">
                  <span className="text-4xl font-black text-sg-heading tracking-tight">{dashboard?.totalEmployees || 0}</span>
                  <span className="text-xs font-bold text-sg-subtext uppercase tracking-widest mt-1">Tổng NS</span>
                </div>
              </div>

               {/* Legend & Details */}
               <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                 {deptList.map((d: any) => (
                   <div key={d.id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-sg-btn-bg transition-colors border border-transparent hover:border-sg-border group cursor-pointer">
                     <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm transition-transform group-hover:scale-125" style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}60` }} />
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start gap-2">
                         <h4 className="text-[14px] font-extrabold text-sg-heading truncate group-hover:text-sg-red transition-colors">{d.name}</h4>
                         <span className="text-[13px] font-black shrink-0" style={{ color: d.color }}>{d.pct}%</span>
                       </div>
                       <div className="flex justify-between items-center mt-0.5">
                         <span className="text-[12px] font-semibold text-sg-subtext truncate">
                           {d.manager?.fullName ? `QL: ${d.manager.fullName}` : `Mã: ${d.code}`}
                         </span>
                         <span className="text-[12px] font-bold text-sg-heading bg-sg-bg px-2 py-0.5 rounded-md border border-sg-border shadow-sm">
                           {d.count}
                         </span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </SGGlassPanel>

          {/* Activity Timeline */}
          <SGGlassPanel padding="lg">
             <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-purple-500/20 bg-purple-500/10">
                 <Zap size={20} className="text-purple-500" />
              </div>
              <h3 className="text-xl font-black text-sg-heading">Biến động & Hoạt động Nhân sự</h3>
            </div>

            <div className="pl-2">
              {allActivities.length === 0 ? (
                <p className="py-4 text-sg-subtext font-medium text-sm pl-4">Chưa có hoạt động nào được ghi nhận.</p>
              ) : (
                allActivities.map((a: any, i: number) => (
                  <div key={a.id || i} className={`flex gap-5 ${i === allActivities.length - 1 ? '' : 'mb-6'}`}>
                    {/* Timeline Tracker */}
                    <div className="flex flex-col items-center w-3.5 shrink-0">
                      <div 
                        className="w-3.5 h-3.5 rounded-full border-2 border-sg-card z-10 shrink-0 shadow-sm" 
                        style={{ backgroundColor: a.tone || '#3b82f6' }} 
                      />
                      {i < allActivities.length - 1 && (
                        <div className="w-[2px] flex-1 bg-sg-border mt-1 -mb-6" />
                      )}
                    </div>
                    {/* Activity Content Box */}
                    <div className="flex-1 -mt-1 bg-linear-to-r from-sg-btn-bg/80 to-transparent dark:from-white/5 p-4 rounded-2xl border border-sg-border/60 hover:border-sg-border hover:from-sg-btn-bg transition-all shadow-sm">
                       <div className="flex justify-between items-start mb-1.5">
                         <span className="text-[15px] font-extrabold text-sg-heading group-hover:text-sg-red transition-colors">{a.title}</span>
                         <span className="text-[11px] font-bold text-sg-subtext/80 whitespace-nowrap uppercase tracking-wider bg-sg-bg px-2 py-0.5 rounded-md border border-sg-border">{a.time}</span>
                       </div>
                       <p className="text-[13px] font-semibold text-sg-subtext leading-relaxed">{a.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SGGlassPanel>
        </div>

        {/* Right Column (Narrower) */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
           
          {/* Upcoming Events */}
          <SGGlassPanel padding="lg" className="sticky top-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-amber-500/20 bg-amber-500/10">
                 <Cake size={20} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-sg-heading">Sự kiện sắp tới</h3>
            </div>

            <div className="flex flex-col gap-5">
              {allEvents.length === 0 ? (
                <p className="text-sg-subtext font-medium text-sm text-center py-4">Không có sự kiện nào sắp tới.</p>
              ) : (
                allEvents.map((e: any, i: number) => {
                  const isBday = e.type === 'birthday';
                  
                  // Parse date string like "Hôm nay 15/04"
                  const dateParts = (e.date || '').split(' ');
                  const dateStr = dateParts[dateParts.length - 1] || '';
                  const [dayStr, monthStr] = dateStr.includes('/') ? dateStr.split('/') : [dateStr, ''];
                  const relativeDay = dateParts.length > 1 ? dateParts.slice(0, -1).join(' ') : '';

                  return (
                    <div key={i} className="flex gap-4 group">
                      <div className={`w-[48px] h-[56px] rounded-[14px] flex flex-col items-center justify-center border
                        ${isBday ? 'bg-sg-red/10 border-sg-red/10 group-hover:border-sg-red/30' : 'bg-blue-500/10 border-blue-500/10 group-hover:border-blue-500/30'}
                        transition-colors shrink-0
                      `}>
                        <span className={`text-[12px] font-extrabold uppercase ${isBday ? 'text-sg-red' : 'text-blue-500'}`}>
                          {monthStr ? `T${Number(monthStr)}` : ''}
                        </span>
                        <span className={`text-[20px] font-black leading-none mt-0.5 ${isBday ? 'text-sg-red' : 'text-blue-500'}`}>
                          {dayStr || '—'}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <span className="text-[15px] font-extrabold text-sg-heading mb-1 truncate">{e.name}</span>
                        <span className="text-[13px] font-bold text-sg-subtext truncate">
                          {relativeDay && (
                            <>
                              <span className={isBday ? 'text-sg-red' : 'text-blue-500'}>{relativeDay}</span>
                              <span className="mx-1.5">•</span>
                            </>
                          )}
                          {e.desc}
                          <span className="mx-1.5">•</span>
                          {e.role}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <button className="w-full mt-6 py-3 rounded-xl border-2 border-sg-border hover:bg-sg-btn-bg transition-colors text-sm font-extrabold text-sg-heading">
              Gửi lời chúc hàng loạt
            </button>
          </SGGlassPanel>

        </div>

      </div>

    </div>
  );
}

