import React, { useState } from 'react';
import { BookOpen, GraduationCap, PlayCircle, Clock, CheckCircle, Search, LayoutGrid, List, Award, TrendingUp } from 'lucide-react';
import type { HRRole } from '../HRSidebar';

const MOCK_COURSES = [
  { id: 1, title: 'Văn hóa Doanh nghiệp SGROUP', instructor: 'Phòng Nhân sự', duration: '2h 15m', modules: 5, bg: 'bg-blue-500', icon: BookOpen, status: 'MANDATORY' },
  { id: 2, title: 'Kỹ năng Đàm phán BĐS B2B', instructor: 'GĐKD Nguyễn A', duration: '4h 30m', modules: 8, bg: 'bg-amber-500', icon: GraduationCap, status: 'OPTIONAL' },
  { id: 3, title: 'Bảo mật Thông tin Nâng cao', instructor: 'IT Dept', duration: '1h 00m', modules: 3, bg: 'bg-purple-500', icon: PlayCircle, status: 'MANDATORY' },
];

export function TrainingScreen({ userRole }: { userRole?: HRRole }) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-8 pb-32 animate-sg-fade-in flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-blue-500/10 flex items-center justify-center shadow-sm">
            <GraduationCap size={28} className="text-blue-500" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[32px] font-black text-sg-heading tracking-tight leading-none">Cổng Đào Tạo Nội Bộ</h2>
            <p className="text-[15px] font-medium text-sg-subtext mt-1.5">Nâng cao năng lực chuyên môn & Kỹ năng mềm</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all text-[13px] font-black uppercase tracking-wider">
          ĐĂNG KÝ KHÓA HỌC MỚI
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'KHÓA ĐANG HỌC', val: '2', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'KHÓA ĐÃ HOÀN THÀNH', val: '14', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'GIỜ HỌC TÍCH LŨY', val: '38h', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
          { label: 'CHỨNG CHỈ ĐÃ NHẬN', val: '5', icon: Award, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-sg-card border border-sg-border p-6 rounded-[24px] shadow-sm flex flex-col">
            <div className="flex flex-row items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <span className="text-[11px] font-black text-sg-subtext uppercase tracking-wider">{s.label}</span>
            </div>
            <span className="text-[36px] font-black text-sg-heading tracking-tight leading-none">{s.val}</span>
          </div>
        ))}
      </div>

      {/* Hero Banner / Continue Learning */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[28px] p-8 shadow-lg shadow-blue-500/20 text-white flex flex-col md:flex-row gap-8 items-center justify-between">
        <div className="flex flex-col max-w-[600px]">
          <span className="px-3 py-1 rounded-lg bg-white/20 self-start text-[11px] font-black uppercase tracking-wider mb-4 border border-white/30">TIẾP TỤC HỌC</span>
          <h3 className="text-[28px] font-black leading-tight mb-2">Văn hóa Doanh nghiệp & Quy tắc Ứng xử Bất động sản</h3>
          <p className="text-[15px] font-medium text-blue-100 mb-6">Bài 3: Kỹ năng xử lý khiếu nại khách hàng V.I.P</p>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[13px] font-bold">
              <span>Tiến độ tiến trình khóa học</span>
              <span>65%</span>
            </div>
            <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '65%' }} />
            </div>
          </div>
        </div>
        <button className="shrink-0 w-20 h-20 bg-white text-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.4)]">
          <PlayCircle size={40} className="ml-1" />
        </button>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
        <div className="flex-1 flex flex-row items-center gap-3 bg-sg-card border border-sg-border rounded-xl px-5 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
          <Search size={20} className="text-sg-muted" />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm khóa học, kỹ năng..."
            className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-sg-heading placeholder:text-sg-subtext"
          />
        </div>
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {MOCK_COURSES.map((course, idx) => (
          <div key={idx} className="bg-sg-card border border-sg-border p-6 rounded-[28px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${course.bg}`}>
                <course.icon size={26} />
              </div>
              <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-wider ${course.status === 'MANDATORY' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-sg-btn-bg text-sg-subtext'}`}>
                {course.status === 'MANDATORY' ? 'BẮT BUỘC' : 'TỰ CHỌN'}
              </span>
            </div>
            
            <h4 className="text-[18px] font-black text-sg-heading leading-tight mb-2">{course.title}</h4>
            <p className="text-[13px] font-bold text-sg-subtext mb-6">Giảng viên: {course.instructor}</p>
            
            <div className="mt-auto pt-5 border-t border-sg-border flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sg-subtext">
                  <Clock size={16} />
                  <span className="text-[12px] font-bold">{course.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sg-subtext">
                  <BookOpen size={16} />
                  <span className="text-[12px] font-bold">{course.modules} bài</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
