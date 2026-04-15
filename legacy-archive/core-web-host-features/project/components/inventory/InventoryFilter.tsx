import React from 'react';
import { Search, Grid, LayoutList, Download, Building2 } from 'lucide-react';
import { RE_INVENTORY_STATUS } from '../../constants';
import type { REProject } from '../../types';

export interface InventoryFiltersType {
  search: string;
  statusFilter: string;
  projectFilter: string;
  directionFilter: string;
  bedroomFilter: string;
  minPrice: string;
  maxPrice: string;
  minArea: string;
  maxArea: string;
}

interface InventoryFilterProps {
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
  viewMode: 'grid' | 'list' | 'floor';
  setViewMode: (mode: 'grid' | 'list' | 'floor') => void;
  projects: REProject[];
  stats: {
    total: number;
    avail: number;
    locked: number;
    sold: number;
  };
}

export function InventoryFilter({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  projects,
  stats
}: InventoryFilterProps) {
  
  const h = (key: keyof InventoryFiltersType, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-fit mb-2">
           <Grid size={14} className="text-cyan-500" />
           <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Master Inventory</span>
        </div>
        <h2 className="text-[32px] font-black text-sg-heading tracking-tight drop-shadow-md">Rổ Hàng Tổng</h2>
        
        {/* Mini-Stats Dashboard */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 w-64 h-2 bg-sg-border rounded-full overflow-hidden flex">
            <div style={{ width: `${(stats.avail / (stats.total || 1)) * 100}%` }} className="h-full bg-emerald-500" />
            <div style={{ width: `${(stats.locked / (stats.total || 1)) * 100}%` }} className="h-full bg-orange-500" />
            <div style={{ width: `${(stats.sold / (stats.total || 1)) * 100}%` }} className="h-full bg-rose-500" />
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="text-emerald-500">{stats.avail} Trống</span>
            <span className="text-orange-500">{stats.locked} Giữ chỗ</span>
            <span className="text-rose-500">{stats.sold} Đã bán</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative group hidden sm:block">
          <div className="absolute inset-0 bg-linear-to-r from-cyan-500/0 via-blue-500/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity" />
          <div className="relative flex items-center h-12 bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-sg-border hover:border-cyan-500/30 rounded-xl px-4 transition-colors w-64 shadow-sm">
            <Search size={18} className="text-sg-muted group-hover:text-cyan-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Tra cứu mã căn..." 
              className="bg-transparent border-none outline-none ml-3 text-[14px] font-semibold text-sg-heading w-full placeholder:text-sg-muted"
              value={filters.search}
              onChange={e => h('search', e.target.value)}
            />
          </div>
        </div>
        
        {/* Project Select */}
        <select 
          value={filters.projectFilter}
          onChange={e => h('projectFilter', e.target.value)}
          className="h-12 px-4 pr-10 bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-sg-border rounded-xl text-[14px] font-bold text-sg-heading appearance-none cursor-pointer focus:outline-none hover:border-cyan-500/30 transition-colors shadow-sm"
        >
          <option value="ALL">Tất cả Dự án</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Status Select */}
        <select 
          value={filters.statusFilter}
          onChange={e => h('statusFilter', e.target.value)}
          className="h-12 px-4 pr-10 bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-sg-border rounded-xl text-[14px] font-bold text-sg-heading appearance-none cursor-pointer focus:outline-none hover:border-cyan-500/30 transition-colors shadow-sm"
        >
          <option value="ALL">Tình trạng</option>
          {Object.entries(RE_INVENTORY_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {/* Direction Select */}
        <select 
          value={filters.directionFilter}
          onChange={e => h('directionFilter', e.target.value)}
          className="h-12 px-4 pr-10 bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-sg-border rounded-xl text-[14px] font-bold text-sg-heading appearance-none cursor-pointer focus:outline-none hover:border-cyan-500/30 transition-colors shadow-sm hidden md:block"
        >
          <option value="ALL">Hướng</option>
          <option value="Đông">Đông</option>
          <option value="Tây">Tây</option>
          <option value="Nam">Nam</option>
          <option value="Bắc">Bắc</option>
          <option value="Đông Nam">Đông Nam</option>
          <option value="Tây Bắc">Tây Bắc</option>
        </select>

        {/* Bedroom Select */}
        <select 
          value={filters.bedroomFilter}
          onChange={e => h('bedroomFilter', e.target.value)}
          className="h-12 px-4 pr-10 bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-sg-border rounded-xl text-[14px] font-bold text-sg-heading appearance-none cursor-pointer focus:outline-none hover:border-cyan-500/30 transition-colors shadow-sm hidden lg:block"
        >
          <option value="ALL">Phòng ngủ</option>
          <option value="1">1 PN</option>
          <option value="2">2 PN</option>
          <option value="3">3 PN</option>
          <option value="4">4 PN</option>
        </select>



        {/* View Toggles */}
        <div className="h-12 flex items-center bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-sg-border rounded-xl p-1 shadow-sm">
           <button 
              onClick={() => setViewMode('grid')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-cyan-500/10 text-cyan-500 font-bold' : 'text-sg-subtext hover:bg-sg-bg hover:text-sg-heading'}`}
              title="Lưới"
           >
              <Grid size={18} />
           </button>
           <button 
              onClick={() => setViewMode('floor')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'floor' ? 'bg-cyan-500/10 text-cyan-500 font-bold' : 'text-sg-subtext hover:bg-sg-bg hover:text-sg-heading'}`}
              title="Sơ đồ tầng"
           >
              <Building2 size={18} />
           </button>
           <button 
              onClick={() => setViewMode('list')}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-cyan-500/10 text-cyan-500 font-bold' : 'text-sg-subtext hover:bg-sg-bg hover:text-sg-heading'}`}
              title="Danh sách"
           >
              <LayoutList size={18} />
           </button>
        </div>
        
        <button className="h-12 w-12 flex items-center justify-center bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-sg-border hover:border-cyan-500/30 rounded-xl transition-all shadow-sm group">
          <Download size={20} className="text-cyan-500 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
