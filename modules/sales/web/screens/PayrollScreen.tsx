import React, { useState, useMemo } from 'react';
import {
  DollarSign, Download, CreditCard, ChevronDown, Award, Search, HandCoins, Building2, TrendingUp, Calendar, Clock, CheckCircle2
} from 'lucide-react';
import { useToast } from '../components/shared/Toast';

// ═══════════════════════════════════════════════════════════
// PAYROLL SCREEN — Bảng Lương Sales
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

interface PayrollRecord {
  month: number;
  year: number;
  baseSalary: number;
  kpiSalary: number;
  commission: number;
  allowance: number;
  deduction: number;
  totalIncome: number;
  tax: number;
  netIncome: number;
  status: 'PAID' | 'PROCESSING';
  paymentDate: string | null;
}

const formatVND = (n: number) => Math.round(n).toLocaleString('vi-VN') + ' đ';

// Generate mock payroll data history
const MOCK_PAYROLL: PayrollRecord[] = [
  { month: 4, year: 2026, baseSalary: 8000000, kpiSalary: 12000000, commission: 85000000, allowance: 1500000, deduction: 0, totalIncome: 106500000, tax: 8500000, netIncome: 98000000, status: 'PROCESSING', paymentDate: null },
  { month: 3, year: 2026, baseSalary: 8000000, kpiSalary: 10000000, commission: 45000000, allowance: 1500000, deduction: 500000, totalIncome: 64000000, tax: 4500000, netIncome: 59500000, status: 'PAID', paymentDate: '2026-04-05' },
  { month: 2, year: 2026, baseSalary: 8000000, kpiSalary: 8000000, commission: 15000000, allowance: 1500000, deduction: 0, totalIncome: 32500000, tax: 1500000, netIncome: 31000000, status: 'PAID', paymentDate: '2026-03-05' },
];

export function PayrollScreen() {
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord>(MOCK_PAYROLL[0]);

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-slate-50 dark:bg-black/20 pb-8">
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-slate-200/50 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <DollarSign size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-sg-heading tracking-tight">Bảng Lương</h2>
              <span className="text-[12px] font-bold text-sg-muted flex items-center gap-2 mt-0.5">
                <HandCoins size={14} /> Thu nhập cá nhân chi tiết
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-transparent dark:bg-white dark:text-slate-900 rounded-xl text-white text-[12px] font-black shadow-lg hover:-translate-y-0.5 transition-all">
              <Download size={14} /> Xuất phiếu lương
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Salary Slip Details */}
        <div className="flex-1 w-full flex flex-col gap-6 sg-stagger">
          <div className="bg-white/80 dark:bg-sg-card backdrop-blur-2xl rounded-tr-3xl rounded-b-[32px] rounded-tl-md border border-slate-200/80 dark:border-sg-border shadow-2xl relative overflow-hidden">
             
             {/* Print Watermark */}
             <div className="absolute top-20 right-10 opacity-[0.03] rotate-12 pointer-events-none">
                <Building2 size={300} className="text-emerald-500" />
             </div>

             <div className="bg-linear-to-r from-emerald-500 to-teal-500 px-8 py-8 relative">
               <div className="flex justify-between items-start relative z-10">
                 <div className="text-white">
                   <h1 className="text-[28px] font-black tracking-tight mb-1">Phiếu Lương</h1>
                   <p className="text-[14px] font-bold text-white/80 uppercase tracking-widest">Kỳ lương tháng {selectedRecord.month}/{selectedRecord.year}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[12px] font-bold text-white/80 mb-1">Cán bộ nhân viên</p>
                   <p className="text-[18px] font-black text-white">Nguyễn Demo</p>
                   <p className="text-[13px] font-bold text-white/80 mt-1">S1 • BD Zone 1</p>
                 </div>
               </div>
             </div>

             <div className="px-8 py-6 border-b border-sg-border/50 bg-slate-50 dark:bg-black/20 flex justify-between items-center">
                <div>
                   <p className="text-[12px] font-black text-sg-muted uppercase tracking-widest mb-1">Thực Lĩnh (Net Income)</p>
                   <p className="text-[36px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none tracking-tighter">
                      {formatVND(selectedRecord.netIncome)}
                   </p>
                   {selectedRecord.status === 'PAID' ? (
                      <p className="text-[12px] font-bold text-emerald-600 flex items-center gap-1.5 mt-2">
                         <CheckCircle2 size={14} /> Đã thanh toán ngày {selectedRecord.paymentDate}
                      </p>
                   ) : (
                      <p className="text-[12px] font-bold text-amber-500 flex items-center gap-1.5 mt-2">
                         <Clock size={14} /> Đang xử lý
                      </p>
                   )}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                   <CreditCard size={28} className="text-emerald-500" />
                </div>
             </div>

             <div className="p-8 space-y-6 relative z-10">
                {/* Lương Cơ Bản */}
                <div>
                   <h3 className="text-[11px] font-black text-sg-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" /> 1. Lương Cứng & Phụ Cấp
                   </h3>
                   <div className="space-y-4 pl-4 border-l-2 border-sg-border/50">
                      <Row label="Lương cơ bản" value={selectedRecord.baseSalary} />
                      <Row label="Phụ cấp ăn trưa, đi lại" value={selectedRecord.allowance} />
                   </div>
                </div>

                <div className="w-full h-px bg-sg-border border-dashed" />

                {/* Doanh Thu & KPI */}
                <div>
                   <h3 className="text-[11px] font-black text-sg-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" /> 2. Doanh Thu & Năng Suất (KPI)
                   </h3>
                   <div className="space-y-4 pl-4 border-l-2 border-sg-border/50">
                      <Row label="Lương KPI Năng suất" value={selectedRecord.kpiSalary} />
                      <Row label="Hoa hồng phòng KD" value={selectedRecord.commission} highlight />
                   </div>
                </div>

                <div className="w-full h-px bg-sg-border border-dashed" />

                {/* Khấu Trừ */}
                <div>
                   <h3 className="text-[11px] font-black text-sg-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500" /> 3. Khấu Trừ
                   </h3>
                   <div className="space-y-4 pl-4 border-l-2 border-sg-border/50">
                      <Row label="Thuế TNCN (Tạm tính)" value={selectedRecord.tax} deduct />
                      <Row label="Trừ đi muộn/vắng" value={selectedRecord.deduction} deduct />
                   </div>
                </div>
             </div>
             
             {/* Total Row */}
             <div className="px-8 py-5 bg-slate-50 dark:bg-black/40 border-t border-sg-border/50 flex justify-between items-center rounded-b-sg-2xl">
                <span className="text-[15px] font-black text-sg-heading">TỔNG THU NHẬP TRƯỚC THUẾ (GROSS)</span>
                <span className="text-[20px] font-black text-sg-heading tabular-nums">{formatVND(selectedRecord.totalIncome)}</span>
             </div>
          </div>
        </div>

        {/* Right: History Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 sg-stagger" style={{ animationDelay: '100ms' }}>
          <h3 className="text-[13px] font-black text-sg-heading uppercase tracking-widest pl-2">Lịch Sử Nhận Lương</h3>
          <div className="space-y-3">
             {MOCK_PAYROLL.map(p => (
                <button
                   key={p.month}
                   onClick={() => setSelectedRecord(p)}
                   className={`w-full p-4 rounded-2xl border text-left transition-all ${
                      selectedRecord.month === p.month
                         ? 'bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/10'
                         : 'bg-white/60 dark:bg-sg-card border-slate-200/60 dark:border-sg-border hover:bg-slate-50 dark:hover:bg-white/5 backdrop-blur-2xl'
                   }`}
                >
                   <div className="flex justify-between items-center mb-1">
                      <span className={`text-[14px] font-black ${selectedRecord.month === p.month ? 'text-emerald-600 dark:text-emerald-400' : 'text-sg-heading'}`}>Tháng {p.month}/{p.year}</span>
                      {p.status === 'PAID' ? (
                         <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                         </div>
                      ) : (
                          <div className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[9px] font-black text-amber-600 uppercase tracking-widest">
                            Xử lý
                         </div>
                      )}
                   </div>
                   <div className="text-[18px] font-black text-sg-heading tabular-nums">{formatVND(p.netIncome)}</div>
                </button>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight, deduct }: { label: string; value: number; highlight?: boolean; deduct?: boolean }) {
   if (value === 0 && !deduct) return null;
   return (
      <div className="flex justify-between items-center">
         <span className="text-[13px] font-bold text-sg-muted">{label}</span>
         {deduct ? (
             <span className="text-[15px] font-black text-rose-500 tabular-nums">-{formatVND(value)}</span>
         ) : highlight ? (
             <span className="text-[15px] font-black text-amber-500 tabular-nums">+{formatVND(value)}</span>
         ) : (
            <span className="text-[15px] font-black text-sg-heading tabular-nums">{formatVND(value)}</span>
         )}
      </div>
   );
}
