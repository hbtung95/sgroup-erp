import React from 'react';
import { Gift, HeartPulse, Sparkles, Building, Briefcase, CarFront, Coffee, Activity, ChevronRight } from 'lucide-react';
import type { HRRole } from '../HRSidebar';

export function BenefitsScreen({ userRole }: { userRole?: HRRole }) {
  return (
    <div className="p-8 pb-32 animate-sg-fade-in flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-pink-500/10 flex items-center justify-center shadow-sm">
            <HeartPulse size={28} className="text-pink-500" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[32px] font-black text-sg-heading tracking-tight leading-none">Phúc Lợi & Đãi Ngộ</h2>
            <p className="text-[15px] font-medium text-sg-subtext mt-1.5">Gói quyền lợi dành riêng cho nhân sự SGROUP</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {/* Card 1: Health */}
        <div className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-500/10 dark:to-sg-portal-bg border border-pink-200 dark:border-pink-500/20 p-8 rounded-[32px] shadow-sm flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 mb-6">
            <Activity size={28} />
          </div>
          <h3 className="text-[20px] font-black text-sg-heading mb-3">Chăm Sóc Sức Khỏe Toàn Diện</h3>
          <p className="text-[14px] font-medium text-sg-subtext mb-6">Gói bảo hiểm sức khỏe cao cấp Liberty trị giá 500tr/năm cho CBNV có thâm niên từ 1 năm trở lên. Khám sức khỏe định kỳ mỗi 6 tháng tại các bệnh viện 5 sao.</p>
          <ul className="flex flex-col gap-3 mt-auto">
            {['Bảo hiểm PVI Care', 'Khám tổng quát 2 lần/năm', 'Trợ cấp Thai sản ưu đãi'].map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircleIcon /> <span className="text-[13px] font-bold text-sg-heading">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 2: Financial */}
        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-500/10 dark:to-sg-portal-bg border border-amber-200 dark:border-amber-500/20 p-8 rounded-[32px] shadow-sm flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6">
            <Briefcase size={28} />
          </div>
          <h3 className="text-[20px] font-black text-sg-heading mb-3">Tài chính & Thu nhập</h3>
          <p className="text-[14px] font-medium text-sg-subtext mb-6">Thưởng tháng 13, thưởng hiệu quả kinh doanh, ESOP áp dụng cho quản lý cấp trung, hỗ trợ vay lãi suất ưu đãi lên đến 1 Tỷ VNĐ để mua nhà/xe.</p>
          <ul className="flex flex-col gap-3 mt-auto">
            {['Thưởng Tết từ 1-3 tháng lương', 'Chương trình ESOP Cổ Phần', 'Hỗ trợ Vay Lãi Suất Thấp'].map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircleIcon /> <span className="text-[13px] font-bold text-sg-heading">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 3: Lifestyle */}
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-500/10 dark:to-sg-portal-bg border border-indigo-200 dark:border-indigo-500/20 p-8 rounded-[32px] shadow-sm flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
            <Gift size={28} />
          </div>
          <h3 className="text-[20px] font-black text-sg-heading mb-3">Đời Sống & Giải Trí</h3>
          <p className="text-[14px] font-medium text-sg-subtext mb-6">Company trip nghỉ dưỡng hạng sang định kỳ hàng năm. Quỹ CLB thể thao (Bóng đá, Gym, Yoga, Cầu Lông). Pantry 7/7 miễn phí cafe & trà bánh.</p>
          <ul className="flex flex-col gap-3 mt-auto">
            {['Du lịch Resort 5 sao', 'Gói tập Gym Fitness 1 năm', 'Sinh nhật & Sự kiện đặc biệt'].map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircleIcon /> <span className="text-[13px] font-bold text-sg-heading">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Small Add-ons */}
      <h3 className="text-[20px] font-black text-sg-heading mt-8">Phụ cấp Bổ sung</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
           { icon: Coffee, label: 'Phụ cấp Ăn Trưa', val: '800k/tháng' },
           { icon: CarFront, label: 'Phụ cấp Xăng Xe', val: '500k/tháng' },
           { icon: Building, label: 'Gói Gửi xe Tháng', val: 'Miễn phí Free' },
           { icon: Sparkles, label: 'Hỗ trợ Trang phục', val: '2.5Tr/năm' },
        ].map((a, i) => (
          <div key={i} className="bg-sg-card border border-sg-border p-5 rounded-[20px] flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sg-btn-bg flex items-center justify-center">
              <a.icon size={20} className="text-sg-subtext" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-sg-subtext uppercase tracking-wider">{a.label}</span>
              <span className="text-[15px] font-black text-sg-heading mt-0.5">{a.val}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckCircleIcon() {
  return (
    <div className="w-5 h-5 rounded-full bg-sg-heading text-sg-card flex items-center justify-center shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
  )
}
