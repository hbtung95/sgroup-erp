"use client";

import { useEffect, useState, useMemo, use } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css"; 
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ArrowLeft, Lock, Unlock, Zap, FileSpreadsheet, Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { ImportExcelModal } from "./ImportExcelModal";
import { LegalDocsPanel } from "./LegalDocsPanel";
import * as xlsx from "xlsx";

type Product = {
  id: string;
  projectId: string;
  code: string;
  block: string;
  floor: number;
  area: number;
  price: number;
  direction: string;
  bedrooms: number;
  status: string;
  bookedBy: string | null;
  lockedUntil: string | null;
  customerPhone: string | null;
};

type Project = {
  id: string;
  name: string;
  status: string;
  totalUnits: number;
  soldUnits: number;
  feeRate: number;
  avgPrice: number;
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const [project, setProject] = useState<Project | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Default cols
  const columnDefs = useMemo<ColDef[]>(() => [
    { field: "code", headerName: "Mã Căn", filter: true, sortable: true, width: 120 },
    { field: "block", headerName: "Tòa/Khu", filter: true, width: 120 },
    { field: "floor", headerName: "Tầng", filter: true, width: 100 },
    { field: "bedrooms", headerName: "PN", width: 80 },
    { field: "area", headerName: "DT (m2)", width: 100 },
    { field: "price", headerName: "Giá (Tỷ)", filter: true, width: 120, valueFormatter: (p: any) => p.value ? `${Number(p.value).toLocaleString()} Tỷ` : '' },
    { field: "status", headerName: "Trạng thái", filter: true, width: 150, cellRenderer: (params: any) => {
        const val = params.value;
        const colorMap: any = {
          'AVAILABLE': 'bg-green-100 text-green-800 border-green-200',
          'LOCKED': 'bg-yellow-100 text-yellow-800 border-yellow-200',
          'BOOKED': 'bg-orange-100 text-orange-800 border-orange-200',
          'DEPOSIT': 'bg-blue-100 text-blue-800 border-blue-200',
          'SOLD': 'bg-purple-100 text-purple-800 border-purple-200',
        };
        return <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colorMap[val] || 'bg-gray-100'}`}>{val}</span>;
    }},
    { field: "bookedBy", headerName: "Giữ chỗ bởi", width: 150 },
    { headerName: "Hành động", width: 150, cellRenderer: (params: any) => {
        const data = params.data;
        if(data.status === 'AVAILABLE') {
            return <button onClick={() => handleLock(data.id)} className="flex items-center text-xs bg-gray-900 text-white px-2 py-1 rounded hover:bg-gray-700 transition"><Lock className="w-3 h-3 mr-1" /> Lock</button>
        }
        if(data.status === 'LOCKED') {
            return (
               <div className="flex gap-1">
                 <button onClick={() => handleDeposit(data.id)} className="flex items-center text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition">Cọc</button>
                 <button onClick={() => handleUnlock(data.id)} className="flex items-center text-xs border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition"><Unlock className="w-3 h-3" /></button>
               </div>
            )
        }
        if(data.status === 'DEPOSIT') {
            return <button onClick={() => handleSold(data.id)} className="flex items-center text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition">Bán</button>
        }
        return null;
    }}
  ], []);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, prodRes] = await Promise.all([
        axios.get(`http://localhost:8081/api/v1/projects/${projectId}`),
        axios.get(`http://localhost:8081/api/v1/projects/${projectId}/products?limit=1000`)
      ]);
      setProject(projRes.data.data);
      setProducts(prodRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async (id: string) => {
    try {
        await axios.post(`http://localhost:8081/api/v1/products/${id}/lock`, { bookedBy: "Current User" }, {
            headers: { "Authorization": "Bearer mock-sales-token" }
        });
        alert("Lock căn thành công!");
        fetchData();
    } catch(e: any) {
        alert(e.response?.data?.error?.message || "Lỗi lock căn");
    }
  };

  const handleUnlock = async (id: string) => {
    try {
        await axios.post(`http://localhost:8081/api/v1/products/${id}/unlock`, { requestedBy: "Current User", isAdmin: true }, {
            headers: { "Authorization": "Bearer mock-admin-token" }
        });
        alert("Mở lock căn thành công!");
        fetchData();
    } catch(e: any) {
        alert(e.response?.data?.error?.message || "Lỗi mở lock căn");
    }
  };

  const handleDeposit = async (id: string) => {
    try {
        await axios.post(`http://localhost:8081/api/v1/products/${id}/deposit`, { requestedBy: "Current User" }, {
            headers: { "Authorization": "Bearer mock-sales-token" }
        });
        alert("Vào cọc thành công!");
        fetchData();
    } catch(e: any) {
        alert(e.response?.data?.error?.message || "Lỗi vào cọc");
    }
  };

  const handleSold = async (id: string) => {
    try {
        await axios.post(`http://localhost:8081/api/v1/products/${id}/sold`, { requestedBy: "Current User" }, {
            headers: { "Authorization": "Bearer mock-sales-token" }
        });
        alert("Bán thành công! API ngầm sẽ sync metadata dự án.");
        fetchData();
    } catch(e: any) {
        alert(e.response?.data?.error?.message || "Lỗi hoàn tất giao dịch");
    }
  };

  const handleExportExcel = () => {
    if (!products.length) return;
    const exportData = products.map((p) => ({
      "Mã Căn": p.code,
      "Tòa/Block": p.block,
      "Tầng": p.floor,
      "Diện Tích (m2)": p.area,
      "Giá (Tỷ)": p.price,
      "Trạng Thái": p.status,
      "Người Giữ Chỗ": p.bookedBy || "",
    }));
    
    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Bang_Hang");
    
    xlsx.writeFile(wb, `BangHang_${project?.name?.replace(/\s+/g, '_') || 'Export'}.xlsx`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">Không tìm thấy dự án</div>;

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto flex flex-col h-screen">
      <div className="flex items-center mb-6">
        <Link href="/projects" className="mr-4 p-2 rounded-full glass-button text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500">{project.name}</h1>
             <span className={`px-2 py-1 text-xs font-semibold rounded-md ${project.status === 'ACTIVE' ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}`}>
                {project.status}
             </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 font-medium bg-white/30 backdrop-blur inline-block px-3 py-1 rounded-full border">
             Phí môi giới: <span className="text-blue-600">{project.feeRate}%</span> | Giỏ hàng: <span className="text-green-600">{project.soldUnits} / {project.totalUnits}</span> căn
          </p>
        </div>
        <div className="ml-auto flex gap-2">
            <button onClick={handleExportExcel} className="glass-button flex items-center text-sm px-4 py-2.5 rounded-xl font-medium text-gray-800 bg-white/50 border border-gray-200">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-indigo-600" />
                Xuất Excel
            </button>
            <button onClick={() => setIsImportOpen(true)} className="glass-button flex items-center text-sm px-4 py-2.5 rounded-xl font-medium text-gray-800">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                Import Excel
            </button>
            <button className="glass-button flex items-center text-sm px-4 py-2.5 bg-blue-600/90 text-white rounded-xl font-medium hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Căn
            </button>
        </div>
      </div>

      <ImportExcelModal 
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        projectId={projectId}
        onSuccess={fetchData}
      />

      <div className="flex-1 glass-card border-none rounded-2xl overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-5 border-b bg-white/40 backdrop-blur-md flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2 text-gray-800">
                  <Zap className="w-5 h-5 text-orange-500 fill-current" /> Bảng Hàng Trực Tuyến
              </h2>
              <span className="text-xs font-medium bg-green-500/10 text-green-700 px-3 py-1 rounded-full">
                Auto-sync enabled
              </span>
          </div>
          <div className="ag-theme-alpine w-full flex-1" style={{ "--ag-background-color": "transparent", "--ag-header-background-color": "rgba(255,255,255,0.5)", "--ag-row-border-color": "rgba(0,0,0,0.05)" } as React.CSSProperties}>
             <AgGridReact
                rowData={products}
                columnDefs={columnDefs}
                defaultColDef={{ resizable: true, flex: 1, minWidth: 100 }}
                animateRows={true}
                rowSelection="multiple"
             />
          </div>
      </div>

      {/* Tabs Layout with Legal Docs below */}
      <LegalDocsPanel projectId={projectId} />

    </div>
  );
}
