import React, { useMemo } from 'react';
import { User } from 'lucide-react';
import { REProject } from '../../types';

export interface ProjectManagerProps {
  project: REProject;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ project }) => {
  
  const parsedTags = useMemo(() => {
    try {
      return JSON.parse(project.tags || '[]');
    } catch {
      return [];
    }
  }, [project.tags]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-black/30 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-sg-2xl p-6 shadow-sm flex flex-col gap-6">
        <h3 className="text-[15px] font-black text-sg-heading flex items-center gap-2">
           <User size={18} className="text-cyan-500" /> Nhân sự phụ trách
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-sg-btn-bg rounded-2xl border border-sg-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black shadow-inner">
              CĐT
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-sg-heading">{project.developer}</span>
              <span className="text-[11px] font-bold text-sg-muted mt-0.5">Đơn vị phát triển</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-sg-btn-bg rounded-2xl border border-sg-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-black shadow-inner">
              {project.managerName ? project.managerName.slice(0, 2).toUpperCase() : 'NA'}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-sg-heading">{project.managerName}</span>
              <span className="text-[11px] font-bold text-sg-muted mt-0.5">Trưởng phòng Giao dịch</span>
            </div>
          </div>
          <button className="h-8 px-3 rounded-lg bg-sg-bg hover:bg-white/5 border border-sg-border hover:border-cyan-500/30 text-[11px] font-bold text-cyan-400 transition-colors">LH</button>
        </div>
      </div>

      <div className="bg-white dark:bg-black/30 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-sg-2xl p-6 shadow-sm">
          <h3 className="text-[15px] font-black text-sg-heading flex items-center gap-2 mb-4 border-b border-sg-border/60 pb-4">
             Từ khóa định vị
          </h3>
          <div className="flex flex-wrap gap-2">
            {parsedTags.map((tag: string) => (
              <span key={tag} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg text-[12px] font-bold shadow-sm">
                #{tag}
              </span>
            ))}
            <button aria-label="Thêm tag" className="px-3 py-1.5 bg-sg-btn-bg border border-sg-border rounded-lg text-[12px] font-bold text-sg-muted shadow-sm hover:text-sg-heading cursor-pointer transition-colors">
              + Thêm tag
            </button>
          </div>
      </div>
    </div>
  );
};
