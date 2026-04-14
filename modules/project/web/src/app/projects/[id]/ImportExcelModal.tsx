"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast";
import { batchCreateProducts } from "@/lib/projectApi";
import * as XLSX from "xlsx";

type PreviewRow = {
  code: string;
  block: string;
  floor: number;
  area: number;
  price: number;
  direction: string;
  bedrooms: number;
};

type RawImportRow = Record<string, string | number | undefined>;

export function ImportExcelModal({ isOpen, onClose, projectId, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [allData, setAllData] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<RawImportRow>(ws);

        const parsed: PreviewRow[] = data.map((row) => ({
          code: String(row.Code || row.Mã || row["Mã Căn"] || ""),
          block: String(row.Block || row.Tòa || row["Tòa/Block"] || ""),
          floor: Number(row.Floor || row.Tầng || 1),
          area: Number(row.Area || row["Diện Tích"] || row["DT (m²)"] || 50),
          price: Number(row.Price || row.Giá || row["Giá (Tỷ)"] || 1),
          direction: String(row.Direction || row.Hướng || "Đông"),
          bedrooms: Number(row.Bedrooms || row.PN || row["Phòng Ngủ"] || 2),
        }));

        setAllData(parsed);
        setPreview(parsed.slice(0, 5));
      } catch {
        toast("error", "Lỗi đọc file Excel. Kiểm tra lại định dạng.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!allData.length) return;
    setLoading(true);
    try {
      const result = await batchCreateProducts(projectId, allData);
      toast("success", `Import thành công ${result.created} sản phẩm!`);
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không rõ nguyên nhân";
      toast("error", "Lỗi import: " + message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPreview([]);
    setAllData([]);
    setFileName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in">
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Import Bảng Hàng</h2>
              <p className="text-xs text-slate-500">Hỗ trợ .xlsx, .xls — Batch insert</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-500 hover:text-slate-300 p-2 rounded-xl hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {!allData.length ? (
            <div className="text-center py-10">
              <UploadCloud className="w-14 h-14 text-blue-400/50 mx-auto mb-4" />
              <p className="text-slate-400 text-sm mb-2">Kéo thả hoặc chọn file Excel từ máy tính</p>
              <p className="text-slate-600 text-xs mb-6">Cấu trúc cột: Code, Block, Floor, Area, Price, Direction, Bedrooms</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
              >
                Chọn File
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">{fileName}</span>
                <span className="text-xs text-slate-500 ml-auto">{allData.length} dòng dữ liệu</span>
              </div>

              <p className="text-xs text-slate-500 mb-2 font-medium">Xem trước (5 dòng đầu):</p>
              <div className="overflow-x-auto mb-4 rounded-xl border border-white/5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-400">
                      <th className="p-2 text-left">Mã Căn</th>
                      <th className="p-2 text-left">Tòa</th>
                      <th className="p-2 text-left">Tầng</th>
                      <th className="p-2 text-left">DT</th>
                      <th className="p-2 text-left">Giá</th>
                      <th className="p-2 text-left">Hướng</th>
                      <th className="p-2 text-left">PN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-white/5 text-slate-300">
                        <td className="p-2 font-medium text-blue-300">{row.code || <AlertCircle className="w-3 h-3 text-red-400 inline" />}</td>
                        <td className="p-2">{row.block}</td>
                        <td className="p-2">{row.floor}</td>
                        <td className="p-2">{row.area} m²</td>
                        <td className="p-2">{row.price} Tỷ</td>
                        <td className="p-2">{row.direction}</td>
                        <td className="p-2">{row.bedrooms}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {allData.length > 0 && (
          <div className="p-5 border-t border-white/10 flex justify-end gap-3">
            <button onClick={handleClose} className="px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-700/50 transition-all">
              Hủy
            </button>
            <button onClick={handleImport} disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all disabled:opacity-50">
              {loading ? "Đang import..." : `Import ${allData.length} sản phẩm`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
