import React, { useState } from 'react';
import { 
  FolderOpen, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Search, 
  MoreVertical,
  Plus,
  Eye
} from 'lucide-react';

const MOCK_ASSETS = [
  { id: '1', name: 'Brochure SGroup Royal City.pdf', type: 'PDF', size: '25 MB', date: '10/01/2026', tag: 'Truyền thông' },
  { id: '2', name: 'Mat_bang_tong_the_A.png', type: 'IMAGE', size: '12 MB', date: '12/01/2026', tag: 'Bản vẽ' },
  { id: '3', name: 'Chinh_sach_ban_hang_T1.pdf', type: 'PDF', size: '2 MB', date: '15/01/2026', tag: 'Bán hàng' },
  { id: '4', name: 'Sales_Kit_Template.pptx', type: 'PRESENTATION', size: '40 MB', date: '20/01/2026', tag: 'Truyền thông' },
  { id: '5', name: 'GBXD_123_SGD.pdf', type: 'PDF', size: '5 MB', date: '01/02/2026', tag: 'Pháp lý' }
];

export function ProjectVaultLayer() {
  const [filter, setFilter] = useState('ALL');

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:px-12 flex flex-col gap-8 custom-scrollbar relative z-10">
       {/* Cinematic Ambient Glow */}
       <div className="fixed top-1/4 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />
       
       {/* Header */}
       <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
         <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit mb-2 shadow-sm">
             <FolderOpen size={14} className="text-indigo-500 drop-shadow-sm" />
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mt-0.5">Asset Vault</span>
           </div>
           <h2 className="text-[32px] sm:text-[40px] font-black text-sg-heading tracking-tight drop-shadow-md">
             Thư Viện Dự Án
           </h2>
           <p className="text-[14px] font-bold text-sg-subtext max-w-xl leading-relaxed">
             Kho lưu trữ số hóa Sales Kit, bản vẽ mặt bằng và hồ sơ pháp lý. Asset được phân phối trực tiếp cho bộ phận Kinh Doanh.
           </p>
         </div>

         <div className="flex items-center gap-4">
           {/* Search Box */}
           <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 blur-md transition-colors rounded-xl" />
              <div className="relative flex items-center h-12 bg-white/60 dark:bg-black/40 border border-slate-200/80 dark:border-white/10 rounded-xl px-4 backdrop-blur-md w-72 transition-all group-hover:border-indigo-500/30 shadow-sm">
                 <Search size={16} className="text-sg-muted" />
                 <input 
                   type="text" 
                   placeholder="Tìm tên file, định dạng..." 
                   className="bg-transparent border-none outline-none text-[13px] font-bold text-sg-heading ml-3 flex-1 placeholder:text-sg-muted/70"
                 />
              </div>
           </div>
           
           <button className="h-12 px-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-black text-[13px] shadow-[0_8px_24px_rgba(99,102,241,0.25)] hover:-translate-y-1 transition-all flex items-center gap-2 border border-indigo-400">
             <Plus size={16} /> Upload File
           </button>
         </div>
       </div>

       {/* Filters */}
       <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-sg-border/60">
         {['ALL', 'Truyền thông', 'Bản vẽ', 'Bán hàng', 'Pháp lý'].map(tag => (
           <button 
             key={tag}
             onClick={() => setFilter(tag)}
             className={`px-4 py-2 rounded-lg text-[12px] font-black uppercase tracking-wider transition-all ${
               filter === tag 
                 ? 'bg-indigo-500 text-white shadow-md' 
                 : 'bg-sg-btn-bg text-sg-muted hover:bg-slate-200 dark:hover:bg-white/10 border border-sg-border'
             }`}
           >
             {tag === 'ALL' ? 'Tất cả' : tag}
           </button>
         ))}
       </div>

       {/* File Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
         {MOCK_ASSETS.filter(a => filter === 'ALL' || a.tag === filter).map(asset => {
           const Icon = asset.type === 'IMAGE' ? ImageIcon : FileText;
           const colorClass = asset.type === 'PDF' ? 'text-rose-500' : asset.type === 'IMAGE' ? 'text-blue-500' : 'text-amber-500';
           const bgClass = asset.type === 'PDF' ? 'bg-rose-500/10' : asset.type === 'IMAGE' ? 'bg-blue-500/10' : 'bg-amber-500/10';
           
           return (
             <div key={asset.id} className="bg-white/60 dark:bg-black/40 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 rounded-sg-xl p-5 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer relative overflow-hidden">
               
               {/* Hover Glow */}
               <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${bgClass.replace('/10', '/30')}`} />
               
               <div className="flex items-start justify-between relative z-10 mb-6">
                 <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center border shadow-inner ${bgClass} ${colorClass} ${bgClass.replace('/10', '/20').replace('bg-', 'border-')}`}>
                   <Icon size={24} />
                 </div>
                 <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/5 flex items-center justify-center text-sg-muted transition-colors opacity-0 group-hover:opacity-100">
                   <MoreVertical size={16} />
                 </button>
               </div>
               
               <div className="flex flex-col relative z-10 mt-auto">
                 <h4 className="text-[14px] font-black text-sg-heading leading-snug line-clamp-2 mb-2 group-hover:text-indigo-500 transition-colors" title={asset.name}>
                   {asset.name}
                 </h4>
                 
                 <div className="flex items-center justify-between text-[11px] font-bold text-sg-subtext mb-5">
                   <span className="uppercase tracking-widest">{asset.type}</span>
                   <span>{asset.size}</span>
                 </div>
                 
                 <div className="flex items-center gap-2 pt-4 border-t border-slate-200/60 dark:border-white/5">
                   <button className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg bg-sg-btn-bg hover:bg-indigo-500/10 text-sg-heading hover:text-indigo-500 font-bold text-[12px] transition-colors border border-sg-border shadow-sm">
                     <Eye size={14} /> Xem
                   </button>
                   <button className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg bg-sg-btn-bg hover:bg-indigo-500 text-sg-heading hover:text-white font-bold text-[12px] transition-colors border border-sg-border shadow-sm">
                     <Download size={14} /> Tải
                   </button>
                 </div>
               </div>
             </div>
           );
         })}
       </div>
    </div>
  );
}
