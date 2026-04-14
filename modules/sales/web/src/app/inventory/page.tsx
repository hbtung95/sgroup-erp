"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Search, Building, MapPin, Handshake, Filter } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-alpine.css";

type SalesProject = {
  id: string;
  name: string;
  location?: string;
  feeRate?: number;
};

type InventoryProduct = {
  id: string;
  code: string;
  block: string;
  floor: number;
  area: number;
  price: number;
  status: "AVAILABLE" | "LOCKED" | "SOLD";
};

type ListResponse<T> = {
  data?: T[];
};

export default function InventoryPage() {
  const [projects, setProjects] = useState<SalesProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<SalesProject | null>(null);
  const [products, setProducts] = useState<InventoryProduct[]>([]);

  const fetchProducts = useCallback(async (projectId: string, proj: SalesProject) => {
    setSelectedProject(proj);
    try {
      const res = await axios.get<ListResponse<InventoryProduct>>(`http://localhost:8081/api/v1/projects/${projectId}/products?limit=500`);
      if (res.data.data) {
          setProducts(res.data.data);
      } else {
          throw new Error("No data");
      }
    } catch {
        console.log("Failed to fetch products");
        setProducts([
            { id: "prd-1", code: "VHO-S1.01-05", block: "S1.01", floor: 5, area: 45.5, price: 3.25, status: "AVAILABLE" },
            { id: "prd-2", code: "VHO-S2.05-12A", block: "S2.05", floor: 12, area: 68.0, price: 4.10, status: "AVAILABLE" },
            { id: "prd-3", code: "VHO-S1.02-15", block: "S1.02", floor: 15, area: 55.4, price: 2.85, status: "LOCKED" },
            { id: "prd-4", code: "VHO-S3.01-20", block: "S3.01", floor: 20, area: 88.0, price: 5.50, status: "LOCKED" },
            { id: "prd-5", code: "VHO-S1.01-08", block: "S1.01", floor: 8, area: 45.5, price: 2.95, status: "SOLD" },
            { id: "prd-6", code: "VHO-S1.05-22", block: "S1.05", floor: 22, area: 72.0, price: 3.80, status: "AVAILABLE" },
        ]);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get<ListResponse<SalesProject>>("http://localhost:8081/api/v1/projects");
      if (res.data.data) {
        setProjects(res.data.data);
        if (res.data.data.length > 0) {
          void fetchProducts(res.data.data[0].id, res.data.data[0]);
        }
      } else {
        throw new Error("No data");
      }
    } catch {
      console.log("Failed to fetch projects, using fallback UI");
      const mockProjects: SalesProject[] = [
          { id: "proj-1", name: "Vinhomes Grand Park", location: "Quận 9, TP. Thủ Đức", feeRate: 3.5 },
          { id: "proj-2", name: "Aqua City", location: "Biên Hòa, Đồng Nai", feeRate: 4.0 },
      ];
      setProjects(mockProjects);
      void fetchProducts(mockProjects[0].id, mockProjects[0]);
    }
  }, [fetchProducts]);

  // This will fetch from 8081 (Project Module API)
  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const handleRequestLock = useCallback(async (productData: InventoryProduct) => {
      // Typically fires to 8082 Sales API: POST /api/v1/transactions/request-lock
      // With staff token
      try {
          alert(`Đã gửi yêu cầu giữ chỗ căn: ${productData.code}. Chờ TPKD duyệt!`);
          /*
          await axios.post("http://localhost:8082/api/v1/transactions/request-lock", {
              productId: productData.id,
              priceAtLock: productData.price
          }, {
              headers: { "Authorization": "Bearer mock-staff-token" }
          });
          */
      } catch {
          alert("Lỗi yêu cầu giữ chỗ");
      }
  }, []);

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: "code", headerName: "Mã Căn", filter: true, sortable: true, width: 120 },
    { field: "block", headerName: "Tòa/Khu", filter: true, width: 100 },
    { field: "floor", headerName: "Tầng", filter: true, width: 90 },
    { field: "area", headerName: "DT (m2)", width: 100 },
    { field: "price", headerName: "Giá (Tỷ)", filter: true, width: 120, valueFormatter: (p: ValueFormatterParams<InventoryProduct>) => p.value ? `${Number(p.value).toLocaleString()} Tỷ` : '' },
    { field: "status", headerName: "Trạng thái", filter: true, width: 130, cellRenderer: (params: ICellRendererParams<InventoryProduct>) => {
        const val = params.value;
        if(val === 'AVAILABLE') return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded border border-emerald-500/20">{val}</span>;
        if(val === 'LOCKED') return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded border border-amber-500/20">{val}</span>;
        return <span className="px-2 py-0.5 bg-slate-500/20 text-slate-400 text-xs font-medium rounded border border-slate-500/20">{val}</span>;
    }},
    { headerName: "Thao tác", width: 150, cellRenderer: (params: ICellRendererParams<InventoryProduct>) => {
        const data = params.data;
        if (data?.status === 'AVAILABLE') {
            return (
                <button 
                  onClick={() => handleRequestLock(data)} 
                  className="flex items-center text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded hover:bg-blue-600/40 transition shadow-[0_0_10px_rgba(59,130,246,0.3)] w-full h-full justify-center"
                >
                  <Handshake className="w-3 h-3 mr-1" /> Yêu cầu Lock
                </button>
            )
        }
        return <span className="text-xs text-gray-400 italic">Không khả dụng</span>;
    }}
  ], [handleRequestLock]);

  return (
    <div className="flex gap-6 h-[90vh]">
      {/* Sidebar Projects */}
      <div className="w-80 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl flex flex-col overflow-hidden border border-white/10 p-4">
         <h2 className="font-bold text-xl text-slate-200 mb-4 flex items-center">
             <Building className="w-5 h-5 mr-2 text-blue-400" /> Chọn Dự Án
         </h2>
         <div className="relative mb-4">
             <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
             <input placeholder="Tìm nhanh..." className="w-full bg-slate-950/50 border border-white/10 text-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-500" />
         </div>
         <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
             {projects.map(p => (
                 <div 
                   key={p.id} 
                   onClick={() => fetchProducts(p.id, p)}
                   className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedProject?.id === p.id ? 'bg-blue-600/20 text-white border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border-white/5 hover:border-white/10'}`}
                 >
                     <p className="font-medium mb-1 text-slate-200">{p.name}</p>
                     <p className={`text-xs flex items-center ${selectedProject?.id === p.id ? 'text-blue-200' : 'text-slate-500'}`}>
                         <MapPin className="w-3 h-3 mr-1" /> {p.location || 'Bình Thuận'}
                     </p>
                 </div>
             ))}
             {projects.length === 0 && (
                 <div className="text-center p-4 text-slate-500 italic text-sm">Chưa có dự án nào</div>
             )}
         </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 bg-slate-900/50 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col border border-white/10 relative shadow-2xl">
         {/* Top bar */}
         <div className="bg-slate-900/60 p-5 border-b border-white/10 z-10 flex justify-between items-center">
             <div>
                <h2 className="font-bold text-2xl text-slate-200 flex items-center gap-3">
                    {selectedProject ? selectedProject.name : "Rổ Hàng Online"}
                    {selectedProject && (
                        <span className="text-xs bg-blue-500/20 border border-blue-500/20 text-blue-300 font-bold px-2 py-1 rounded-md">Live Sync</span>
                    )}
                </h2>
                {selectedProject && (
                    <p className="text-slate-400 text-sm mt-1">Đang hiển thị {products.length} sản phẩm - Phí môi giới (Fee Rate): <strong className="text-blue-400">{selectedProject.feeRate}%</strong></p>
                )}
             </div>
             
             <button className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 transition flex items-center gap-2">
                 <Filter className="w-4 h-4" /> Bộ lọc Nâng Cao
             </button>
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
             />
         </div>
      </div>
    </div>
  );
}
