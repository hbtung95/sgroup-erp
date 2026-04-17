import React, { useState, useMemo } from 'react';
import {
  Calculator, Calendar, CheckCircle2, Clock, Filter, AlertCircle, FileText, Download, TrendingUp, Sun, Moon, BatteryWarning
} from 'lucide-react';
import { useToast } from '../components/shared/Toast';

// ═══════════════════════════════════════════════════════════
// TIMESHEET SCREEN — Chấm Công Sales
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'OFF_DAY' | 'FIELD';

interface DailyTimesheet {
  date: string; // YYYY-MM-DD
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  note?: string;
}

const STATUS_MAP: Record<AttendanceStatus, { label: string; color: string; bg: string; icon: any }> = {
  PRESENT:  { label: 'Đúng giờ', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  LATE:     { label: 'Đi muộn', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
  ABSENT:   { label: 'Nghỉ kp', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle },
  HALF_DAY: { label: 'Nửa ngày', color: 'text-violet-500', bg: 'bg-violet-500/10', icon: BatteryWarning },
  OFF_DAY:  { label: 'Nghỉ phép', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: Moon },
  FIELD:    { label: 'Đi thị trường', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Sun },
};

// Generate mock timesheet data for the current month
const generateMockTimesheet = (year: number, month: number): DailyTimesheet[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const data: DailyTimesheet[] = [];
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    const date = dateObj.toISOString().split('T')[0];
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    
    let status: AttendanceStatus = 'PRESENT';
    let checkIn: string | null = '08:25';
    let checkOut: string | null = '17:35';
    let note = '';

    if (isWeekend) {
      status = 'OFF_DAY';
      checkIn = null;
      checkOut = null;
    } else {
      const rand = Math.random();
      if (rand < 0.05) { status = 'ABSENT'; checkIn = null; checkOut = null; note = 'Ốm đột xuất'; }
      else if (rand < 0.15) { status = 'LATE'; checkIn = '08:45'; note = 'Kẹt xe'; }
      else if (rand < 0.20) { status = 'FIELD'; checkIn = null; checkOut = null; note = 'Dẫn khách xem dự án'; }
      else if (rand < 0.25) { status = 'HALF_DAY'; checkOut = '12:00'; note = 'Xin nghỉ chiều'; }
    }

    // Future days (if any)
    if (dateObj > new Date()) {
       checkIn = null;
       checkOut = null;
       status = isWeekend ? 'OFF_DAY' : 'PRESENT'; // Placeholder
    }

    data.push({ date, checkIn, checkOut, status, note });
  }
  return data;
};

export function TimesheetScreen() {
  const [selectedMonth, setSelectedMonth] = useState(4);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [data] = useState<DailyTimesheet[]>(() => generateMockTimesheet(selectedYear, selectedMonth));
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'ALL'>('ALL');
  
  const filtered = useMemo(() => {
    if (filterStatus === 'ALL') return data;
    return data.filter(d => d.status === filterStatus);
  }, [data, filterStatus]);

  const stats = useMemo(() => {
    const s = { present: 0, late: 0, field: 0, absent: 0, totalWorkDays: 0 };
    data.forEach(d => {
      const dateObj = new Date(d.date);
      if (dateObj.getDay() !== 0 && dateObj.getDay() !== 6 && dateObj <= new Date()) {
         s.totalWorkDays++;
         if (d.status === 'PRESENT' || d.status === 'HALF_DAY') s.present++;
         else if (d.status === 'LATE') s.late++;
         else if (d.status === 'FIELD') s.field++;
         else if (d.status === 'ABSENT') s.absent++;
      }
    });
    return s;
  }, [data]);

  const currentDay = new Date().toISOString().split('T')[0];
  const todayRecord = data.find(d => d.date === currentDay);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-slate-200/50 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Calculator size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-sg-heading tracking-tight">Chấm Công</h2>
              <span className="text-[12px] font-bold text-sg-muted flex items-center gap-2 mt-0.5">
                <Calendar size={14} /> Tháng {selectedMonth}/{selectedYear}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-sg-border rounded-xl text-[12px] font-bold text-sg-heading hover:bg-sg-card transition-colors">
              <Filter size={14} /> Tháng {selectedMonth} <span className="opacity-50">▾</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 border border-transparent rounded-xl text-white text-[12px] font-black shadow-lg hover:-translate-y-0.5 transition-all">
              <Download size={14} /> Tải PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 lg:px-8 pt-6 pb-0 shrink-0">
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard icon={<CheckCircle2 size={20} />} label="Đã Đi Làm" value={`${stats.present + stats.late}/${stats.totalWorkDays}`} color="text-emerald-500" gradient="from-emerald-500/15 to-green-500/5" />
          <SummaryCard icon={<Sun size={20} />} label="Thị Trường" value={`${stats.field}`} color="text-blue-500" gradient="from-blue-500/15 to-cyan-500/5" />
          <SummaryCard icon={<Clock size={20} />} label="Đi Muộn" value={`${stats.late}`} color="text-amber-500" gradient="from-amber-500/15 to-orange-500/5" />
          <SummaryCard icon={<AlertCircle size={20} />} label="Nghỉ Không Phép" value={`${stats.absent}`} color="text-rose-500" gradient="from-rose-500/15 to-pink-500/5" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10 p-6 gap-6">
         {/* Left Side: Today widget & Legend */}
         <div className="w-full lg:w-72 flex flex-col gap-6 sg-stagger shrink-0">
            {/* Today Widget */}
            <div className="bg-white/60 dark:bg-sg-card border border-slate-200/60 dark:border-sg-border rounded-[20px] p-5 shadow-sg-sm backdrop-blur-2xl text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-b from-blue-500/10 to-transparent pointer-events-none" />
               <h3 className="text-[12px] font-black text-sg-muted uppercase tracking-widest relative z-10">THỜI GIAN THỰC</h3>
               <div className="my-5 relative z-10">
                  <span className="text-[40px] font-black text-sg-heading tracking-tighter tabular-nums leading-none">
                     {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="text-[13px] font-bold text-sg-muted mt-1">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
               </div>
               
               {todayRecord && todayRecord.status === 'PRESENT' && !todayRecord.checkOut ? (
                  <button className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[14px] font-black shadow-lg shadow-rose-500/20 transition-all hover:-translate-y-0.5 relative z-10">
                     Check-out Ngay
                  </button>
               ) : (
                   <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[14px] font-black shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 relative z-10">
                     Check-in Ngay
                  </button>
               )}
            </div>

             {/* Status Legend */}
            <div className="bg-white/60 dark:bg-sg-card border border-slate-200/60 dark:border-sg-border rounded-[20px] p-5 shadow-sg-sm backdrop-blur-2xl">
              <h3 className="text-[12px] font-black text-sg-muted uppercase tracking-widest mb-4">MÀU TRẠNG THÁI</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    filterStatus === 'ALL' ? 'bg-slate-100 border-slate-300 dark:bg-white/10 dark:border-white/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className={`text-[12px] font-bold ${filterStatus === 'ALL' ? 'text-sg-heading' : 'text-sg-muted'}`}>Tất cả</span>
                  </div>
                </button>

                {(Object.keys(STATUS_MAP) as Array<AttendanceStatus>).map(status => {
                  const conf = STATUS_MAP[status];
                  const isActive = filterStatus === status;
                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isActive ? `bg-white/80 dark:bg-white/10 border-slate-300 dark:border-white/20` : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${conf.bg}`} />
                        <span className={`text-[12px] font-bold ${isActive ? 'text-sg-heading' : 'text-sg-muted'}`}>{conf.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
         </div>

         {/* Right Side: Data Table */}
         <div className="flex-1 bg-white/60 dark:bg-sg-card backdrop-blur-2xl rounded-[20px] border border-slate-200/60 dark:border-sg-border shadow-sg-sm overflow-hidden flex flex-col sg-stagger" style={{ animationDelay: '100ms' }}>
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-200/60 dark:border-sg-border bg-slate-50/80 dark:bg-black/20">
                        <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest rounded-tl-xl">Ngày</th>
                        <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest text-center">Check In</th>
                        <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest text-center">Check Out</th>
                        <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest">Trạng Thái</th>
                        <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest rounded-tr-xl">Ghi Chú</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filtered.map((row, idx) => {
                        const st = STATUS_MAP[row.status];
                        const Icon = st.icon;
                        const dateObj = new Date(row.date);
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                        const dateStr = dateObj.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });

                        return (
                           <tr
                              key={row.date}
                              className={`border-b border-slate-100/80 dark:border-sg-border/30 transition-colors ${
                                 isWeekend ? 'bg-slate-50/50 dark:bg-white/5 opacity-70' : 'hover:bg-slate-50/60 dark:hover:bg-white/5'
                              }`}
                           >
                              <td className="px-5 py-4">
                                 <div className={`text-[13px] font-black ${isWeekend ? 'text-rose-500' : 'text-sg-heading'}`}>{dateStr}</div>
                              </td>
                              <td className="px-5 py-4 text-center text-[13px] font-bold text-sg-heading tabular-nums">{row.checkIn || '—'}</td>
                              <td className="px-5 py-4 text-center text-[13px] font-bold text-sg-heading tabular-nums">{row.checkOut || '—'}</td>
                              <td className="px-5 py-4">
                                 <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${st.bg} ${st.color} text-[11px] font-black uppercase tracking-wider`}>
                                    <Icon size={12} /> {st.label}
                                 </div>
                              </td>
                              <td className="px-5 py-4 text-[12px] font-medium text-sg-muted">
                                 {row.note || '—'}
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color, gradient }: { icon: React.ReactNode; label: string; value: string; color: string; gradient: string }) {
  return (
    <div className={`bg-white/60 dark:bg-sg-card backdrop-blur-2xl rounded-[20px] border border-slate-200/60 dark:border-sg-border p-5 shadow-sg-sm relative overflow-hidden sg-stagger`}>
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} pointer-events-none`} />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-white/80 dark:bg-black/30 border border-sg-border/50 flex items-center justify-center ${color}`}>{icon}</div>
        <div>
          <p className="text-[11px] font-bold text-sg-muted uppercase tracking-wider">{label}</p>
          <p className={`text-[22px] font-black ${color} leading-tight mt-0.5 tabular-nums`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
