import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, Package, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useProjects, useInventory } from '../hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import type { REProject, REProduct } from '../types';

interface ProjectSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSearchModal({ isOpen, onClose }: ProjectSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ projects: REProject[]; inventory: REProduct[] }>({ projects: [], inventory: [] });
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const { data: projects } = useProjects();
  const { data: inventory } = useInventory();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults({ projects: [], inventory: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], inventory: [] });
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      
      const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.code.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      ).slice(0, 5);

      const filteredInventory = inventory.filter(i => 
        i.code.toLowerCase().includes(q) ||
        (projects.find(p => p.id === i.projectId)?.name || '').toLowerCase().includes(q)
      ).slice(0, 5);

      setResults({ projects: filteredProjects, inventory: filteredInventory });
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, projects, inventory]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-110 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl mx-4 bg-white/90 dark:bg-black/80 backdrop-blur-3xl border border-slate-200 dark:border-sg-border rounded-[28px] shadow-[0_32px_128px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Search Header */}
        <div className="p-5 border-b border-sg-border/60 flex items-center gap-4 bg-sg-bg/30">
          <Search size={22} className={isSearching ? 'text-cyan-500 animate-pulse' : 'text-sg-muted'} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Tìm dự án, mã căn, giỏ hàng..." 
            className="flex-1 bg-transparent border-none outline-none text-[18px] font-bold text-sg-heading placeholder:text-sg-muted/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching ? (
            <Loader2 size={18} className="animate-spin text-cyan-500" />
          ) : query ? (
            <button onClick={() => setQuery('')} className="w-8 h-8 rounded-full hover:bg-sg-bg flex items-center justify-center transition-colors">
              <X size={16} className="text-sg-muted" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 opacity-40">
               <kbd className="px-2 py-1 rounded bg-sg-card border border-sg-border text-[10px] font-black text-sg-heading">ESC</kbd>
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {!query.trim() ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-linear-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <Search size={28} className="text-cyan-500 opacity-60" strokeWidth={1.5} />
              </div>
              <h3 className="text-[17px] font-black text-sg-heading tracking-tight">Trung Tâm Tìm Kiếm Dữ Liệu</h3>
              <p className="text-[13px] font-semibold text-sg-muted mt-2 max-w-[280px] mx-auto leading-relaxed">
                Nhập tên dự án, mã sản phẩm hoặc vị trí để truy xuất nhanh thông tin rổ hàng.
              </p>
            </div>
          ) : results.projects.length === 0 && results.inventory.length === 0 && !isSearching ? (
             <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
                  <X size={28} className="text-rose-500 opacity-60" strokeWidth={1.5} />
                </div>
                <h3 className="text-[17px] font-black text-sg-heading tracking-tight">Không tìm thấy kết quả</h3>
                <p className="text-[13px] font-semibold text-sg-muted mt-2">Thử với từ khóa khác hoặc kiểm tra lại chính tả.</p>
             </div>
          ) : (
            <div className="flex flex-col gap-6 p-3">
              {/* Projects Section */}
              {results.projects.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 mb-1">
                    <Building2 size={12} className="text-cyan-500" />
                    <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[2px]">Dự Án ({results.projects.length})</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {results.projects.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => handleNavigate(`/ProjectModule/board?id=${p.id}`)}
                        className="group flex items-center justify-between p-3.5 rounded-2xl hover:bg-linear-to-r hover:from-cyan-500/10 hover:to-blue-600/5 border border-transparent hover:border-cyan-500/20 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-sg-bg dark:bg-black/40 flex items-center justify-center border border-sg-border group-hover:border-cyan-500/30 group-hover:scale-110 transition-all">
                             <Building2 size={18} className="text-sg-muted group-hover:text-cyan-500 transition-colors" />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-[15px] font-black text-sg-heading tracking-tight group-hover:text-cyan-500 transition-colors">{p.name}</span>
                            <span className="text-[11px] font-bold text-sg-muted uppercase tracking-[1px]">{p.code} • {p.location}</span>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-sg-muted opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory Section */}
              {results.inventory.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 mb-1">
                    <Package size={12} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[2px]">Sản phẩm ({results.inventory.length})</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {results.inventory.map(i => {
                      const pName = projects.find(p => p.id === i.projectId)?.name || 'Dự án';
                      return (
                        <button 
                          key={i.id}
                          onClick={() => handleNavigate(`/ProjectModule/inventory?project=${i.projectId}&code=${i.code}`)}
                          className="group flex items-center justify-between p-3.5 rounded-2xl hover:bg-linear-to-r hover:from-blue-500/10 hover:to-indigo-600/5 border border-transparent hover:border-blue-500/20 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-sg-bg dark:bg-black/40 flex items-center justify-center border border-sg-border group-hover:border-blue-500/30 group-hover:scale-110 transition-all">
                               <Package size={18} className="text-sg-muted group-hover:text-blue-500 transition-colors" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-[15px] font-black text-sg-heading tracking-tight group-hover:text-blue-500 transition-colors">{i.code}</span>
                              <span className="text-[11px] font-bold text-sg-muted uppercase tracking-[1px]">{pName} • {i.type}</span>
                            </div>
                          </div>
                          <ArrowRight size={16} className="text-sg-muted opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sg-border/60 bg-sg-bg/10 flex items-center justify-between px-6">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <kbd className="px-1.5 py-0.5 rounded bg-sg-card border border-sg-border text-[9px] font-bold text-sg-subtext">↵</kbd>
                 <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Chọn</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <kbd className="px-1.5 py-0.5 rounded bg-sg-card border border-sg-border text-[9px] font-bold text-sg-subtext">↑↓</kbd>
                 <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Di chuyển</span>
              </div>
           </div>
           <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">SGroup Unified Search</span>
        </div>
      </div>
    </div>
  );
}
