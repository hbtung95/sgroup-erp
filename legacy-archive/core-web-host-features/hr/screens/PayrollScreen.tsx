import React, { useState } from 'react';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Search, FileText, CheckCircle, Eye, EyeOff, LayoutGrid, List, BarChart3, X } from 'lucide-react';
import { usePayrollRuns, usePayslips, useGeneratePayroll } from '../hooks/useHR';
import type { HRRole } from '../HRSidebar';

const fmt = (n: number) => n.toLocaleString('vi-VN');
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const MOCK_HISTORY = [
  { month: 'T10', budget: 100, actual: 85 },
  { month: 'T11', budget: 100, actual: 94 },
  { month: 'T12', budget: 120, actual: 118 },
  { month: 'T01', budget: 110, actual: 98 },
  { month: 'T02', budget: 110, actual: 105 },
  { month: 'T03', budget: 110, actual: 108, forecast: true },
];

export function PayrollScreen({ userRole }: { userRole?: HRRole }) {
  const [isPrivate, setIsPrivate] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: rawRuns } = usePayrollRuns({ offset: 0, limit: 10 });
  const runs = Array.isArray(rawRuns) ? rawRuns : (rawRuns as any)?.data ?? [];
  const latestRun = runs.length > 0 ? runs[0] : null;

  const { data: rawPayslips, isLoading } = usePayslips(latestRun?.id || '');
  const safePayslips = Array.isArray(rawPayslips) ? rawPayslips : (rawPayslips as any)?.data ?? [];

  const { mutate: generateMutate, isPending: isGenerating } = useGeneratePayroll();

  const handleGenerate = () => {
    generateMutate({
      title: `Tháng ${('0' + currentMonth).slice(-2)}/${currentYear}`,
      cycle_start: `${currentYear}-${('0' + currentMonth).slice(-2)}-01`,
      cycle_end: `${currentYear}-${('0' + currentMonth).slice(-2)}-28`, // simplify
      standard_days: 22,
      admin_id: 1,
    });
  };

  const payrollData = React.useMemo(() => {
    return safePayslips
      .map((r: any) => ({
        id: r.id,
        code: r.employee?.employeeCode || r.employee?.id || '',
        name: r.employee?.fullName || 'Nhân viên mới',
        dept: r.employee?.department?.name || '',
        basic: Number(r.base_salary) || 0,
        allowance: Number(r.allowances) || 0,
        commission: 0,
        deduction: Number(r.deductions) || 0,
        total: Number(r.net_salary) || 0,
        status: r.status === 'PAID' ? 'PAID' : r.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
      }))
      .filter((r: any) => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        String(r.code).toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [safePayslips, searchQuery]);

  const { totalFund, totalAllowance, totalDeduction, paidPct } = React.useMemo(() => {
    const fund = payrollData.reduce((s: number, r: any) => s + r.total, 0);
    const allow = payrollData.reduce((s: number, r: any) => s + r.allowance + r.commission, 0);
    const deduct = payrollData.reduce((s: number, r: any) => s + r.deduction, 0);
    const paidCount = payrollData.filter((r: any) => r.status === 'PAID').length;
    const pct = payrollData.length > 0 ? Math.round((paidCount / payrollData.length) * 100) : 0;
    
    return { totalFund: fund, totalAllowance: allow, totalDeduction: deduct, paidPct: pct };
  }, [payrollData]);

  const mask = (val: number) => isPrivate ? '***,***' : fmt(val);

  return (
    <div className="p-8 pb-32 animate-sg-fade-in flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Fintech Premium Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-row items-center gap-5">
          <div className="w-[60px] h-[60px] rounded-[20px] bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Wallet size={28} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[32px] font-black text-sg-heading tracking-tight leading-none">Quản trị Quỹ lương</h2>
            <p className="text-[15px] font-bold text-sg-subtext mt-2">Dữ liệu tài chính: Tháng {currentMonth}/{currentYear}</p>
          </div>
        </div>
        
        <div className="flex flex-row gap-3">
          <button 
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex flex-row items-center gap-2 px-5 py-3 rounded-xl border transition-colors ${
              isPrivate 
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 text-red-600 dark:text-red-400'
            }`}
          >
            {isPrivate ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="text-[13px] font-black uppercase tracking-wide">
              {isPrivate ? 'CHẾ ĐỘ MẬT' : 'HIỂN THỊ'}
            </span>
          </button>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-7 py-3 rounded-xl shadow-lg shadow-purple-500/20 transition-all text-[14px] font-black uppercase tracking-wide disabled:opacity-50"
          >
            {isGenerating ? 'ĐANG TÍNH TOÁN...' : 'CHẠY BẢNG LƯƠNG'}
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'TỔNG QUỸ LƯƠNG', val: mask(totalFund), unit: '₫', icon: DollarSign, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/15' },
          { label: 'TỔNG THƯỞNG / PHỤ CẤP', val: mask(totalAllowance), unit: '₫', icon: ArrowUpRight, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
          { label: 'BHXH & KHẤU TRỪ', val: mask(totalDeduction), unit: '₫', icon: ArrowDownRight, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/15' },
          { label: 'ĐÃ THANH TOÁN', val: isPrivate ? '***' : `${paidPct}%`, unit: '', icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/15' },
        ].map((s, i) => (
          <div key={i} className="bg-sg-card border border-sg-border p-6 rounded-[28px] shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-md transition-all">
            <div className="flex flex-row items-center gap-3.5 mb-5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={22} className={s.color} />
              </div>
              <span className="text-xs font-black text-sg-subtext uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="flex flex-row items-baseline gap-1.5 mt-auto">
              <span className="text-[36px] font-black text-sg-heading tracking-tight leading-none tabular-nums">{s.val}</span>
              {s.unit && <span className="text-base font-bold text-sg-subtext">{s.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Dashboard */}
      <div className="bg-sg-card border border-sg-border rounded-sg-2xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="flex flex-row items-center gap-4">
            <div className="p-3.5 rounded-2xl border border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10">
              <BarChart3 size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-sg-heading">Phân tích Ngân sách & Dự báo</h3>
              <p className="text-sm font-bold text-sg-subtext mt-1">Xu hướng quỹ lương 6 tháng gần nhất</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded border border-sg-border bg-sg-btn-bg" />
              <span className="text-[13px] font-bold text-sg-subtext">Ngân sách Mức trần</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-linear-to-br from-purple-500 to-indigo-600" />
              <span className="text-[13px] font-bold text-sg-subtext">Thực chi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-linear-to-br from-amber-400 to-amber-600" />
              <span className="text-[13px] font-bold text-sg-subtext">Dự báo (AI)</span>
            </div>
          </div>
        </div>

        {/* CSS Chart Rendering */}
        <div className="h-[260px] flex flex-row items-end justify-between pt-5 pb-2 px-2">
          {MOCK_HISTORY.map((item, idx) => {
            const maxBudget = 130;
            const budgetPct = (item.budget / maxBudget) * 100;
            const actualPct = (item.actual / maxBudget) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-4 h-full relative">
                {item.forecast && (
                  <div className="absolute top-0 px-2.5 py-1 rounded-lg bg-amber-500/15 text-[11px] font-black text-amber-500 tracking-wider">
                    AI FORECAST
                  </div>
                )}
                <div className="w-full flex-1 flex justify-center items-end relative">
                  {/* Budget Outline */}
                  <div 
                    className={`absolute bottom-0 w-12 rounded-xl border border-sg-border ${item.forecast ? 'border-dashed' : 'bg-sg-btn-bg/30'}`}
                    style={{ height: `${budgetPct}%` }}
                  />
                  {/* Actual Fill */}
                  <div 
                    className={`absolute bottom-0 w-12 rounded-xl shadow-lg transition-transform hover:scale-105 origin-bottom ${
                      item.forecast 
                        ? 'bg-linear-to-t from-amber-600 to-amber-400 shadow-amber-500/30 blur-[1px]' 
                        : 'bg-linear-to-t from-indigo-600 to-purple-500 shadow-purple-500/30'
                    } ${isPrivate ? 'opacity-40' : 'opacity-100'}`}
                    style={{ height: `${actualPct}%` }}
                  />
                </div>
                <span className={`text-[14px] font-black ${item.forecast ? 'text-amber-500' : 'text-sg-subtext'}`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex flex-row bg-sg-card border border-sg-border p-1 rounded-xl shadow-sm">
          <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-sg-btn-bg text-sg-heading shadow-sm' : 'text-sg-subtext hover:text-sg-heading'}`}>
            <List size={20} />
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-sg-btn-bg text-sg-heading shadow-sm' : 'text-sg-subtext hover:text-sg-heading'}`}>
            <LayoutGrid size={20} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-row items-center gap-3 bg-sg-card border border-sg-border rounded-xl px-5 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-purple-500">
          <Search size={20} className="text-sg-muted" />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm CBNV theo tên hoặc mã số..."
            className="flex-1 bg-transparent border-none outline-none text-[15px] font-semibold text-sg-heading placeholder:text-sg-subtext"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 rounded-md hover:bg-sg-btn-bg text-sg-subtext">
              <X size={16} />
            </button>
          )}
        </div>

        <button className="bg-sg-card border border-sg-border px-6 py-3.5 rounded-xl shadow-sm text-[14px] font-bold text-sg-heading hover:bg-sg-btn-bg transition-colors whitespace-nowrap">
          Bộ lọc Trạng thái: Tất cả
        </button>
      </div>

      {/* Grid/Table Data */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-sm font-bold text-sg-subtext">Đang tính toán dữ liệu lương...</span>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-sg-card border border-sg-border rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-sg-btn-bg/40 border-b border-sg-border">
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider">Nhân viên</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider text-right">Lương cơ bản</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider text-right">Phụ cấp / Thưởng</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider text-right">Khấu trừ</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider text-right bg-sg-btn-bg/20">Thực lãnh</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sg-border">
                {payrollData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-[15px] font-medium text-sg-subtext">
                      Không có dữ liệu bảng lương tháng này.
                    </td>
                  </tr>
                )}
                {payrollData.map((item: any) => {
                  const isPaid = item.status === 'PAID';
                  return (
                    <tr key={item.id} className="hover:bg-sg-btn-bg/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-sg-heading">{item.name}</span>
                          <span className="text-[12px] font-medium text-sg-subtext mt-0.5">{item.code} • {item.dept}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[14px] font-bold text-sg-heading tabular-nums">{mask(item.basic)} ₫</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[14px] font-bold text-emerald-500 tabular-nums">+{mask(item.allowance + item.commission)} ₫</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[14px] font-bold text-red-500 tabular-nums">-{mask(item.deduction)} ₫</span>
                      </td>
                      <td className="px-6 py-4 text-right bg-sg-btn-bg/10">
                        <span className="text-[16px] font-black text-blue-500 tabular-nums">{mask(item.total)} ₫</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1.5 rounded-sg-sm text-[10px] font-black tracking-wider uppercase ${
                          isPaid ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                        }`}>
                          {isPaid ? 'ĐÃ CHI' : 'CHỜ DUYỆT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                          <FileText size={18} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {payrollData.length === 0 && (
            <div className="col-span-full py-16 text-center text-[15px] font-medium text-sg-subtext">
              Không có dữ liệu bảng lương tháng này.
            </div>
          )}
          {payrollData.map((item: any) => {
            const isPaid = item.status === 'PAID';
            return (
              <div key={item.id} className="bg-sg-card border border-sg-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex flex-row justify-between items-start mb-6">
                  <div className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center font-black text-xl text-blue-500 border border-blue-100 dark:border-blue-500/20">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] font-black text-sg-heading truncate max-w-[140px]">{item.name}</span>
                      <span className="text-[13px] font-bold text-sg-subtext mt-1">{item.code}</span>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1.5 rounded-sg-sm text-[10px] font-black tracking-wider uppercase ${
                    isPaid ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                  }`}>
                    {isPaid ? 'ĐÃ CHI' : 'CHỜ DUYỆT'}
                  </span>
                </div>

                <div className="flex flex-col gap-3.5 mb-6 px-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-sg-subtext">Lương cơ bản</span>
                    <span className="text-[14px] font-bold text-sg-heading tabular-nums">{mask(item.basic)} ₫</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-sg-subtext">Phụ cấp / Thưởng</span>
                    <span className="text-[14px] font-black text-emerald-500 tabular-nums">+{mask(item.allowance + item.commission)} ₫</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-sg-subtext">Khấu trừ</span>
                    <span className="text-[14px] font-black text-red-500 tabular-nums">-{mask(item.deduction)} ₫</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-sg-border flex flex-row items-center justify-between">
                  <span className="text-[13px] font-black text-sg-subtext uppercase tracking-wider">Thực lãnh</span>
                  <span className="text-[24px] font-black text-blue-500 tracking-tight tabular-nums">{mask(item.total)} ₫</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
