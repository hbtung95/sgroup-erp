import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Search, LayoutGrid, List, X, Check } from 'lucide-react';
import { useLeaves, useLeaveBalance, useApproveLeave, useRejectLeave } from '../hooks/useHR';
import type { HRRole } from '../HRSidebar';

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'Nghỉ phép năm',
  SICK: 'Nghỉ ốm',
  UNPAID: 'Nghỉ không lương',
  MATERNITY: 'Nghỉ thai sản',
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', label: 'ĐÃ DUYỆT' },
  PENDING: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', label: 'CHỜ DUYỆT' },
  REJECTED: { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-600 dark:text-red-400', label: 'TỪ CHỐI' },
};

const WORKFLOW_STEPS = [
  { id: 1, label: 'Trưởng Nhóm', status: 'approved', role: 'Leader' },
  { id: 2, label: 'Trưởng Phòng', status: 'pending', role: 'Manager' },
  { id: 3, label: 'Giám Đốc HR', status: 'waiting', role: 'HR Director' },
];

export function LeavesScreen({ userRole }: { userRole?: HRRole }) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { mutate: approveMutate, isPending: isApproving } = useApproveLeave();
  const { mutate: rejectMutate, isPending: isRejecting } = useRejectLeave();

  const handleApprove = () => {
    if (!selectedLeave) return;
    approveMutate({ id: selectedLeave.id, approverId: '1' }, {
      onSuccess: () => {
        setSelectedLeave(null);
        refetch();
      }
    });
  };

  const handleReject = () => {
    if (!selectedLeave) return;
    rejectMutate({ id: selectedLeave.id, approverId: '1', note: 'Rejected by UI' }, {
      onSuccess: () => {
        setSelectedLeave(null);
        refetch();
      }
    });
  };

  const { data: rawLeaves, isLoading, refetch } = useLeaves();
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');
  const safeLeaves = Array.isArray(rawLeaves) ? rawLeaves : (rawLeaves as any)?.data ?? [];

  const currentYear = new Date().getFullYear();
  const { data: rawLeaveBalance, isLoading: loadingBalance } = useLeaveBalance(selectedLeave?.employeeId || '', currentYear);
  const leaveBalance = (rawLeaveBalance as any)?.data ?? rawLeaveBalance;

  const leavesData = safeLeaves.map((l: any) => ({
    id: l.id,
    employeeId: l.employeeId,
    code: l.employee?.employeeCode || '',
    name: l.employee?.fullName || '',
    dept: l.employee?.department?.name || '',
    type: LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType,
    from: fmtDate(l.startDate),
    to: fmtDate(l.endDate),
    days: l.totalDays,
    status: l.status,
  })).filter((l: any) => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.code.toLowerCase().includes(searchQuery.toLowerCase()));

  const pendingCount = leavesData.filter((l: any) => l.status === 'PENDING').length;
  const approvedCount = leavesData.filter((l: any) => l.status === 'APPROVED').length;
  const rejectedCount = leavesData.filter((l: any) => l.status === 'REJECTED').length;

  return (
    <div className="p-8 pb-32 animate-sg-fade-in flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      {/* Modal overlays are created using absolute/fixed elements in Tailwind */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-sg-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedLeave(null)} />
          <div className="relative w-full max-w-lg bg-sg-card border border-sg-border rounded-sg-2xl p-8 shadow-2xl animate-sg-slide-up">
            
            {/* Modal Header */}
            <div className="flex flex-row justify-between items-start mb-6">
              <div className="flex flex-row gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                  <FileText size={28} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-black text-sg-heading tracking-tight">Duyệt Đơn Nghỉ</h2>
                  <p className="text-sm font-bold text-sg-subtext mt-1">{selectedLeave.name} • {selectedLeave.code}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLeave(null)} className="p-2 rounded-xl bg-sg-btn-bg text-sg-subtext hover:text-sg-heading transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Info Card */}
            <div className="p-5 rounded-2xl border border-sg-border bg-sg-btn-bg/30 mb-8 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-sg-subtext">Loại đơn</span>
                <span className="text-[15px] font-black text-sg-heading">{selectedLeave.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] font-bold text-sg-subtext">Thời gian</span>
                <span className="text-[15px] font-black text-sg-heading">{selectedLeave.from} - {selectedLeave.to}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-sg-border">
                <span className="text-[13px] font-bold text-sg-subtext">Tổng cộng</span>
                <span className="text-[15px] font-black text-amber-500">{selectedLeave.days} ngày</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[13px] font-black text-sg-heading">Quỹ phép năm còn lại ({currentYear})</span>
                {loadingBalance ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className={`text-[15px] font-black ${(leaveBalance?.remaining || 0) >= selectedLeave.days ? 'text-emerald-500' : 'text-red-500'}`}>
                    {leaveBalance?.remaining ?? '?'} ngày
                  </span>
                )}
              </div>
            </div>

            {/* Workflow Stepper */}
            <h3 className="text-[17px] font-black text-sg-heading mb-4">Tiến trình Phê duyệt</h3>
            <div className="pl-2 mb-8 flex flex-col">
              {WORKFLOW_STEPS.map((step, idx) => {
                const isLast = idx === WORKFLOW_STEPS.length - 1;
                const isApproved = step.status === 'approved';
                const isPending = step.status === 'pending';
                const iconColor = isApproved ? 'text-emerald-500' : isPending ? 'text-amber-500' : 'text-slate-400';
                const bgCircle = isApproved ? 'bg-emerald-500/15' : isPending ? 'bg-amber-500/15' : 'bg-slate-500/10';
                
                return (
                  <div key={step.id} className="flex flex-row gap-4">
                    {/* Timeline Graphic */}
                    <div className="flex flex-col items-center w-6">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${bgCircle}`}>
                        {isApproved ? <Check size={14} className={iconColor} /> : <Clock size={14} className={iconColor} />}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 my-1 ${isApproved ? 'bg-emerald-500' : 'bg-sg-border'}`} />
                      )}
                    </div>
                    {/* Details */}
                    <div className={`flex-1 flex flex-col ${!isLast ? 'pb-5' : ''}`}>
                      <span className={`text-[15px] font-black ${isApproved || isPending ? 'text-sg-heading' : 'text-sg-subtext'}`}>
                        {step.label}
                      </span>
                      <span className="text-xs font-bold text-sg-subtext mt-1">
                        {step.role} • {isApproved ? 'Đã duyệt' : isPending ? 'Đang chờ duyệt' : 'Chưa đến lượt'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            {selectedLeave.status === 'PENDING' ? (
              <div className="flex flex-row gap-3">
                <button 
                  onClick={() => setSelectedLeave(null)}
                  className="flex-1 py-3.5 rounded-xl bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-colors font-black text-[13px] text-sg-subtext"
                >
                  ĐÓNG
                </button>
                <button 
                  onClick={handleReject}
                  disabled={isRejecting || isApproving}
                  className="flex-1 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors font-black text-[13px] disabled:opacity-50"
                >
                  {isRejecting ? 'ĐANG XỬ LÝ...' : 'TỪ CHỐI'}
                </button>
                <button 
                  onClick={handleApprove}
                  disabled={isApproving || isRejecting}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all font-black text-[13px] disabled:opacity-50"
                >
                  {isApproving ? 'ĐANG XỬ LÝ...' : 'PHÊ DUYỆT'}
                </button>
              </div>
            ) : (
              <div className="flex flex-row gap-3">
                <button 
                  onClick={() => setSelectedLeave(null)}
                  className="flex-1 py-3.5 rounded-xl bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-colors font-black text-[13px] text-sg-subtext"
                >
                  ĐÓNG TÀI LIỆU
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <FileText size={28} className="text-amber-500" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-sg-heading">Quản lý Đơn từ</h2>
            <p className="text-sm font-medium text-sg-subtext mt-1">Duyệt đơn xin phép, thai sản, công tác</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'CHỜ DUYỆT', val: pendingCount, icon: Clock, bg: 'bg-amber-50 dark:bg-amber-500/10', color: 'text-amber-500' },
          { label: 'ĐÃ DUYỆT', val: approvedCount, icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-500/10', color: 'text-emerald-500' },
          { label: 'TỪ CHỐI', val: rejectedCount, icon: XCircle, bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-500' },
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
      </div>

      {/* View Logic */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-sm font-bold text-sg-subtext">Đang tải đơn từ...</span>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-sg-card border border-sg-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-sg-btn-bg/50 border-b border-sg-border">
                  <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider">Nhân viên</th>
                  <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider">Loại đơn</th>
                  <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-black text-sg-subtext uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sg-border">
                {leavesData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-sg-subtext">
                      Không có đơn từ nào.
                    </td>
                  </tr>
                )}
                {leavesData.map((item: any) => {
                  const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={item.id} className="hover:bg-sg-btn-bg/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-sg-heading">{item.name}</span>
                          <span className="text-xs font-medium text-sg-subtext mt-0.5">{item.dept}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-bold text-sg-heading">{item.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-sg-heading">{item.from} - {item.to}</span>
                          <span className="text-xs font-black text-amber-500 mt-1">{item.days} ngày</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedLeave(item)} className="text-sm font-bold text-blue-500 hover:text-blue-600 focus:outline-none focus:underline px-2 py-1">
                          Duyệt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leavesData.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm font-medium text-sg-subtext">
              Không có đơn từ nào.
            </div>
          )}
          {leavesData.map((item: any) => {
            const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
            return (
              <div key={item.id} className="bg-sg-card border border-sg-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex flex-row justify-between items-start mb-5">
                  <div className="flex flex-row items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center border border-amber-200/50 dark:border-amber-500/20">
                      <FileText size={20} className="text-amber-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-black text-sg-heading leading-tight truncate max-w-[150px]">{item.name}</span>
                      <span className="text-xs font-bold text-sg-subtext mt-1">{item.code}</span>
                    </div>
                  </div>
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase ${s.bg} ${s.text}`}>
                    {s.label}
                  </span>
                </div>

                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-sg-subtext">Loại đơn</span>
                    <span className="text-[14px] font-black text-sg-heading">{item.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-sg-subtext">Thời gian</span>
                    <span className="text-[14px] font-black text-sg-heading">{item.from} - {item.to}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-sg-subtext">Tổng số ngày</span>
                    <span className="text-[14px] font-black text-amber-500">{item.days} ngày</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-sg-border flex justify-end">
                  <button onClick={() => setSelectedLeave(item)} className="px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-100 transition-colors text-[13px] font-black uppercase tracking-wide">
                    XEM & DUYỆT
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
