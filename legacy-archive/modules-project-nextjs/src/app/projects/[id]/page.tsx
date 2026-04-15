"use client";

import { useEffect, useState, useMemo, use, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, ValueFormatterParams } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ArrowLeft, Lock, Unlock, FileSpreadsheet, Zap, FileText } from "lucide-react";
import Link from "next/link";
import { ImportExcelModal } from "./ImportExcelModal";
import { LegalDocsPanel } from "./LegalDocsPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { getProject, listProducts, lockProduct, unlockProduct, depositProduct, soldProduct } from "@/lib/projectApi";
import type { Project, Product } from "@/lib/types";
import * as xlsx from "xlsx";

type ActiveTab = "inventory" | "legal";
type ConfirmActionType = "lock" | "unlock" | "deposit" | "sold";
type ConfirmAction = { type: ConfirmActionType; id: string; message: string };

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const [project, setProject] = useState<Project | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("inventory");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const columnDefs = useMemo<ColDef[]>(() => [
    { field: "code", headerName: "Mã Căn", filter: true, sortable: true, width: 120,
      cellRenderer: (params: ICellRendererParams<Product>) => (
        <span className="font-semibold text-blue-300">{params.value}</span>
      )
    },
    { field: "block", headerName: "Tòa/Khu", filter: true, width: 100 },
    { field: "floor", headerName: "Tầng", filter: true, width: 80 },
    { field: "bedrooms", headerName: "PN", width: 70 },
    { field: "area", headerName: "DT (m²)", width: 100, valueFormatter: (p: ValueFormatterParams<Product>) => p.value ? `${Number(p.value).toLocaleString()} m²` : "" },
    { field: "price", headerName: "Giá (Tỷ)", filter: true, width: 120, valueFormatter: (p: ValueFormatterParams<Product>) => p.value ? `${Number(p.value).toLocaleString()} Tỷ` : "" },
    { field: "direction", headerName: "Hướng", width: 90 },
    { field: "status", headerName: "Trạng thái", filter: true, width: 140,
      cellRenderer: (params: ICellRendererParams<Product>) => <StatusBadge status={params.value ?? ""} type="product" />
    },
    { field: "bookedBy", headerName: "Giữ chỗ bởi", width: 140 },
    { headerName: "Thao tác", width: 170, sortable: false, filter: false,
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const data = params.data;
        if (!data) return null;
        if (data.status === "AVAILABLE") {
          return (
            <button onClick={() => setConfirmAction({ type: "lock", id: data.id, message: `Khóa căn ${data.code}?` })}
              className="flex items-center text-xs bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-600 transition-all font-medium">
              <Lock className="w-3 h-3 mr-1" /> Khóa
            </button>
          );
        }
        if (data.status === "LOCKED") {
          return (
            <div className="flex gap-1.5">
              <button onClick={() => setConfirmAction({ type: "deposit", id: data.id, message: `Vào cọc căn ${data.code}?` })}
                className="text-xs bg-blue-600/80 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-all font-medium">
                Cọc
              </button>
              <button onClick={() => setConfirmAction({ type: "unlock", id: data.id, message: `Mở khóa căn ${data.code}?` })}
                className="text-xs border border-white/10 text-slate-300 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all">
                <Unlock className="w-3 h-3" />
              </button>
            </div>
          );
        }
        if (data.status === "DEPOSIT") {
          return (
            <button onClick={() => setConfirmAction({ type: "sold", id: data.id, message: `Xác nhận BÁN căn ${data.code}?` })}
              className="text-xs bg-purple-600/80 text-white px-3 py-1.5 rounded-lg hover:bg-purple-600 transition-all font-medium">
              Bán
            </button>
          );
        }
        return null;
      }
    },
  ], []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [proj, prodRes] = await Promise.all([
        getProject(projectId),
        listProducts(projectId, { limit: 1000 }),
      ]);
      setProject(proj);
      setProducts(prodRes.data || []);
    } catch {
      toast("error", "Không thể tải dữ liệu dự án");
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const executeAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      switch (confirmAction.type) {
        case "lock":
          await lockProduct(confirmAction.id, "Current User");
          toast("success", "Lock căn thành công!");
          break;
        case "unlock":
          await unlockProduct(confirmAction.id, "Current User", true);
          toast("success", "Mở lock căn thành công!");
          break;
        case "deposit":
          await depositProduct(confirmAction.id, "Current User");
          toast("success", "Vào cọc thành công!");
          break;
        case "sold":
          await soldProduct(confirmAction.id, "Current User");
          toast("success", "Giao dịch thành công! Dữ liệu dự án sẽ được đồng bộ.");
          break;
      }
      void fetchData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không rõ nguyên nhân";
      toast("error", message);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleExportExcel = () => {
    if (!products.length) return;
    const exportData = products.map((p) => ({
      "Mã Căn": p.code,
      "Tòa/Block": p.block,
      "Tầng": p.floor,
      "Diện Tích (m²)": p.area,
      "Giá (Tỷ)": p.price,
      "Hướng": p.direction,
      "Phòng Ngủ": p.bedrooms,
      "Trạng Thái": p.status,
      "Người Giữ Chỗ": p.bookedBy || "",
    }));

    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Bang_Hang");
    xlsx.writeFile(wb, `BangHang_${project?.name?.replace(/\s+/g, "_") || "Export"}.xlsx`);
    toast("success", "Xuất file Excel thành công!");
  };

  // Status summary
  const statusSummary = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => { map[p.status] = (map[p.status] || 0) + 1; });
    return map;
  }, [products]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
  if (!project) return <div className="p-8 text-center text-red-400 font-medium">Không tìm thấy dự án</div>;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in flex flex-col h-[calc(100vh-4rem)]">
      {/* Project Header */}
      <div className="flex items-center mb-6">
        <Link href="/projects" className="mr-4 p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              {project.name}
            </h1>
            <StatusBadge status={project.status} type="project" size="md" />
          </div>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-sm text-slate-500">
              Phí MG: <span className="text-blue-400 font-semibold">{project.feeRate}%</span>
            </span>
            <span className="text-sm text-slate-500">
              Giỏ hàng: <span className="text-emerald-400 font-semibold">{project.soldUnits} / {project.totalUnits}</span> căn
            </span>
            {project.avgPrice > 0 && (
              <span className="text-sm text-slate-500">
                Giá TB: <span className="text-amber-400 font-semibold">{project.avgPrice} Tỷ</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="flex items-center text-sm px-4 py-2.5 rounded-xl font-medium text-slate-300 bg-slate-800/50 border border-white/10 hover:bg-slate-700/50 transition-all">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-indigo-400" />
            Xuất Excel
          </button>
          <button onClick={() => setIsImportOpen(true)} className="flex items-center text-sm px-4 py-2.5 rounded-xl font-medium text-slate-300 bg-slate-800/50 border border-white/10 hover:bg-slate-700/50 transition-all">
            <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-400" />
            Nhập Excel
          </button>
        </div>
      </div>

      {/* Status Summary Bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(statusSummary).map(([status, count]) => (
          <div key={status} className="flex items-center gap-1.5">
            <StatusBadge status={status} type="product" />
            <span className="text-xs font-bold text-slate-300">{count}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-900/30 border border-white/5 rounded-xl p-1 w-fit">
        {([
          { key: "inventory", label: "Bảng Hàng", icon: Zap },
          { key: "legal", label: "Pháp Lý", icon: FileText },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? "bg-blue-500/20 text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "inventory" && (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col flex-1 min-h-[400px]">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2 text-slate-200">
              <Zap className="w-5 h-5 text-orange-400 fill-current" /> Bảng Hàng Trực Tuyến
            </h2>
            <span className="text-xs font-medium bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              {products.length} sản phẩm
            </span>
          </div>
          <div className="ag-theme-alpine ag-dark-override w-full flex-1">
            <AgGridReact
              rowData={products}
              columnDefs={columnDefs}
              defaultColDef={{ resizable: true, flex: 1, minWidth: 80 }}
              animateRows={true}
              rowSelection="multiple"
              suppressCellFocus={true}
            />
          </div>
        </div>
      )}

      {activeTab === "legal" && <LegalDocsPanel projectId={projectId} />}

      {/* Modals */}
      <ImportExcelModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        projectId={projectId}
        onSuccess={fetchData}
      />

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={confirmAction?.type === "sold" ? "Xác nhận giao dịch" : "Xác nhận thao tác"}
        message={confirmAction?.message || ""}
        confirmLabel={confirmAction?.type === "sold" ? "Xác nhận Bán" : "Xác nhận"}
        variant={confirmAction?.type === "sold" ? "warning" : "info"}
        onConfirm={executeAction}
        onCancel={() => setConfirmAction(null)}
        loading={actionLoading}
      />
    </div>
  );
}
