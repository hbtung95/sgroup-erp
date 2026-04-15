import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Users, XCircle, Search, LayoutGrid, List, CalendarDays, ArrowRight, X } from 'lucide-react';
import { useAttendance, useCreateAttendance } from '../hooks/useHR'; // We'll assume checkOut is handled below by updateAttendance
import type { HRRole } from '../HRSidebar';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  ON_TIME: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-600 dark:text-green-400', label: 'Đúng giờ' },
  LATE: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', label: 'Đi trễ' },
  ABSENT: { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-600 dark:text-red-400', label: 'Vắng mặt' },
};

const SHIFTS = {
  'S1': { label: 'Sáng', bg: 'bg-blue-50 dark:bg-blue-500/20', color: 'text-blue-500', border: 'border-blue-200 dark:border-blue-500/40' },
  'S2': { label: 'Chiều', bg: 'bg-amber-50 dark:bg-amber-500/20', color: 'text-amber-500', border: 'border-amber-200 dark:border-amber-500/40' },
  'S3': { label: 'Tối', bg: 'bg-purple-50 dark:bg-purple-500/20', color: 'text-purple-500', border: 'border-purple-200 dark:border-purple-500/40' }
};

const WEEK_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const MOCK_SCHEDULE = [
  { name: 'Nguyễn Văn A', role: 'Nhân viên kinh doanh', shifts: [ { day: 0, type: 'S1' }, { day: 1, type: 'S1' }, { day: 2, type: 'S2' }, { day: 3, type: 'S1' }, { day: 4, type: 'S3' } ] },
  { name: 'Trần Thị B', role: 'Trưởng phòng Marketing', shifts: [ { day: 0, type: 'S2' }, { day: 1, type: 'S2' }, { day: 3, type: 'S1' }, { day: 4, type: 'S1' }, { day: 5, type: 'S1' } ] },
  { name: 'Lê C', role: 'IT Support', shifts: [ { day: 1, type: 'S3' }, { day: 2, type: 'S3' }, { day: 4, type: 'S2' }, { day: 5, type: 'S2' }, { day: 6, type: 'S1' } ] },
  { name: 'Phạm D', role: 'Kế toán', shifts: [ { day: 0, type: 'S1' }, { day: 1, type: 'S1' }, { day: 2, type: 'S1' }, { day: 3, type: 'S1' }, { day: 4, type: 'S1' } ] },
  { name: 'Đoàn E', role: 'Dự án', shifts: [ { day: 0, type: 'S3' }, { day: 2, type: 'S2' }, { day: 3, type: 'S2' }, { day: 5, type: 'S1' }, { day: 6, type: 'S2' } ] },
];

export function TimekeepingScreen({ userRole }: { userRole?: HRRole }) {
  const [mainTab, setMainTab] = useState<'attendance' | 'schedule'>('attendance');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const currentDate = today.toLocaleDateString('vi-VN');
  const todayStr = today.toISOString().split('T')[0];

  const { data: rawAttendance, isLoading, refetch } = useAttendance({ date: todayStr });
  const safeAttendance = Array.isArray(rawAttendance) ? rawAttendance : (rawAttendance as any)?.data ?? [];

  const { mutate: checkInMutate, isPending: isCheckingIn } = useCreateAttendance();
  // using any since we didn't add useCheckOut explicitly yet, we can mock it here
  const handleCheckIn = () => {
    checkInMutate({ employee_id: 1, remarks: 'Check-in from Web' }, {
      onSuccess: () => refetch()
    });
  };

  const attendanceData = safeAttendance.map((a: any) => {
    const fmtTime = (d: string | null) => d ? new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';
    const statusMap: Record<string, string> = { PRESENT: 'ON_TIME', LATE: 'LATE', ABSENT: 'ABSENT', HALF_DAY: 'LATE', DAY_OFF: 'ABSENT' };
    return {
      id: a.id,
      code: a.employee?.code || '',
      name: a.employee?.fullName || '',
      dept: a.employee?.department?.name || '',
      shift: 'Hành chính',
      checkIn: fmtTime(a.check_in),
      checkOut: fmtTime(a.check_out),
      status: statusMap[a.status] || a.status,
    };
  }).filter((a: any) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.code.toLowerCase().includes(searchQuery.toLowerCase()));

  const presentCount = attendanceData.filter((a: any) => a.status === 'ON_TIME').length;
  const lateCount = attendanceData.filter((a: any) => a.status === 'LATE').length;
  const absentCount = attendanceData.filter((a: any) => a.status === 'ABSENT').length;

  return (
    <div className="p-8 pb-32 animate-sg-fade-in flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Clock size={28} className="text-blue-500" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-sg-heading">Chấm công & Điểm danh</h2>
            <p className="text-sm font-medium text-sg-subtext mt-1">Hôm nay: {currentDate}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {isCheckingIn ? 'ĐANG XỬ LÝ...' : 'QUẸT THẺ (CHECK-IN)'}
          </button>
          <button className="px-6 py-3 bg-sg-btn-bg hover:bg-sg-border border border-sg-border text-sg-heading font-bold rounded-xl transition-colors shadow-sm">
            XUẤT BẢNG CÔNG
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-row bg-sg-card border border-sg-border p-1.5 rounded-2xl self-start shadow-sm">
        <button 
          onClick={() => setMainTab('attendance')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${mainTab === 'attendance' ? 'bg-sg-btn-bg text-sg-heading shadow-sm' : 'text-sg-subtext hover:text-sg-heading'}`}
        >
          Điểm danh hôm nay
        </button>
        <button 
          onClick={() => setMainTab('schedule')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${mainTab === 'schedule' ? 'bg-sg-btn-bg text-sg-heading shadow-sm' : 'text-sg-subtext hover:text-sg-heading'}`}
        >
          Xếp ca (Gantt Chart)
        </button>
      </div>

      {mainTab === 'attendance' ? (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'TỔNG ĐIỂM DANH', val: attendanceData.length, icon: Users, bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-500' },
              { label: 'ĐÚNG GIỜ', val: presentCount, icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-500/10', color: 'text-emerald-500' },
              { label: 'ĐI TRỄ', val: lateCount, icon: AlertCircle, bg: 'bg-amber-50 dark:bg-amber-500/10', color: 'text-amber-500' },
              { label: 'VẮNG MẶT', val: absentCount, icon: XCircle, bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-500' },
            ].map((s, i) => (
              <div key={i} className="bg-sg-card border border-sg-border p-6 rounded-sg-xl shadow-sm flex flex-col hover:shadow-md transition-shadow">
                <div className="flex flex-row items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                    <s.icon size={20} className={s.color} />
                  </div>
                  <span className="text-xs font-black text-sg-subtext tracking-wider">{s.label}</span>
                </div>
                <span className="text-4xl font-black text-sg-heading">{s.val}</span>
              </div>
            ))}
          </div>

          {/* Contribution Graph (Heatmap) */}
          <div className="bg-sg-card border border-sg-border rounded-[28px] p-6 shadow-sm">
            <div className="flex flex-row items-center justify-between mb-6">
              <div className="flex flex-row items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/15">
                  <CalendarDays size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-sg-heading">Biểu đồ Chuyên cần (90 ngày)</h3>
                  <p className="text-sm font-medium text-sg-subtext">Tỷ lệ đi làm đúng giờ toàn công ty</p>
                </div>
              </div>
              <button className="flex flex-row items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors group">
                Phân tích chi tiết <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex flex-col gap-1.5 min-w-max">
                {new Array(5).fill(0).map((_, rIdx) => (
                  <div key={rIdx} className="flex flex-row gap-1.5">
                    {new Array(18).fill(0).map((_, cIdx) => {
                      const seed = (rIdx * 100) + cIdx + 1;
                      const x = Math.sin(seed) * 10000;
                      const rnd = x - Math.floor(x);
                      
                      const status = rnd > 0.95 ? 'absent' : rnd > 0.85 ? 'late' : 'present';
                      const bg = status === 'present' ? 'bg-emerald-500 dark:bg-emerald-400' :
                                 status === 'late' ? 'bg-amber-400 dark:bg-amber-500' : 'bg-red-500 dark:bg-red-400';
                      
                      const x2 = Math.sin(seed * 2) * 10000;
                      const opacityRnd = x2 - Math.floor(x2);
                      const opacity = status === 'present' ? 0.3 + opacityRnd * 0.7 : 1;
                      
                      return (
                        <div 
                          key={cIdx} 
                          className={`w-4 h-4 rounded-[4px] ${bg} hover:ring-2 hover:ring-sg-border transition-all cursor-crosshair`} 
                          style={{ opacity }}
                          title={`${status === 'present' ? 'Đúng giờ' : status === 'late' ? 'Đi trễ' : 'Vắng mặt'} - Ngày ${cIdx + 1}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-row items-center justify-end gap-3 mt-2">
              <span className="text-xs font-bold text-sg-subtext">Thấp</span>
              <div className="flex flex-row gap-1">
                 {[0.2, 0.4, 0.6, 0.8, 1].map((op, i) => (
                   <div key={i} className="w-3 h-3 rounded-[3px] bg-emerald-500" style={{ opacity: op }} />
                 ))}
              </div>
              <span className="text-xs font-bold text-sg-subtext">Cao</span>
              <div className="w-px h-3 bg-sg-border mx-2" />
              <div className="w-3 h-3 rounded-[3px] bg-amber-400" />
              <span className="text-xs font-bold text-sg-subtext">Trễ</span>
              <div className="w-px h-3 bg-sg-border mx-1" />
              <div className="w-3 h-3 rounded-[3px] bg-red-500" />
              <span className="text-xs font-bold text-sg-subtext">Vắng</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex flex-row bg-sg-card border border-sg-border p-1 rounded-xl shadow-sm">
              <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-sg-btn-bg text-sg-heading shadow-sm' : 'text-sg-subtext hover:text-sg-heading'}`}>
                <List size={20} />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-sg-btn-bg text-sg-heading shadow-sm' : 'text-sg-subtext hover:text-sg-heading'}`}>
                <LayoutGrid size={20} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-row items-center gap-3 bg-sg-card border border-sg-border rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-sg-red">
              <Search size={20} className="text-sg-muted" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm nhân viên..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-sg-heading placeholder:text-sg-subtext"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1 rounded-md hover:bg-sg-btn-bg text-sg-subtext">
                  <X size={16} />
                </button>
              )}
            </div>

            <button className="bg-sg-card border border-sg-border px-5 py-3 rounded-xl shadow-sm text-sm font-bold text-sg-heading hover:bg-sg-btn-bg transition-colors whitespace-nowrap">
              Phòng ban: Tất cả
            </button>
          </div>

          {/* Grid / Table View */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-sm font-bold text-sg-subtext">Đang tải dữ liệu chấm công...</span>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-sg-card border border-sg-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-sg-btn-bg/50 border-b border-sg-border">
                      <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider">Nhân viên</th>
                      <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider">Ca làm việc</th>
                      <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sg-border">
                    {attendanceData.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-sg-subtext">
                          Không có kết quả nào.
                        </td>
                      </tr>
                    )}
                    {attendanceData.map((item: any) => {
                      const s = STATUS_CONFIG[item.status];
                      return (
                        <tr key={item.id} className="hover:bg-sg-btn-bg/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-sg-heading">{item.name}</span>
                              <span className="text-xs font-medium text-sg-subtext mt-0.5">{item.code} • {item.dept}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-sg-heading">{item.shift}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-black ${item.status === 'LATE' ? 'text-amber-500' : 'text-sg-heading'}`}>{item.checkIn}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-sg-heading">{item.checkOut}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase ${s?.bg} ${s?.text}`}>
                              {s?.label || item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attendanceData.length === 0 && (
                <div className="col-span-full py-12 text-center text-sm font-medium text-sg-subtext">
                  Không có kết quả nào.
                </div>
              )}
              {attendanceData.map((item: any) => {
                const s = STATUS_CONFIG[item.status];
                return (
                  <div key={item.id} className="bg-sg-card border border-sg-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex flex-row justify-between items-start mb-5">
                      <div className="flex flex-row items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center font-black text-xl text-blue-500 border border-blue-100 dark:border-blue-500/20">
                          {item.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-black text-sg-heading">{item.name}</span>
                          <span className="text-xs font-medium text-sg-subtext mt-1">{item.code} • {item.dept}</span>
                        </div>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase ${s?.bg} ${s?.text}`}>
                        {s?.label || item.status}
                      </span>
                    </div>

                    <div className="flex flex-row gap-3">
                      <div className="flex-1 bg-sg-btn-bg border border-sg-border rounded-xl p-3 flex flex-col items-center">
                        <span className="text-[11px] font-extrabold text-sg-subtext uppercase tracking-wider mb-1">Check In</span>
                        <span className={`text-lg font-black ${item.status === 'LATE' ? 'text-amber-500' : 'text-sg-heading'}`}>{item.checkIn}</span>
                      </div>
                      <div className="flex-1 bg-sg-btn-bg border border-sg-border rounded-xl p-3 flex flex-col items-center">
                        <span className="text-[11px] font-extrabold text-sg-subtext uppercase tracking-wider mb-1">Check Out</span>
                        <span className="text-lg font-black text-sg-heading">{item.checkOut}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-6 w-full animate-sg-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-sg-heading">Điều phối ca làm việc</h3>
              <p className="text-sm font-medium text-sg-subtext mt-1">Tuần này (Dựa trên hệ thống gợi ý AI)</p>
            </div>
            <div className="flex flex-row flex-wrap gap-4">
              {Object.entries(SHIFTS).map(([k, v]) => (
                <div key={k} className="flex flex-row items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-sm border ${v.bg} ${v.border}`} />
                  <span className="text-sm font-bold text-sg-subtext">Ca {v.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sg-card border border-sg-border rounded-sg-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-sg-btn-bg/30 border-b border-sg-border">
                  <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider w-[240px] border-r border-sg-border">Nhân viên</th>
                  {WEEK_DAYS.map((day, dIdx) => (
                    <th key={dIdx} className={`px-4 py-4 text-xs font-black uppercase text-center border-r border-sg-border last:border-r-0 ${dIdx > 4 ? 'text-red-500' : 'text-sg-heading'}`}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sg-border">
                {MOCK_SCHEDULE.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-sg-btn-bg/10 transition-colors h-[72px]">
                    <td className="px-6 py-3 border-r border-sg-border">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-sg-heading">{emp.name}</span>
                        <span className="text-xs font-medium text-sg-subtext mt-1">{emp.role}</span>
                      </div>
                    </td>
                    {WEEK_DAYS.map((_, dIdx) => {
                      const shift = emp.shifts.find(s => s.day === dIdx);
                      return (
                        <td key={dIdx} className="p-2 border-r border-sg-border last:border-r-0 text-center relative pointer-events-none">
                          {shift && (
                            <div className={`w-full h-full min-h-[44px] rounded-lg border flex items-center justify-center transition-all ${(SHIFTS as any)[shift.type].bg} ${(SHIFTS as any)[shift.type].border}`}>
                              <span className={`text-xs font-black ${(SHIFTS as any)[shift.type].color}`}>
                                {(SHIFTS as any)[shift.type].label}
                              </span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
