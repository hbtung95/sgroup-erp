import React, { useState } from 'react';
import {
  Calculator, Building2, Percent, CalendarDays,
  TrendingDown, DollarSign, Wallet, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useToastActions } from '../components/shared/Toast';

// ═══════════════════════════════════════════════════════════
// LOAN CALCULATOR SCREEN
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

const BANKS = [
  { name: 'Vietcombank', rate: 7.5, logo: 'VCB' },
  { name: 'Techcombank', rate: 8.0, logo: 'TCB' },
  { name: 'MB Bank',     rate: 8.2, logo: 'MB' },
  { name: 'BIDV',        rate: 7.8, logo: 'BIDV' },
  { name: 'VPBank',      rate: 8.5, logo: 'VPB' },
];

const formatVND = (n: number) => Math.round(n).toLocaleString('vi-VN');

export function LoanCalculatorScreen() {
  const toast = useToastActions();
  const [propertyValue, setPropertyValue] = useState(3500); // Tỷ * 1000 = Triệu
  const [downPaymentPct, setDownPaymentPct] = useState(30); // %
  const [loanTerm, setLoanTerm] = useState(20); // Năm
  const [interestRate, setInterestRate] = useState(8.0); // %

  // Calculations
  const loanAmount = propertyValue * (1 - downPaymentPct / 100);
  const downPayment = propertyValue * (downPaymentPct / 100);
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount > 0 && monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;

  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - loanAmount;

  const handleSliderChange = (setter: any, min: number, max: number, value: number) => {
    setter(Math.min(max, Math.max(min, value)));
  };

  const copyToClipboard = () => {
    const text = `KẾT QUẢ TÍNH KHOẢN VAY:\n- Giá trị BĐS: ${formatVND(propertyValue)} Triệu\n- Trả trước (${downPaymentPct}%): ${formatVND(downPayment)} Triệu\n- Số tiền vay: ${formatVND(loanAmount)} Triệu\n- Thời hạn: ${loanTerm} năm\n- Lãi suất: ${interestRate}%\n=> Trả góp hàng tháng: ${(monthlyPayment / 1000000).toFixed(1)} Triệu/tháng.`;
    navigator.clipboard.writeText(text);
    toast.success('Thành công', 'Đã copy kết quả dự toán vào khay nhớ tạm.');
  };

  // Reusable Slider Component
  const SliderRow = ({ label, value, unit, min, max, step, onChange, colorClass, highlightClass }: any) => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-bold text-sg-heading">{label}</span>
          <div className="text-[18px] font-black group">
            <span className={highlightClass}>
              {typeof value === 'number' ? formatVND(value) : value}
            </span>
            <span className="text-[14px] text-sg-muted ml-1.5">{unit}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSliderChange(onChange, min, max, value - step)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-[20px] font-bold text-sg-heading transition-colors"
          >
           –
          </button>
          <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
            <div
              className={`h-full ${colorClass} transition-all duration-300 ease-out`}
              style={{ width: `${((value - min) / (max - min)) * 100}%` }}
            />
          </div>
          <button
            onClick={() => handleSliderChange(onChange, min, max, value + step)}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 flex items-center justify-center text-[20px] font-bold text-sg-heading transition-colors"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-black/20">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b border-slate-200/50 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Calculator size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-sg-heading tracking-tight">Tính Khoản Vay BĐS</h2>
              <span className="text-[12px] font-bold text-sg-muted">
                Công cụ hỗ trợ dự toán tài chính nhanh cho Khách hàng
              </span>
            </div>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[13px] font-black shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1"
          >
            <CheckCircle2 size={16} /> Copy Kết Quả
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative z-10">
        {/* Background Ambient Glow */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column (Inputs) */}
          <div className="xl:col-span-7 sg-stagger space-y-6">
            <div className="bg-white/60 dark:bg-sg-card border border-slate-200/60 dark:border-sg-border rounded-sg-xl p-6 lg:p-8 shadow-sg-sm backdrop-blur-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-500 uppercase">Input</div>
                <h3 className="text-[16px] font-black text-sg-heading">Thông Số Khoản Vay</h3>
              </div>

              <SliderRow
                label="Giá Trị Bất Động Sản" value={propertyValue} unit="Triệu"
                min={500} max={50000} step={500} onChange={setPropertyValue}
                colorClass="bg-gradient-to-r from-blue-400 to-blue-600" highlightClass="text-blue-600 dark:text-blue-400"
              />
              <SliderRow
                label="Tỷ Lệ Trả Trước" value={downPaymentPct} unit="%"
                min={10} max={70} step={5} onChange={setDownPaymentPct}
                colorClass="bg-gradient-to-r from-purple-400 to-purple-600" highlightClass="text-purple-600 dark:text-purple-400"
              />
              <SliderRow
                label="Thời Hạn Vay" value={loanTerm} unit="Năm"
                min={5} max={30} step={1} onChange={setLoanTerm}
                colorClass="bg-gradient-to-r from-amber-400 to-amber-600" highlightClass="text-amber-600 dark:text-amber-400"
              />
              <SliderRow
                label="Lãi Suất Vay / Năm" value={interestRate} unit="%"
                min={5} max={15} step={0.1} onChange={setInterestRate}
                colorClass="bg-gradient-to-r from-emerald-400 to-emerald-600" highlightClass="text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          {/* Right Column (Results) */}
          <div className="xl:col-span-5 space-y-6 sg-stagger" style={{ animationDelay: '100ms' }}>
            {/* Monthly Payment Hero */}
            <div className="bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-[28px] p-8 shadow-2xl shadow-indigo-500/20 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50" />
              <div className="relative z-10">
                <span className="text-[12px] font-black text-indigo-200 uppercase tracking-widest mb-2 block">Cần thanh toán mỗi tháng</span>
                <div className="text-[42px] font-black leading-tight tracking-tighter mb-1">
                  {formatVND(monthlyPayment)} ₫
                </div>
                <div className="text-[15px] font-medium text-indigo-100 flex items-center gap-2">
                  <Wallet size={16} /> Khoảng {(monthlyPayment / 1000000).toFixed(1)} triệu / tháng.
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white/60 dark:bg-sg-card border border-slate-200/60 dark:border-sg-border rounded-sg-xl p-6 lg:p-8 shadow-sg-sm backdrop-blur-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-sg-border">
                  <span className="text-[14px] font-semibold text-sg-muted">Giá trị BĐS</span>
                  <span className="text-[15px] font-black text-sg-heading">{formatVND(propertyValue)} Tr</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-sg-border">
                  <span className="text-[14px] font-semibold text-sg-muted flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Vốn Tự Có ({downPaymentPct}%)</span>
                  <span className="text-[15px] font-black text-emerald-500">{formatVND(downPayment)} Tr</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-sg-border">
                  <span className="text-[14px] font-semibold text-sg-muted flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Ngân Hàng Tài Trợ</span>
                  <span className="text-[15px] font-black text-blue-500">{formatVND(loanAmount)} Tr</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-sg-border">
                  <span className="text-[14px] font-semibold text-sg-muted flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Tổng Lãi Phải Trả</span>
                  <span className="text-[15px] font-black text-red-500">{formatVND(totalInterest)} Tr</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[14px] font-black text-sg-heading">Tổng Trả Ngân Hàng</span>
                  <span className="text-[16px] font-black text-purple-500">{formatVND(totalPayment)} Tr</span>
                </div>
              </div>
            </div>

            {/* Bank Compare */}
            <div className="bg-white/60 dark:bg-sg-card border border-slate-200/60 dark:border-sg-border rounded-sg-xl p-6 lg:p-8 shadow-sg-sm backdrop-blur-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Building2 size={16} className="text-sg-muted" />
                <h3 className="text-[15px] font-black text-sg-heading">So Sánh Ngân Hàng</h3>
              </div>
              <div className="space-y-3">
                {BANKS.map((bank, idx) => {
                  const mr = bank.rate / 100 / 12;
                  const mp = loanAmount > 0 && mr > 0
                    ? (loanAmount * mr * Math.pow(1 + mr, numPayments)) / (Math.pow(1 + mr, numPayments) - 1)
                    : 0;

                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 dark:border-sg-border bg-slate-50/50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[11px] font-black">
                          {bank.logo}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-sg-heading leading-tight">{bank.name}</div>
                          <div className="text-[12px] font-semibold text-sg-muted">Lãi suất {bank.rate}%/năm</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-black text-blue-600 dark:text-blue-400">{(mp / 1000000).toFixed(1)} Tr</div>
                        <div className="text-[10px] font-bold text-sg-muted uppercase">1 Tháng</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
