"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Trash2, Plus, X } from "lucide-react";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { listDocs, uploadDoc, deleteDoc, updateDocStatus } from "@/lib/projectApi";
import type { LegalDoc, LegalDocStatus } from "@/lib/types";

const DOC_TYPES = ["Phê duyệt 1/500", "Giấy phép xây dựng", "Quyết định bàn giao đất", "Giấy chứng nhận QSDĐ", "Khác"];
const DOC_STATUSES: LegalDocStatus[] = ["PREPARATION", "SUBMITTED", "ISSUE_FIXING", "APPROVED"];
const DOC_STATUS_LABELS: Record<LegalDocStatus, string> = {
  PREPARATION: "Chuẩn bị",
  SUBMITTED: "Đã nộp",
  ISSUE_FIXING: "Bổ sung",
  APPROVED: "Phê duyệt",
};

export function LegalDocsPanel({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", docType: "Giấy phép xây dựng", fileUrl: "", description: "" });
  const { toast } = useToast();

  const fetchDocs = useCallback(async () => {
    try {
      const data = await listDocs(projectId);
      setDocs(data);
    } catch (error) {
      console.error(error);
    }
  }, [projectId]);

  useEffect(() => { void fetchDocs(); }, [fetchDocs]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast("warning", "Vui lòng nhập tên tài liệu");
      return;
    }
    setLoading(true);
    try {
      await uploadDoc(projectId, formData);
      toast("success", "Upload tài liệu thành công!");
      setShowForm(false);
      setFormData({ title: "", docType: "Giấy phép xây dựng", fileUrl: "", description: "" });
      void fetchDocs();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không rõ nguyên nhân";
      toast("error", "Lỗi upload: " + message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(projectId, deleteId);
      toast("success", "Đã xoá tài liệu");
      void fetchDocs();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không rõ nguyên nhân";
      toast("error", "Lỗi xoá: " + message);
    } finally {
      setDeleteId(null);
    }
  };

  const handleStatusChange = async (docId: string, newStatus: LegalDocStatus) => {
    try {
      await updateDocStatus(projectId, docId, newStatus);
      toast("success", "Cập nhật trạng thái thành công!");
      void fetchDocs();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không rõ nguyên nhân";
      toast("error", "Lỗi cập nhật: " + message);
    }
  };

  const inputClass = "w-full bg-slate-800/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all";

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-white/5">
        <h2 className="text-lg font-bold flex items-center text-slate-200">
          <FileText className="w-5 h-5 mr-2 text-blue-400" />
          Hồ Sơ Pháp Lý
        </h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 border border-white/10 text-slate-300 rounded-xl text-sm hover:bg-slate-700/50 transition-all font-medium">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Đóng" : "Tải File"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleUpload} className="p-5 border-b border-white/5 bg-slate-900/30">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Tải lên tài liệu mới</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <input required placeholder="Tên tài liệu..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={inputClass} />
            <select value={formData.docType} onChange={(e) => setFormData({ ...formData, docType: e.target.value })} className={inputClass}>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input required placeholder="URL file (Drive / S3)" value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className={inputClass} />
          </div>
          <button disabled={loading} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all">
            {loading ? "Đang xử lý..." : "Tải lên / Lưu"}
          </button>
        </form>
      )}

      <div className="p-5">
        {docs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">Không có tài liệu nào</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-3 text-left">Tên tài liệu</th>
                <th className="p-3 text-left">Loại</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Ngày tải</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-3">
                    <a href={d.fileUrl} target="_blank" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
                      {d.title}
                    </a>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-slate-800/50 rounded-lg text-xs text-slate-400 border border-white/5">{d.docType}</span>
                  </td>
                  <td className="p-3">
                    <select
                      value={d.status}
                      onChange={(e) => handleStatusChange(d.id, e.target.value as LegalDocStatus)}
                      className="bg-slate-800/50 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 cursor-pointer"
                    >
                      {DOC_STATUSES.map((s) => (
                        <option key={s} value={s}>{DOC_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-slate-500 text-xs">{new Date(d.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setDeleteId(d.id)} className="text-red-400/70 hover:text-red-400 p-1 hover:bg-red-500/5 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Xoá tài liệu"
        message="Bạn có chắc muốn xoá tài liệu này? Hành động không thể hoàn tác."
        confirmLabel="Xoá"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
