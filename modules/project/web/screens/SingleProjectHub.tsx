import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { ArrowLeft } from 'lucide-react';

import { ProjectHero } from '../components/hub/ProjectHero';
import { ProjectStats } from '../components/hub/ProjectStats';
import { ProjectDetails } from '../components/hub/ProjectDetails';
import { ProjectManager } from '../components/hub/ProjectManager';

export function SingleProjectHub() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  
  // Refactored to use useProject hook to fetch only the necessary data
  const { data: proj, loading, error } = useProject(id);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent relative z-10" aria-busy="true" aria-label="Đang tải dữ liệu dự án">
        <div className="w-12 h-12 border-4 border-sg-border border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !proj) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-transparent relative z-10" role="alert">
         <h2 className="text-2xl font-black text-sg-heading tracking-tight drop-shadow-md">
           {error || "Không tìm thấy dự án"}
         </h2>
         <Link to="/ProjectModule/list" className="mt-6 text-cyan-500 hover:text-cyan-400 font-bold flex items-center gap-2 transition-colors">
           <ArrowLeft size={16} /> Quay lại danh mục
         </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-x-hidden overflow-y-auto custom-scrollbar">
      
      {/* Extract Hero Cover Area */}
      <ProjectHero project={proj} />

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-10 grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-2 flex flex-col gap-8">
            <ProjectStats project={proj} />
            <ProjectDetails project={proj} />
         </div>

         {/* Extract Right Details Panel */}
         <ProjectManager project={proj} />
      </div>
    </div>
  );
}
