"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, Building, MapPin, Handshake, Filter } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function InventoryPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  // This will fetch from 8081 (Project Module API)
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/v1/projects");
      if (res.data.data) {
        setProjects(res.data.data);
        if (res.data.data.length > 0) {
            fetchProducts(res.data.data[0].id, res.data.data[0]);
        }
      }
    } catch(e) {
      console.log("Failed to fetch projects, using fallback UI");
    }
  };

  const fetchProducts = async (projectId: string, proj: any) => {
    setSelectedProject(proj);
    try {
      const res = await axios.get(`http://localhost:8081/api/v1/projects/${projectId}/products?limit=500`);
      if (res.data.data) {
          setProducts(res.data.data);
      }
    } catch(e) {
        console.log("Failed to fetch products");
    }
  };

  const handleRequestLock = async (productData: any) => {
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
      } catch(e) {
          alert("Lỗi yêu cầu giữ chỗ");
      }
  };

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: "code", headerName: "Mã Căn", filter: true, sortable: true, width: 120 },
    { field: "block", headerName: "Tòa/Khu", filter: true, width: 100 },
    { field: "floor", headerName: "Tầng", filter: true, width: 90 },
    { field: "area", headerName: "DT (m2)", width: 100 },
    { field: "price", headerName: "Giá (Tỷ)", filter: true, width: 120, valueFormatter: (p: any) => p.value ? `${Number(p.value).toLocaleString()} Tỷ` : '' },
    { field: "status", headerName: "Trạng thái", filter: true, width: 130, cellRenderer: (params: any) => {
        const val = params.value;
        if(val === 'AVAILABLE') return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded border border-green-200">{val}</span>;
        if(val === 'LOCKED') return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded border border-yellow-200">{val}</span>;
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded border border-gray-200">{val}</span>;
    }},
    { headerName: "Thao tác", width: 150, cellRenderer: (params: any) => {
        const data = params.data;
        if(data.status === 'AVAILABLE') {
            return (
                <button 
                  onClick={() => handleRequestLock(data)} 
                  className="flex items-center text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition shadow-sm w-full h-full justify-center"
                >
                  <Handshake className="w-3 h-3 mr-1" /> Yêu cầu Lock
                </button>
            )
        }
        return <span className="text-xs text-gray-400 italic">Không khả dụng</span>;
    }}
  ], []);

  return (
    <div className="flex gap-6 h-[90vh]">
      {/* Sidebar Projects */}
      <div className="w-80 glass-panel rounded-3xl flex flex-col overflow-hidden border border-white p-4">
         <h2 className="font-extrabold text-xl text-slate-800 mb-4 flex items-center">
             <Building className="w-5 h-5 mr-2 text-indigo-600" /> Chọn Dự Án
         </h2>
         <div className="relative mb-4">
             <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
             <input placeholder="Tìm nhanh..." className="w-full bg-white/50 border border-white rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
         </div>
         <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
             {projects.map(p => (
                 <div 
                   key={p.id} 
                   onClick={() => fetchProducts(p.id, p)}
                   className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedProject?.id === p.id ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' : 'bg-white/40 hover:bg-white text-slate-700 border-white/60 hover:border-indigo-200 hover:shadow-sm'}`}
                 >
                     <p className="font-bold mb-1">{p.name}</p>
                     <p className={`text-xs flex items-center ${selectedProject?.id === p.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                         <MapPin className="w-3 h-3 mr-1" /> {p.location || 'Bình Thuận'}
                     </p>
                 </div>
             ))}
             {projects.length === 0 && (
                 <div className="text-center p-4 text-slate-400 italic text-sm">Chưa có dự án nào</div>
             )}
         </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col border border-white relative">
         {/* Top bar */}
         <div className="bg-white/40 backdrop-blur-md p-5 border-b border-white z-10 flex justify-between items-center">
             <div>
                <h2 className="font-extrabold text-2xl text-slate-800 flex items-center gap-3">
                    {selectedProject ? selectedProject.name : "Rổ Hàng Online"}
                    {selectedProject && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-md">Live Sync</span>
                    )}
                </h2>
                {selectedProject && (
                    <p className="text-slate-500 text-sm mt-1">Đang hiển thị {products.length} sản phẩm - Phí môi giới (Fee Rate): <strong className="text-indigo-600">{selectedProject.feeRate}%</strong></p>
                )}
             </div>
             
             <button className="glass-button px-4 py-2 rounded-lg text-sm font-bold text-slate-700 flex items-center gap-2">
                 <Filter className="w-4 h-4" /> Bộ lọc Nâng Cao
             </button>
         </div>

         {/* Ag-Grid */}
         <div className="ag-theme-alpine w-full flex-1" style={{ "--ag-background-color": "transparent", "--ag-header-background-color": "rgba(255,255,255,0.7)", "--ag-row-border-color": "rgba(0,0,0,0.05)" } as React.CSSProperties}>
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
