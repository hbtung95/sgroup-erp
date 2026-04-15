import React, { useState } from 'react';
import { UserPlus, Briefcase, Clock, CheckCircle, Search, MapPin, Sparkles, Bot, X, Users, Star } from 'lucide-react';
import { useJobs, useCandidates } from '../hooks/useHR';
import type { HRRole } from '../HRSidebar';

const STAGES = ['NEW', 'INTERVIEW', 'OFFERRED', 'REJECTED'];

const STAGE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: 'bg-blue-50 dark:bg-blue-500/15', text: 'text-blue-500 dark:text-blue-400', label: 'MỚI ỨNG TUYỂN' },
  INTERVIEW: { bg: 'bg-amber-50 dark:bg-amber-500/15', text: 'text-amber-500 dark:text-amber-400', label: 'PHỎNG VẤN' },
  OFFERRED: { bg: 'bg-emerald-50 dark:bg-emerald-500/15', text: 'text-emerald-500 dark:text-emerald-400', label: 'ĐÃ OFFER' },
  REJECTED: { bg: 'bg-red-50 dark:bg-red-500/15', text: 'text-red-500 dark:text-red-400', label: 'TỪ CHỐI' },
};

export function RecruitmentScreen({ userRole }: { userRole?: HRRole }) {
  const { data: rawJobs, isLoading: loadingJobs } = useJobs();
  const { data: rawCandidates, isLoading: loadingCandidates } = useCandidates();
  
  const [aiModalCandidate, setAiModalCandidate] = useState<any>(null);

  const safeJobs = Array.isArray(rawJobs) ? rawJobs : (rawJobs as any)?.data ?? [];
  const safeCandidates = Array.isArray(rawCandidates) ? rawCandidates : (rawCandidates as any)?.data ?? [];

  const allJobs = safeJobs.map((j: any) => ({
    id: j.id,
    title: j.title,
    dept: j.department || '',
    type: j.type,
    location: j.location || '',
    candidates: j._count?.applicants ?? j.candidates ?? 0,
    status: j.status,
  }));

  const allCandidates = safeCandidates.map((c: any) => ({
    id: c.id,
    name: c.name,
    job: c.job?.title || '',
    source: c.source || '',
    date: new Date(c.createdAt).toLocaleDateString('vi-VN'),
    stage: c.stage,
    rating: c.rating || '-',
    fitScore: Math.floor(Math.random() * 20) + 75, // Mock AI Fit Score
  }));

  return (
    <div className="p-8 pb-32 animate-sg-fade-in flex flex-col gap-8 w-full max-w-7xl mx-auto">
      
      {/* AI Screening Modal Overlay */}
      {aiModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-sg-fade-in">
          <div className="absolute inset-0" onClick={() => setAiModalCandidate(null)} />
          <div className="relative w-full max-w-xl bg-sg-card border border-sg-border rounded-[32px] p-8 shadow-2xl animate-sg-slide-up">
            
            {/* Header */}
            <div className="flex flex-row justify-between items-start mb-6">
              <div className="flex flex-row gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Bot size={28} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-row items-center gap-1.5 mb-1">
                    <Sparkles size={14} className="text-indigo-500" />
                    <span className="text-[11px] font-black tracking-widest text-indigo-500 uppercase">AI Resume Parsing</span>
                  </div>
                  <h2 className="text-[22px] font-black text-sg-heading tracking-tight leading-none">{aiModalCandidate.name}</h2>
                  <p className="text-[13px] font-bold text-sg-subtext mt-1.5">Ứng tuyển: {aiModalCandidate.job}</p>
                </div>
              </div>
              <button onClick={() => setAiModalCandidate(null)} className="p-2 rounded-xl bg-sg-btn-bg text-sg-subtext hover:text-sg-heading transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Score Circular Display Mock */}
            <div className="p-6 rounded-[24px] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex flex-row items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full border-[6px] border-indigo-500 bg-sg-card flex items-center justify-center shrink-0">
                <span className="text-[22px] font-black text-indigo-500">{aiModalCandidate.fitScore}%</span>
              </div>
              <div className="flex-col">
                <h3 className="text-[16px] font-black text-sg-heading mb-1.5">Mức độ Phù hợp: RẤT CAO</h3>
                <p className="text-[13px] font-medium text-sg-subtext leading-relaxed">
                  Kinh nghiệm của ứng viên rất khớp với yêu cầu của vị trí {aiModalCandidate.job}. Kỹ năng chuyên môn đạt yêu cầu 90%.
                </p>
              </div>
            </div>

            {/* Insights */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[12px] font-black text-sg-heading uppercase tracking-wider">Điểm mạnh nổi bật</span>
                <div className="flex flex-row flex-wrap gap-2">
                  {['3 năm kinh nghiệm', 'Kỹ năng giao tiếp', 'Phù hợp văn hóa'].map(t => (
                    <div key={t} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex flex-row items-center gap-1.5 border border-emerald-100 dark:border-emerald-500/20">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[12px] font-black text-sg-heading uppercase tracking-wider">Cần lưu ý</span>
                <div className="flex flex-row flex-wrap gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex flex-row items-center gap-1.5 border border-amber-100 dark:border-amber-500/20">
                    <span className="text-[12px] font-bold text-amber-600 dark:text-amber-400">Thiếu kinh nghiệm quản lý nhóm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row gap-3 mt-8">
              <button onClick={() => setAiModalCandidate(null)} className="flex-1 py-3.5 rounded-xl bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-colors font-black text-[13px] text-sg-subtext">
                ĐÓNG
              </button>
              <button onClick={() => setAiModalCandidate(null)} className="flex-1 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/30 text-white transition-all font-black text-[13px] flex items-center justify-center gap-2">
                <CheckCircle size={16} />
                <span>DUYỆT CV NÀY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <UserPlus size={28} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[32px] font-black text-sg-heading tracking-tight leading-none">Tuyển Dụng (ATS)</h2>
            <p className="text-[15px] font-medium text-sg-subtext mt-1.5">Quản lý Quy trình & Hồ sơ ứng viên</p>
          </div>
        </div>
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/30 transition-all text-[13px] font-black uppercase tracking-wider">
          TẠO TIN TUYỂN DỤNG
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'VỊ TRÍ ĐANG TUYỂN', val: '3', unit: 'jobs', icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'TỔNG CV MỚI', val: '89', unit: 'CVs', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'ĐANG PHỎNG VẤN', val: '14', unit: 'người', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
          { label: 'NHẬN VIỆC', val: '5', unit: 'người', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        ].map((s, i) => (
          <div key={i} className="bg-sg-card border border-sg-border p-6 rounded-[24px] shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex flex-row items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <span className="text-[11px] font-black text-sg-subtext uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[36px] font-black text-sg-heading tracking-tight leading-none">{s.val}</span>
              <span className="text-[14px] font-bold text-sg-subtext">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Active Jobs */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-black text-sg-heading">Vị trí Đang mở</h3>
        <div className="flex overflow-x-auto pb-4 gap-5 custom-scrollbar">
          {loadingJobs ? (
            <div className="p-8"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : allJobs.map((job: any) => (
            <div key={job.id} className="min-w-[300px] w-[300px] bg-sg-card border border-sg-border p-6 rounded-[24px] shadow-sm hover:shadow-md transition-all shrink-0 flex flex-col">
              <div className="flex flex-row justify-between items-center mb-4">
                <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-wider ${
                  job.status === 'OPEN' ? 'bg-emerald-500/15 text-emerald-500' :
                  job.status === 'URGENT' ? 'bg-red-500/15 text-red-500' : 'bg-sg-btn-bg text-sg-subtext'
                }`}>
                  {job.status}
                </span>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-sg-subtext" />
                  <span className="text-[12px] font-bold text-sg-subtext">{job.location}</span>
                </div>
              </div>
              <h4 className="text-[18px] font-black text-sg-heading mb-1">{job.title}</h4>
              <p className="text-[13px] font-bold text-sg-subtext mb-5">{job.dept} • {job.type}</p>
              
              <div className="mt-auto pt-4 border-t border-sg-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Users size={16} className="text-blue-500" />
                  </div>
                  <span className="text-[15px] font-black text-sg-heading tracking-tight">{job.candidates} <span className="text-[12px] font-bold text-sg-subtext">CVs</span></span>
                </div>
                <button className="text-[13px] font-black text-amber-500 hover:text-amber-600">
                  CHI TIẾT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-[22px] font-black text-sg-heading tracking-tight">Pipeline Ứng viên</h3>
            <p className="text-[14px] font-medium text-sg-subtext mt-1">Kéo thả ứng viên để thay đổi trạng thái (Web)</p>
          </div>
          <div className="flex items-center gap-2 bg-sg-card border border-sg-border p-3 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-amber-500">
            <Search size={18} className="text-sg-subtext ml-1" />
            <input type="text" placeholder="Tìm kiếm ứng viên..." className="bg-transparent border-none outline-none text-[14px] font-medium text-sg-heading w-48 placeholder:text-sg-subtext" />
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 gap-6 custom-scrollbar items-start">
          {STAGES.map((stage) => {
            const conf = STAGE_CONFIG[stage];
            const stageCandidates = allCandidates.filter((c: any) => c.stage === stage);
            
            return (
              <div key={stage} className="min-w-[320px] w-[320px] bg-sg-btn-bg/30 border border-sg-border p-4 rounded-[28px] shrink-0">
                <div className="flex flex-row items-center justify-between px-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${conf.text.replace('text-', 'bg-').split(' ')[0]}`} />
                    <span className="text-[13px] font-black text-sg-heading tracking-wider">{conf.label}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-[8px] bg-sg-btn-bg">
                    <span className="text-[12px] font-black text-sg-heading">{stageCandidates.length}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {loadingCandidates ? (
                    <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
                  ) : stageCandidates.length === 0 ? (
                    <div className="py-8 border-2 border-dashed border-sg-border rounded-[20px] flex items-center justify-center">
                      <span className="text-[13px] font-bold text-sg-subtext">Trống</span>
                    </div>
                  ) : stageCandidates.map((c: any) => (
                    <div key={c.id} className="bg-sg-card border border-sg-border p-4 rounded-[20px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col pr-2">
                          <span className="text-[15px] font-black text-sg-heading leading-tight">{c.name}</span>
                          <span className="text-[12px] font-bold text-blue-500 mt-1">{c.job}</span>
                        </div>
                        <button onClick={() => setAiModalCandidate(c)} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-indigo-500/10 flex items-center gap-1.5 hover:bg-indigo-500/20 transition-colors">
                          <Sparkles size={12} className="text-indigo-500" />
                          <span className="text-[11px] font-black text-indigo-500">{c.fitScore}%</span>
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className={c.rating.startsWith('9') || c.rating.startsWith('8') ? 'text-emerald-500 fill-emerald-500' : 'text-amber-500 fill-amber-500'} />
                          <span className="text-[12px] font-black text-sg-subtext">{c.rating !== '-' ? `${c.rating}/10` : 'Chưa ĐG'}</span>
                        </div>
                        <span className="text-[11px] font-bold text-sg-muted">{c.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
