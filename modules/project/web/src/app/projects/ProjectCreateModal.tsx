"use client";

import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export function ProjectCreateModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    developer: "",
    location: "",
    type: "APARTMENT",
    feeRate: 0,
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:8081/api/v1/projects", {
        code: formData.code,
        name: formData.name,
        developer: formData.developer,
        location: formData.location,
        type: formData.type,
        feeRate: Number(formData.feeRate)
      }, {
        headers: {
            "Authorization": "Bearer mock-admin-token"
        }
      });
      alert("Tạo dự án thành công!");
      onSuccess();
      onClose();
    } catch (error: any) {
      alert("Lỗi tạo dự án: " + (error.response?.data?.error?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Thêm Mới Dự Án</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded">
            <X className="w-5 h-5"/>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã dự án (Code)</label>
            <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="Vd: VHOCP..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tên dự án</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="Vinhomes Ocean Park" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chủ đầu tư</label>
            <input value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="Tập đoàn..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vị trí</label>
            <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full border rounded px-3 py-2 text-sm" placeholder="Đồ Sơn, Hải Phòng..." />
          </div>
          <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Loại hình</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded px-3 py-2 text-sm bg-white">
                  <option value="APARTMENT">Căn hộ</option>
                  <option value="VILLA">Biệt thự</option>
                  <option value="LAND">Đất nền</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Phí môi giới (%)</label>
                <input required type="number" step="0.1" value={formData.feeRate} onChange={e => setFormData({...formData, feeRate: Number(e.target.value)})} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm text-gray-700 hover:bg-gray-50">Hủy</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Đang tạo..." : "Khởi tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
