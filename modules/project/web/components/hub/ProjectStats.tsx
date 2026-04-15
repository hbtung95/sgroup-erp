import React, { useMemo } from 'react';
import { Target, Grid, Building2, LayoutDashboard } from 'lucide-react';
import { REProject } from '../../types';
import { RE_PROJECT_STATUS } from '../../constants';

export interface ProjectStatsProps {
  project: REProject;
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ project }) => {
  const statusCfg = RE_PROJECT_STATUS[project.status] || RE_PROJECT_STATUS.UPCOMING;

  const stats = useMemo(() => [
    { label: 'Tổng SP', val: project.totalUnits || 0, icon: Target, c: 'text-indigo-400' },
    { label: 'Giá TB (Tỷ)', val: project.avgPrice ? (project.avgPrice / 1000000000).toFixed(1) : '—', icon: Grid, c: 'text-cyan-400' },
    { label: 'Hoa hồng %', val: project.feeRate ? `${project.feeRate}%` : '—', icon: Building2, c: 'text-emerald-400' },
    { label: 'Trạng thái', val: statusCfg.label, icon: LayoutDashboard, c: 'text-rose-400' }
  ], [project, statusCfg]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
       {stats.map((x, i) => (
         <div key={i} className="bg-white dark:bg-black/30 backdrop-blur-lg border border-slate-200 dark:border-white/5 rounded-sg-xl p-5 flex flex-col gap-3 group hover:-translate-y-1 hover:shadow-lg transition-all">
           <div className="flex items-center justify-between">
             <span className="text-[12px] font-bold text-sg-muted uppercase tracking-wide">{x.label}</span>
             <x.icon size={16} className={x.c} />
           </div>
           <span className="text-[20px] font-black text-sg-heading tracking-tight">{x.val}</span>
         </div>
       ))}
    </div>
  );
};
