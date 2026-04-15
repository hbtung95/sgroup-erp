import React, { useState } from 'react';
import { Book, FileText, Download, ShieldCheck, Scale, AlertCircle, FileSearch, Search, Lock } from 'lucide-react';
import type { HRRole } from '../HRSidebar';

export function PoliciesScreen({ userRole }: { userRole?: HRRole }) {
  const [searchQuery, setSearchQuery] = useState('');

  const POLICIES = [
    { title: 'Sổ tay Văn hóa Doanh nghiệp', desc: 'Quy tắc ứng xử cốt lõi và tầm nhìn.', type: 'PDF', size: '2.4 MB', icon: Book, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { title: 'Nội quy & Chế tài Công ty', desc: 'Cập nhật năm 2026. Áp dụng cho toàn bộ khối Văn phòng.', type: 'DOCX', size: '1.1 MB', icon: Scale, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    { title: 'Quy chế Thưởng / Phạt Kinh Doanh', desc: 'Bảng hoa hồng tiêu chuẩn và CSKH.', type: 'XLSX', size: '540 KB', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { title: 'Khung Quy định Bảo mật Thông tin', desc: 'Các thỏa thuận NDA và xử lý dữ liệu.', type: 'PDF', size: '1.8 MB', icon: Lock, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10' },
  ];

  return (
    <div className="p-8 pb-32 animate-sg-fade-in flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-slate-500/10 flex items-center justify-center shadow-sm">
            <ShieldCheck size={28} className="text-slate-500" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[32px] font-black text-sg-heading tracking-tight leading-none">Chính sách & Quy định</h2>
            <p className="text-[15px] font-medium text-sg-subtext mt-1.5">Trạm tài liệu Nội bộ - Tuân thủ và Văn hóa Hành xử</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-5">
        {/* Search & List */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex items-center gap-3 bg-sg-card border border-sg-border rounded-xl px-5 py-4 shadow-sm focus-within:ring-2 focus-within:ring-slate-500">
            <Search size={22} className="text-sg-muted" />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên quy định, nội quy..."
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-bold text-sg-heading placeholder:text-sg-subtext"
            />
          </div>

          <div className="bg-sg-card border border-sg-border rounded-[28px] overflow-hidden">
            {POLICIES.map((p, idx) => (
              <div key={idx} className="flex flex-row items-center p-6 border-b border-sg-border last:border-b-0 hover:bg-sg-btn-bg/30 transition-colors cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-5 ${p.bg}`}>
                  <p.icon size={22} className={p.color} />
                </div>
                <div className="flex-1 flex flex-col pr-4">
                  <h4 className="text-[16px] font-black text-sg-heading group-hover:text-blue-500 transition-colors leading-tight mb-1">{p.title}</h4>
                  <p className="text-[13px] font-medium text-sg-subtext">{p.desc}</p>
                </div>
                <div className="flex flex-col items-end mr-6">
                  <span className="text-[12px] font-black text-sg-heading bg-sg-btn-bg px-2 py-1 rounded-md">{p.type}</span>
                  <span className="text-[11px] font-bold text-sg-subtext mt-1">{p.size}</span>
                </div>
                <button className="w-10 h-10 rounded-full border border-sg-border flex items-center justify-center text-sg-subtext hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all">
                  <Download size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Highlighted Banner */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-sg-heading rounded-[28px] p-8 text-sg-portal-bg shadow-xl flex flex-col h-full items-start relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute -right-10 -top-10 opacity-10">
              <Scale size={180} />
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md self-start text-[11px] font-black uppercase tracking-wider mb-8 border border-white/10 flex items-center gap-1.5">
              <AlertCircle size={14} /> NEW UPDATE 2026
            </div>
            
            <h3 className="text-[24px] font-black leading-tight mb-4">Chứng nhận Tuân thủ Đạo đức Kinh doanh</h3>
            <p className="text-[14px] font-medium opacity-80 mb-8 leading-relaxed">
              Bạn cần hoàn tất đọc hiểu bổ sung Phụ lục 03-C về Luật Cạnh Tranh trước ngày 15/04/2026.
            </p>
            
            <button className="mt-auto items-center w-full bg-white text-sg-heading px-6 py-3.5 rounded-xl text-[14px] font-black uppercase tracking-wider hover:bg-slate-100 transition-colors flex justify-center gap-2">
              <FileSearch size={18} /> TIẾN HÀNH DUYỆT NGAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
