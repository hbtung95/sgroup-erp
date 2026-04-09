import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Trash2, Download } from "lucide-react";

type Doc = {
  id: string;
  name: string;
  docType: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
};

export function LegalDocsPanel({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ name: "", docType: "Giấy phép xây dựng", fileUrl: "" });

  useEffect(() => {
    fetchDocs();
  }, [projectId]);

  const fetchDocs = async () => {
    try {
      const res = await axios.get(`http://localhost:8081/api/v1/projects/${projectId}/docs`);
      setDocs(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:8081/api/v1/projects/${projectId}/docs`, formData, {
        headers: { "Authorization": "Bearer mock-admin-token" }
      });
      setShowForm(false);
      setFormData({ name: "", docType: "Giấy phép xây dựng", fileUrl: "" });
      fetchDocs();
    } catch (e) {
      alert("Lỗi upload");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Bạn có chắc muốn xoá tài liệu này?")) return;
    try {
      await axios.delete(`http://localhost:8081/api/v1/projects/${projectId}/docs/${docId}`, {
        headers: { "Authorization": "Bearer mock-admin-token" }
      });
      fetchDocs();
    } catch (e) {
      alert("Lỗi xoá");
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-lg font-bold flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Hồ sơ Pháp Lý Dự Án
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 bg-gray-900 text-white rounded text-sm hover:bg-gray-800">
            {showForm ? "Đóng Form" : "Upload File"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="mb-6 bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-semibold mb-3">Upload tài liệu mới</h3>
            <div className="grid grid-cols-3 gap-4 mb-3">
                <input required placeholder="Tên tài liệu..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border rounded px-3 py-2 text-sm" />
                <select value={formData.docType} onChange={e => setFormData({...formData, docType: e.target.value})} className="border rounded px-3 py-2 text-sm bg-white">
                    <option value="Phê duyệt 1/500">Phê duyệt 1/500</option>
                    <option value="Giấy phép xây dựng">Giấy phép xây dựng</option>
                    <option value="Quyết định bàn giao đất">Quyết định bàn giao đất</option>
                    <option value="Khác">Khác</option>
                </select>
                <input required placeholder="URL file (Google Drive / S3)" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} className="border rounded px-3 py-2 text-sm" />
            </div>
            <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50">Upload / Lưu</button>
        </form>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-10 text-gray-400">Không có tài liệu nào</div>
      ) : (
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
                <tr>
                    <th className="p-3 border-b">Tên tài liệu</th>
                    <th className="p-3 border-b">Loại văn bản</th>
                    <th className="p-3 border-b">Ngày tải lên</th>
                    <th className="p-3 border-b">Người tải</th>
                    <th className="p-3 border-b text-right">Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {docs.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 border-b">
                        <td className="p-3 font-medium text-blue-600">
                            <a href={d.fileUrl} target="_blank" className="hover:underline">{d.name}</a>
                        </td>
                        <td className="p-3">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">{d.docType}</span>
                        </td>
                        <td className="p-3 text-gray-500">{new Date(d.createdAt).toLocaleDateString("vi-VN")}</td>
                        <td className="p-3 text-gray-500">{d.uploadedBy}</td>
                        <td className="p-3 text-right">
                            <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      )}
    </div>
  );
}
