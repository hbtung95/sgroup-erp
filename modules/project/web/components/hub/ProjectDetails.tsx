import React from 'react';
import { Target, MapPin, Calendar } from 'lucide-react';
import { REProject } from '../../types';

export interface ProjectDetailsProps {
  project: REProject;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-sg-2xl p-8 shadow-sm">
       <h3 className="text-lg font-black text-sg-heading flex items-center gap-2 mb-6"><Target size={20} className="text-cyan-500" /> Vị trí & Tổng quan</h3>
       <p className="text-sg-subtext font-semibold leading-relaxed mb-6 whitespace-pre-wrap">{project.description}</p>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-sg-bg/30 p-5 rounded-[20px] border border-sg-border/50">
         <div className="flex flex-col gap-1.5">
           <span className="text-[11px] font-bold text-sg-muted uppercase flex items-center gap-1"><MapPin size={12} /> Tọa độ / Vị trí</span>
           <span className="text-[14px] font-extrabold text-sg-heading">{project.location}</span>
         </div>
         <div className="flex flex-col gap-1.5">
           <span className="text-[11px] font-bold text-sg-muted uppercase flex items-center gap-1"><Calendar size={12} /> Bàn giao dự kiến</span>
           <span className="text-[14px] font-extrabold text-sg-heading">{new Date(project.endDate).toLocaleDateString('vi')}</span>
         </div>
       </div>
    </div>
  );
};
