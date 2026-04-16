import React, { useState } from 'react';
import { 
  FileSignature, 
  Percent, 
  Banknote, 
  CalendarMinus, 
  Plus, 
  ChevronRight,
  Calculator,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';

const MOCK_POLICIES = [
  { id: 'pol-1', name: 'Thanh toán chuẩn (Standard)', discount: 0, steps: 8, badge: 'Mặc định', color: 'blue' },
  { id: 'pol-2', name: 'Thanh toán nhanh 95%', discount: 5.5, steps: 3, badge: 'Khuyên dùng', color: 'emerald' },
  { id: 'pol-3', name: 'Vay ngân hàng (HTLS 0% 18 tháng)', discount: 0, steps: 5, badge: 'Được quan tâm', color: 'purple' }
];

export function ProjectPoliciesScreen() {
  const [activeTab, setActiveTab] = useState<'PAYMENT' | 'SALES'>('PAYMENT');

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:px-12 flex flex-col gap-8 custom-scrollbar relative z-10">
       {/* Cinematic Ambient Glow */}
       <div className="fixed top-20 right-1/4 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
       
       {/* Header */}
       <div className="flex flex-col gap-2">
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit mb-2 shadow-sm">
           <FileSignature size={14} className="text-rose-500 drop-shadow-sm" />
           <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-none mt-0.5">Policy Management</span>
         </div>
         <h2 className="text-[32px] sm:text-[40px] font-black text-sg-heading tracking-tight drop-shadow-md">
           Chính Sách Bán Hàng
         </h2>
         <p className="text-[14px] font-bold text-sg-subtext max-w-2xl leading-relaxed">
           Quản lý các chương trình thanh toán, tỷ lệ thanh toán theo đợt và các ưu đãi đặc biệt. Dữ liệu này sẽ được đồng bộ trực tiếp với module Kinh Doanh (Sales).
         </p>
       </div>

       {/* Tabs */}
       <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-sg-lg w-fit border border-slate-200/50 dark:border-white/10 backdrop-blur-md">
         <button 
           onClick={() => setActiveTab('PAYMENT')}
           className={`px-6 py-2.5 rounded-sg-md text-[13px] font-black transition-all ${
             activeTab === 'PAYMENT' ? 'bg-white dark:bg-sg-card text-sg-heading shadow-sm' : 'text-sg-muted hover:text-sg-heading'
           }`}
         >
           Phương Thức Thanh Toán
         </button>
         <button 
           onClick={() => setActiveTab('SALES')}
           className={`px-6 py-2.5 rounded-sg-md text-[13px] font-black transition-all ${
             activeTab === 'SALES' ? 'bg-white dark:bg-sg-card text-sg-heading shadow-sm' : 'text-sg-muted hover:text-sg-heading'
           }`}
         >
           Chương Trình Ưu Đãi (Sales Promo)
         </button>
       </div>

       {/* Tab Content */}
       {activeTab === 'PAYMENT' && (
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           
           {/* Left Sidebar - Policy List */}
           <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-[16px] font-black text-sg-heading">Danh sách chính sách</h3>
               <button className="w-8 h-8 rounded-full bg-sg-btn-bg hover:bg-slate-200 border border-sg-border flex items-center justify-center text-sg-heading transition-colors shadow-sm">
                 <Plus size={16} />
               </button>
             </div>
             
             {MOCK_POLICIES.map((policy) => (
               <div key={policy.id} className="bg-white/60 dark:bg-black/40 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 rounded-sg-xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-inner bg-${policy.color}-500/10 text-${policy.color}-600 dark:text-${policy.color}-400 border-${policy.color}-500/20`}>
                      {policy.badge}
                    </span>
                    <ChevronRight size={16} className="text-sg-muted group-hover:text-sg-heading transition-colors" />
                  </div>
                  <h4 className="text-[15px] font-black text-sg-heading mb-1 leading-snug">{policy.name}</h4>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200/60 dark:border-white/5">
                     <div className="flex items-center gap-1.5 text-sg-subtext">
                        <Calculator size={14} />
                        <span className="text-[12px] font-bold">{policy.steps} Đợt</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-sg-subtext">
                        <Percent size={14} className="text-emerald-500" />
                        <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">CK {policy.discount}%</span>
                     </div>
                  </div>
               </div>
             ))}
           </div>

           {/* Right Content - Policy Details (Preview for Standard Payment) */}
           <div className="xl:col-span-2 bg-white/60 dark:bg-black/40 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 rounded-sg-xl shadow-sm overflow-hidden flex flex-col relative group/details">
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 via-cyan-500 to-transparent" />
              
              <div className="p-8 border-b border-slate-200/60 dark:border-white/5">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="text-[12px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full w-fit">Phương thức 1</span>
                    <h3 className="text-[24px] font-black text-sg-heading tracking-tight">Thanh toán chuẩn (Standard)</h3>
                    <p className="text-[13px] font-bold text-sg-subtext">Chuẩn tiến độ xây dựng, áp dụng mặc định cho tất cả rổ hàng SGroup Royal City.</p>
                  </div>
                  <button className="px-5 py-2.5 bg-sg-btn-bg hover:bg-slate-200 border border-sg-border rounded-xl text-[13px] font-black text-sg-heading shadow-sm transition-colors flex items-center gap-2">
                    Chỉnh sửa
                  </button>
                </div>
              </div>

              <div className="p-8 flex-1 bg-sg-bg/30 relative">
                 {/* Stepper Logic details */}
                 <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 relative">
                       <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-black border border-emerald-500/30 z-10 backdrop-blur-md">1</div>
                       <div className="flex-1 bg-white dark:bg-black/40 border border-slate-200/80 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                          <div>
                            <h5 className="font-black text-[14px] text-sg-heading">Đặt cọc (Booking)</h5>
                            <p className="text-[12px] text-sg-subtext font-semibold mt-1">Ngay khi ký Thỏa thuận đặt cọc.</p>
                          </div>
                          <span className="font-black text-[18px] text-sg-heading bg-sg-bg/50 px-4 py-2 rounded-xl">100 Triệu</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 relative">
                       <div className="absolute left-[19px] top-[-24px] bottom-[-24px] w-[2px] bg-slate-200 dark:bg-white/10" />
                       <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-black border border-cyan-500/30 z-10 backdrop-blur-md">2</div>
                       <div className="flex-1 bg-white dark:bg-black/40 border border-slate-200/80 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                          <div>
                            <h5 className="font-black text-[14px] text-sg-heading">Thanh toán Đợt 1 (Ký HĐMB)</h5>
                            <p className="text-[12px] text-sg-subtext font-semibold mt-1">Trong vòng 15 ngày kể từ ngày ký TTĐC.</p>
                          </div>
                          <span className="font-black text-[18px] text-cyan-500 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl">20%</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 relative">
                       <div className="absolute left-[19px] top-[-24px] bottom-[-24px] w-[2px] bg-slate-200 dark:bg-white/10" />
                       <div className="w-10 h-10 rounded-full border border-sg-border bg-sg-bg text-sg-heading flex items-center justify-center font-black z-10">3</div>
                       <div className="flex-1 bg-white dark:bg-black/40 border border-slate-200/80 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-xs opacity-70 hover:opacity-100 transition-opacity">
                          <div>
                            <h5 className="font-black text-[14px] text-sg-heading">Thanh toán Đợt 2 (Lên tầng 5)</h5>
                            <p className="text-[12px] text-sg-subtext font-semibold mt-1">Dự kiến Tháng 04/2026.</p>
                          </div>
                          <span className="font-black text-[18px] text-sg-heading bg-sg-bg/50 px-4 py-2 rounded-xl">10%</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 relative">
                       <div className="absolute left-[19px] top-[-24px] bottom-2 w-[2px] bg-[linear-gradient(to_bottom,transparent_50%,rgba(200,200,200,0.5)_50%)] bg-size-[2px_10px]" />
                       <div className="ml-[60px] flex-1 border border-dashed border-sg-border p-4 rounded-2xl flex items-center justify-center shadow-xs">
                           <span className="text-[13px] font-bold text-sg-muted">... xem thêm 5 đợt khác</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
         </div>
       )}

       {activeTab === 'SALES' && (
         <div className="flex-1 flex items-center justify-center bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-sg-2xl p-10 mt-4 min-h-[400px]">
           <div className="text-center">
             <div className="w-20 h-20 rounded-full border-4 border-dashed border-sg-border mx-auto flex items-center justify-center mb-6">
                <Percent size={32} className="text-sg-muted opacity-50" />
             </div>
             <h3 className="text-xl font-black text-sg-heading">Chưa Thiết Lập Promo</h3>
             <p className="text-[14px] text-sg-subtext font-semibold mt-2">Dự án này chưa có chương trình ưu đãi nào được cấu hình.</p>
             <button className="mt-6 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-black text-[13px] shadow-lg transition-colors">
               + Khởi Tạo Chương Trình
             </button>
           </div>
         </div>
       )}
    </div>
  );
}
