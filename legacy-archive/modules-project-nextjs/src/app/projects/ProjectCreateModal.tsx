"use client";

import { useState } from "react";
import { X, Building2 } from "lucide-react";
import { useToast } from "@/components/Toast";
import { createProject } from "@/lib/projectApi";
import type { CreateProjectForm, ProjectStatus, PropertyType } from "@/lib/types";

type ProjectFormState = Required<Omit<CreateProjectForm, "imageUrl">> & {
  imageUrl?: string;
};

export function ProjectCreateModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState<ProjectFormState>({
    code: "",
    name: "",
    description: "",
    developer: "",
    location: "",
    province: "",
    district: "",
    type: "APARTMENT" as PropertyType,
    feeRate: 0,
    avgPrice: 0,
    status: "UPCOMING" as const,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      toast("warning", "Vui lòng nhập mã và tên dự án");
      return;
    }
    setLoading(true);
    try {
      await createProject({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        developer: formData.developer,
        location: formData.location,
        province: formData.province,
        district: formData.district,
        type: formData.type,
        feeRate: Number(formData.feeRate),
        avgPrice: Number(formData.avgPrice),
        status: formData.status,
      });
      toast("success", `Dự án "${formData.name}" đã được tạo thành công!`);
      onSuccess();
      onClose();
      setFormData({ code: "", name: "", description: "", developer: "", location: "", province: "", district: "", type: "APARTMENT", feeRate: 0, avgPrice: 0, status: "UPCOMING" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không rõ nguyên nhân";
      toast("error", "Lỗi tạo dự án: " + message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Thêm Mới Dự Án</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Thiết lập thông tin master data</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 p-2 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Mã dự án *</label>
              <input required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className={inputClass} placeholder="VD: VHOCP" />
            </div>
            <div>
              <label className={labelClass}>Trạng thái</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })} className={inputClass}>
                <option value="UPCOMING">Sắp mở bán</option>
                <option value="SELLING">Đang bán</option>
                <option value="HANDOVER">Bàn giao</option>
                <option value="CLOSED">Đã đóng</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Tên dự án *</label>
            <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Vinhomes Ocean Park" />
          </div>

          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputClass} min-h-[70px] resize-none`} placeholder="Mô tả ngắn về dự án..." />
          </div>

          <div>
            <label className={labelClass}>Chủ đầu tư</label>
            <input value={formData.developer} onChange={(e) => setFormData({ ...formData, developer: e.target.value })} className={inputClass} placeholder="Tập đoàn Vingroup" />
          </div>

          <div>
            <label className={labelClass}>Vị trí</label>
            <input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={inputClass} placeholder="Đồ Sơn, Hải Phòng" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tỉnh / Thành phố</label>
              <input value={formData.province} onChange={(e) => setFormData({ ...formData, province: e.target.value })} className={inputClass} placeholder="Hồ Chí Minh" />
            </div>
            <div>
              <label className={labelClass}>Quận / Huyện</label>
              <input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className={inputClass} placeholder="Quận 9" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Loại hình</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })} className={inputClass}>
                <option value="APARTMENT">Căn hộ</option>
                <option value="VILLA">Biệt thự</option>
                <option value="LAND">Đất nền</option>
                <option value="SHOPHOUSE">Shophouse</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Phí MG (%)</label>
              <input type="number" step="0.1" value={formData.feeRate} onChange={(e) => setFormData({ ...formData, feeRate: Number(e.target.value) })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Giá TB (Tỷ)</label>
              <input type="number" step="0.01" value={formData.avgPrice} onChange={(e) => setFormData({ ...formData, avgPrice: Number(e.target.value) })} className={inputClass} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-all">
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-medium hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50 active:scale-95">
            {loading ? "Đang tạo..." : "Khởi tạo dự án"}
          </button>
        </div>
      </div>
    </div>
  );
}
