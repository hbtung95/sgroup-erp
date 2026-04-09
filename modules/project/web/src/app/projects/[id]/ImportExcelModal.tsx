import { useState, useRef } from "react";
import axios from "axios";
import { X, UploadCloud } from "lucide-react";
import * as XLSX from "xlsx";

export function ImportExcelModal({ isOpen, onClose, projectId, onSuccess }: { isOpen: boolean, onClose: () => void, projectId: string, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        let failCount = 0;

        // Note: For real environment, we'd send the array to bulk-insert endpoint.
        // For simulation, submitting loop.
        for (const row of data as any[]) {
            try {
                await axios.post(`http://localhost:8081/api/v1/projects/${projectId}/products`, {
                    code: String(row.Code || row.Mã || ""),
                    block: String(row.Block || row.Tòa || ""),
                    floor: Number(row.Floor || row.Tầng || 1),
                    area: Number(row.Area || row.Diện_Tích || 50),
                    price: Number(row.Price || row.Giá || 1),
                    direction: String(row.Direction || row.Hướng || "Đông"),
                    bedrooms: Number(row.Bedrooms || row.PN || 2),
                    status: "AVAILABLE"
                }, {
                    headers: { "Authorization": "Bearer mock-admin-token" }
                });
                successCount++;
            } catch (err) {
                failCount++;
            }
        }
        alert(`Import xong. Thành công: ${successCount}. Lỗi: ${failCount}`);
        onSuccess();
        onClose();
      } catch (err) {
        alert("Lỗi đọc file Excel");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden p-6 text-center">
        <div className="flex justify-end mb-2">
            <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded">
                <X className="w-5 h-5"/>
            </button>
        </div>
        <UploadCloud className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Upload File Bảng Hàng (Excel)</h2>
        <p className="text-sm text-gray-500 mb-6">
            Hệ thống hỗ trợ file .xlsx, .xls. Đảm bảo cấu trúc cột gồm Code, Block, Floor, Area, Price, Direction, Bedrooms.
        </p>
        
        <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
        />
        <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
            {loading ? "Đang xử lý..." : "Chọn File từ máy tính"}
        </button>
      </div>
    </div>
  );
}
