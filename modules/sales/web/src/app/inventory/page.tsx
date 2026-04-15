"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Filter, ChevronRight, Handshake } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-alpine.css";

import { MOCK_PROJECTS, MOCK_PRODUCTS, requestLock, HR_SALES_STAFF } from "../../lib/salesMocks";
import type { SalesProject, InventoryProduct } from "../../lib/types";
import ProjectSidebar from "../../components/inventory/ProjectSidebar";

export default function InventoryPage() {
  const [projects, setProjects] = useState<SalesProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SalesProject | null>(null);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchProducts = useCallback(async (projectId: string, proj: SalesProject) => {
    setSelectedProject(proj);
    setTimeout(() => {
       setProducts([...MOCK_PRODUCTS.filter(p => p.projectId === projectId)]);
    }, 300);
  }, []);

  useEffect(() => {
    setProjects([...MOCK_PROJECTS]);
    if (MOCK_PROJECTS.length > 0) void fetchProducts(MOCK_PROJECTS[0].id, MOCK_PROJECTS[0]);
  }, [fetchProducts]);

  const handleRequestLock = useCallback(async (productData: InventoryProduct) => {
      setIsSyncing(true);
      try {
          await requestLock(productData);
          if (selectedProject) void fetchProducts(selectedProject.id, selectedProject);
          alert(`Đã gửi yêu cầu giữ chỗ căn: ${productData.code}. Người tạo: ${HR_SALES_STAFF.name}`);
      } catch {
          alert("Lỗi yêu cầu giữ chỗ");
      } finally {
          setIsSyncing(false);
      }
  }, [selectedProject, fetchProducts]);

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: "code", headerName: "Mã Căn", filter: true, sortable: true, width: 120 },
    { field: "block", headerName: "Tòa/Khu", filter: true, width: 100 },
    { field: "floor", headerName: "Tầng", filter: true, width: 90 },
    { field: "area", headerName: "DT (m2)", width: 100 },
    { field: "price", headerName: "Giá (Tỷ)", filter: true, width: 120, valueFormatter: (p: ValueFormatterParams<InventoryProduct>) => p.value ? `${Number(p.value).toLocaleString()} Tỷ` : '' },
    { field: "status", headerName: "Trạng thái", filter: true, width: 130, cellRenderer: (params: ICellRendererParams<InventoryProduct>) => {
        const val = params.value;
        if(val === 'AVAILABLE') return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-wider">{val}</span>;
        if(val === 'LOCKED') return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-[11px] font-bold rounded-full border border-amber-500/20 uppercase tracking-wider">{val}</span>;
        if(val === 'DEPOSIT') return <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[11px] font-bold rounded-full border border-indigo-500/20 uppercase tracking-wider">{val}</span>;
        return <span className="px-3 py-1 bg-slate-500/10 text-slate-400 text-[11px] font-bold rounded-full border border-slate-500/20 uppercase tracking-wider">{val}</span>;
    }},
    { headerName: "Thao tác", width: 150, cellRenderer: (params: ICellRendererParams<InventoryProduct>) => {
        const data = params.data;
        if (data?.status === 'AVAILABLE') {
            return (
                <button 
                  onClick={() => handleRequestLock(data)} 
                  disabled={isSyncing}
                  className="flex items-center text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium border border-white/10 px-3 py-1.5 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition shadow-[0_4px_15px_rgba(59,130,246,0.3)] w-full h-full justify-center group"
                >
                  <Handshake className="w-3.5 h-3.5 mr-1.5 opacity-70 group-hover:opacity-100" /> Lock Căn
                </button>
            )
        }
        return <span className="text-xs text-slate-500 italic flex items-center h-full"><ChevronRight className="w-3 h-3 mr-1"/>Không khả dụng</span>;
    }}
  ], [handleRequestLock, isSyncing]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[85vh] antialiased">
      <ProjectSidebar projects={projects} selectedProject={selectedProject} onSelectProject={fetchProducts} />

      {/* Main Grid Container */}
      <div className="flex-1 glass-card rounded-3xl overflow-hidden flex flex-col relative w-full">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
         
         {/* Top bar */}
         <div className="p-6 border-b border-white/10 flex flex-col bg-white/[0.01]">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                 <div>
                    <h2 className="font-extrabold text-2xl text-white flex items-center gap-3 tracking-tight">
                        {selectedProject ? selectedProject.name : "Rổ Hàng Toàn Cầu"}
                        {selectedProject && (
                            <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.2)]">Live Data</span>
                        )}
                    </h2>
                    {selectedProject && (
                        <p className="text-slate-400 text-sm mt-1.5 font-medium">Fee môi giới chuẩn: <strong className="text-emerald-400 ml-1">{selectedProject.feeRate}%</strong></p>
                    )}
                 </div>
                 <button className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 hover:shadow-lg backdrop-blur-md">
                     <Filter className="w-4 h-4 text-indigo-400" /> Bộ lọc Sản Phẩm
                 </button>
             </div>

             {/* Analytics Pills */}
             <div className="flex flex-wrap gap-3">
                 <div className="bg-slate-800/50 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">Tổng căn:</span>
                    <strong className="text-white text-sm">{products.length}</strong>
                 </div>
                 <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-400/80 font-medium text-xs uppercase tracking-wider">Trống:</span>
                    <strong className="text-emerald-400 text-sm">{products.filter(p => p.status === 'AVAILABLE').length}</strong>
                 </div>
                 <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-2 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-amber-400/80 font-medium text-xs uppercase tracking-wider">Đang Khóa:</span>
                    <strong className="text-amber-400 text-sm">{products.filter(p => p.status === 'LOCKED' || p.status === 'PENDING_LOCK').length}</strong>
                 </div>
             </div>
         </div>

         {/* Ag-Grid */}
         <div className="ag-theme-alpine-dark w-full flex-1 custom-ag-grid">
             <AgGridReact
                rowData={products}
                columnDefs={columnDefs}
                defaultColDef={{ resizable: true, flex: 1, minWidth: 100 }}
                animateRows={true}
                pagination={true}
                paginationPageSize={50}
                rowHeight={60}
                headerHeight={50}
             />
         </div>
      </div>
    </div>
  );
}
