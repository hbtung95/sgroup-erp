import React, { useState, useEffect } from 'react';
import { BookmarkPlus, X, CheckCircle2, User, Building2, Phone, DollarSign, MessageSquare, ChevronDown } from 'lucide-react';
import { salesOpsApi } from '../api/salesApi';
import { useToastActions } from './shared/Toast';

export interface BookingEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
}

export function BookingEntryModal({ isOpen, onClose, onSuccess, editData }: BookingEntryModalProps) {
  const PROJECTS = ['SGroup Royal City', 'Vinhomes Grand Park', 'Eco Green Saigon', 'Aqua City'];
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [projectName, setProjectName] = useState(PROJECTS[0]);
  const [bookingAmount, setBookingAmount] = useState(50000000); // 50M default
  const [note, setNote] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToastActions();

  useEffect(() => {
    if (isOpen && editData) {
      setCustomerName(editData.customerName || '');
      setCustomerPhone(editData.customerPhone || '');
      setProjectName(editData.projectName || PROJECTS[0]);
      setBookingAmount(editData.bookingAmount || 50000000);
      setNote(editData.note || '');
    } else if (!isOpen) {
      setTimeout(() => {
        setSuccess(false);
        setCustomerName('');
        setCustomerPhone('');
        setProjectName(PROJECTS[0]);
        setBookingAmount(50000000);
        setNote('');
      }, 300);
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log("Submit clicked!", { customerName, bookingAmount, projectName, isEdit: !!editData });
    
    if (!customerName) {
      toast.error('Vui lòng nhập Tên KH'); return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        customerName,
        customerPhone,
        unitCode: 'N/A', // Send 'N/A' as booking without unit
        projectName,
        bookingAmount,
        note
      };
      
      if (editData) {
        console.log("Calling updateBooking API...");
        await salesOpsApi.updateBooking(editData.id, payload);
        toast.success('Đã cập nhật phiếu Giữ chỗ thành công!');
      } else {
        console.log("Calling createBooking API...");
        await salesOpsApi.createBooking(payload);
        toast.success('Đã tạo phiếu Giữ chỗ thành công!');
      }
      
      setSuccess(true);
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        onClose();
        console.log("Modal closed triggered.");
      }, 1500);

    } catch (err: any) {
      console.error("Booking API Error:", err);
      toast.error(err?.message || 'Lỗi thao tác Giữ chỗ. Vui lòng thử lại.');
      alert('Lỗi hệ thống: ' + (err?.message || 'Không rõ nguyên nhân'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-black/80 backdrop-blur-3xl rounded-sg-2xl border border-white/20 dark:border-sg-border shadow-2xl overflow-hidden sg-stagger"
        style={{ animation: 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="p-6">
          <button 
            type="button" 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sg-card/50 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors border border-sg-border/50 text-sg-muted"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <BookmarkPlus size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-sg-heading tracking-tight">
                {editData ? 'Chỉnh Sửa Giữ Chỗ' : 'Tạo Giữ Chỗ (Booking)'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[12px] font-bold text-sg-muted">
                  {editData ? 'Cập nhật lại giao dịch giữ chỗ' : 'Tạo mới giao dịch giữ chỗ BĐS'}
                </p>
              </div>
            </div>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-emerald-500">
              <CheckCircle2 size={64} className="animate-bounce" />
              <p className="mt-4 text-[16px] font-black">
                {editData ? 'Xác nhận cập nhật thẻ Giữ Chỗ thành công!' : 'Xác nhận tạo thẻ Giữ Chỗ thành công!'}
              </p>
            </div>
          ) : (
             <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <InputGroup 
                  label="Tên Khách Hàng *" 
                  icon={<User size={16} className="text-sg-muted" />} 
                  value={customerName} 
                  onChange={setCustomerName} 
                  placeholder="VD: Nguyễn Văn A"
                />
                <InputGroup 
                  label="Số Điện Thoại" 
                  icon={<Phone size={16} className="text-sg-muted" />} 
                  value={customerPhone} 
                  onChange={setCustomerPhone} 
                  placeholder="VD: 0901 234 567"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 z-20 relative">
                <SearchableSelect 
                  label="Dự Án"
                  icon={<Building2 size={16} className="text-sg-muted" />}
                  options={PROJECTS}
                  value={projectName}
                  onChange={setProjectName}
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase flex items-center justify-between">
                  <span>Số Tiền Giữ Chỗ (VNĐ)</span>
                  <span className="text-blue-500 text-[14px]">{(bookingAmount / 1e6).toFixed(0)} Triệu</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <DollarSign size={18} className="text-blue-500" />
                  </div>
                  <input 
                    type="text"
                    value={bookingAmount > 0 ? new Intl.NumberFormat('vi-VN').format(bookingAmount) : ''}
                    onChange={(e) => {
                      const numericValue = parseInt(e.target.value.replace(/\D/g, ''), 10);
                      setBookingAmount(isNaN(numericValue) ? 0 : numericValue);
                    }}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-[16px] font-black text-blue-600 dark:text-blue-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase">Ghi chú giao dịch</label>
                <div className="relative">
                  <div className="absolute left-4 top-4">
                    <MessageSquare size={16} className="text-sg-muted" />
                  </div>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Thông tin thêm về quy trình giữ chỗ..."
                    className="w-full h-24 pl-12 pr-4 py-4 rounded-xl bg-sg-card/50 border border-sg-border/50 text-[13px] font-medium text-sg-heading focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleSubmit}
                className={`w-full h-12 mt-2 rounded-xl text-white font-black text-[15px] hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden flex items-center justify-center gap-2 ${
                  submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/40'
                }`}
              >
                {submitting ? 'Đang xử lý...' : (
                   <>
                     <BookmarkPlus size={18} />
                     {editData ? 'Lưu Kết Quả' : 'Tạo Mới Giữ Chỗ'}
                   </>
                )}
                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, value, onChange, placeholder, disabled }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase block leading-tight">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {icon}
        </div>
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-12 pl-12 pr-4 rounded-xl border text-[13px] font-bold focus:outline-none transition-all ${
            disabled ? 'bg-sg-card border-sg-border/50 text-sg-muted cursor-not-allowed' : 'bg-transparent border-sg-border/50 text-sg-heading focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
          }`}
        />
      </div>
    </div>
  );
}

function SearchableSelect({ label, icon, options, value, onChange }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter((o: string) => o.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-2 relative">
      <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase block leading-tight">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          {icon}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <ChevronDown size={14} className="text-sg-muted" />
        </div>
        <input 
          type="text"
          onFocus={() => { setIsOpen(true); setSearchTerm(''); }}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          value={isOpen ? searchTerm : value}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          placeholder={value || 'Tìm hoặc chọn...'}
          className="w-full h-12 pl-12 pr-10 rounded-xl border bg-transparent border-sg-border/50 text-[13px] font-bold focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 text-sg-heading transition-all"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-white dark:bg-black/90 backdrop-blur-3xl border border-sg-border rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt: string) => (
              <div 
                key={opt}
                onMouseDown={() => {
                  onChange(opt);
                  setSearchTerm('');
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 mx-2 rounded-lg cursor-pointer text-[13px] font-bold transition-all ${
                  value === opt 
                    ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' 
                    : 'text-sg-heading hover:bg-slate-100 dark:hover:bg-sg-card/60'
                }`}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-[12px] font-medium text-sg-muted">Không có kết quả</div>
          )}
        </div>
      )}
    </div>
  );
}
