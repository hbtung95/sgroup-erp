import React from 'react';
import { Pickaxe, CheckCircle2, Circle, Clock } from 'lucide-react';
import { REProject } from '../../types';

export interface ProjectTimelineProps {
  project: REProject;
}

const MOCK_MILESTONES = [
  { id: 1, label: 'Khởi công xây dựng', date: 'Tháng 01/2026', status: 'COMPLETED', detail: 'Đã hoàn thành móng cọc.' },
  { id: 2, label: 'Lên tầng 10', date: 'Tháng 05/2026', status: 'COMPLETED', detail: 'Đang đổ bê tông.' },
  { id: 3, label: 'Cất nóc', date: 'Tháng 10/2026', status: 'IN_PROGRESS', detail: 'Hoàn thiện mái và cất nóc tổng thể.' },
  { id: 4, label: 'Bàn giao nhà', date: 'Tháng 04/2027', status: 'PENDING', detail: 'Sẵn sàng cấp phép vận hành.' },
];

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project }) => {
  return (
    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 rounded-sg-xl p-8 lg:p-10 shadow-lg relative overflow-hidden mt-8">
      {/* Ambient Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

      <h3 className="text-[18px] font-black text-sg-heading flex items-center gap-2 mb-8 relative z-10">
        <Pickaxe size={20} className="text-amber-500" /> Tiến độ thi công
      </h3>

      <div className="relative z-10 pt-4">
        {/* The Timeline Track */}
        <div className="absolute top-10 bottom-10 left-[19px] sm:left-[27px] w-[2px] bg-slate-200/80 dark:bg-white/10" />

        <div className="flex flex-col gap-8">
          {MOCK_MILESTONES.map((m, index) => {
            const isCompleted = m.status === 'COMPLETED';
            const isInProgress = m.status === 'IN_PROGRESS';
            
            return (
              <div key={m.id} className="relative flex items-start gap-6 group">
                {/* Node */}
                <div className="relative z-10">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-4 border-sg-portal-bg shadow-sm transition-transform duration-500 group-hover:scale-110 
                    ${isCompleted ? 'bg-emerald-500 text-white' : isInProgress ? 'bg-amber-500 text-white animate-pulse-slow' : 'bg-slate-200 dark:bg-white/10 text-sg-muted'}`}>
                    {isCompleted ? <CheckCircle2 size={24} /> : isInProgress ? <Clock size={24} /> : <Circle size={24} />}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col pt-1 sm:pt-2 flex-1">
                  <div className="flex flex-wrap items-end gap-3 mb-1.5">
                    <span className={`text-[16px] sm:text-[18px] font-black tracking-tight transition-colors 
                      ${isCompleted ? 'text-emerald-500' : isInProgress ? 'text-amber-500' : 'text-sg-heading'}`}>
                      {m.label}
                    </span>
                    <span className="text-[12px] font-bold text-sg-muted border border-sg-border px-2 py-0.5 rounded-md backdrop-blur-sm bg-sg-bg/50">
                      {m.date}
                    </span>
                  </div>
                  <p className="text-[14px] font-semibold text-sg-subtext">{m.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
