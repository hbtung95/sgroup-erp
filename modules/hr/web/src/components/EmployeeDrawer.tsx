import React, { useState } from 'react';
import { X, Save, User, Hash } from 'lucide-react';

export interface EmployeeFormData {
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  identity_card: string;
}

interface EmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EmployeeFormData) => void;
}

export default function EmployeeDrawer({ isOpen, onClose, onSave }: EmployeeDrawerProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    code: '',
    first_name: '',
    last_name: '',
    email: '',
    identity_card: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement | HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[450px] bg-slate-900 border-l border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
              <User className="w-5 h-5" />
              Tạo mới Nhân sự
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              {/* Employee Code */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Mã nhân viên (Employee Code)</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                    placeholder="EMP-..."
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Họ (Last Name)</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="Nguyễn"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tên (First Name)</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="Văn A"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email Công ty</label>
                <input 
                  type="email" 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="a.nguyen@sgroup.vn"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* ID Card */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">CCCD / CMND</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                  placeholder="079..."
                  value={formData.identity_card}
                  onChange={(e) => setFormData({...formData, identity_card: e.target.value})}
                />
              </div>
            </div>
            
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-400/80">
                Khi lưu, một email chứa tài khoản khởi tạo sẽ tự động được hệ thống cấu hình.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-slate-900/80 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-[0_0_15px_rgba(5,150,105,0.4)] transition-all"
            >
              <Save className="w-4 h-4" />
              Lưu Hồ Sơ Mới
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
