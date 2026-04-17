import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2, User, Building2, Phone, DollarSign, MessageSquare, ChevronDown, ListPlus, Key } from 'lucide-react';
import { salesOpsApi } from '../api/salesApi';
import { useToastActions } from './shared/Toast';

export interface DepositEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
}

export function DepositEntryModal({ isOpen, onClose, onSuccess, editData }: DepositEntryModalProps) {
  const PROJECTS = ['SGroup Royal City', 'Vinhomes Grand Park', 'Eco Green Saigon', 'Aqua City'];
  const PAYMENT_METHODS = ['CASH', 'TRANSFER', 'CARD'];
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [projectName, setProjectName] = useState(PROJECTS[0]);
  const [unitCode, setUnitCode] = useState('');
  const [depositAmount, setDepositAmount] = useState(100000000); // 100M default
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [note, setNote] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToastActions();

  useEffect(() => {
    if (isOpen && editData) {
      setCustomerName(editData.customerName || '');
      setCustomerPhone(editData.customerPhone || '');
      setProjectName(editData.projectName || PROJECTS[0]);
      setUnitCode(editData.unitCode || '');
      setDepositAmount(editData.depositAmount || 100000000);
      setPaymentMethod(editData.paymentMethod || PAYMENT_METHODS[0]);
      setNote(editData.note || '');
    } else if (!isOpen) {
      setTimeout(() => {
        setSuccess(false);
        setCustomerName('');
        setCustomerPhone('');
        setProjectName(PROJECTS[0]);
        setUnitCode('');
        setDepositAmount(100000000);
        setPaymentMethod(PAYMENT_METHODS[0]);
        setNote('');
      }, 300);
    }
  }, [isOpen, editData]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    if (!customerName) {
      toast.error('Vui lòng nhập Tên KH'); return;
    }
    if (!unitCode) {
      toast.error('Vui lòng nhập Mã Căn'); return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        customerName,
        customerPhone,
        unitCode,
        projectName,
        depositAmount,
        paymentMethod,
        note
      };
      
      if (editData) {
        await salesOpsApi.updateDeposit(editData.id, payload);
        toast.success('Đã cập nhật phiếu Đặt cọc thành công!');
      } else {
        await salesOpsApi.createDeposit(payload);
        toast.success('Đã tạo phiếu Đặt cọc thành công!');
      }
      
      setSuccess(true);
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("Deposit API Error:", err);
      toast.error(err?.message || 'Lỗi thao tác Đặt cọc. Vui lòng thử lại.');
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
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-sg-heading tracking-tight">
                {editData ? 'Chỉnh Sửa Đặt Cọc' : 'Tạo Đặt Cọc Mới'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[12px] font-bold text-sg-muted">
                  {editData ? 'Cập nhật giao dịch vào cọc' : 'Tạo mới giao dịch vào cọc BĐS'}
                </p>
              </div>
            </div>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-emerald-500">
              <CheckCircle2 size={64} className="animate-bounce" />
              <p className="mt-4 text-[16px] font-black">
                {editData ? 'Cập nhật thẻ Đặt Cọc thành công!' : 'Tạo thẻ Đặt Cọc thành công!'}
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

              <div className="grid grid-cols-2 gap-4 z-20 relative">
                <SearchableSelect 
                  label="Dự Án"
                  icon={<Building2 size={16} className="text-sg-muted" />}
                  options={PROJECTS}
                  value={projectName}
                  onChange={setProjectName}
                />
                <InputGroup 
                  label="Mã Căn *" 
                  icon={<Key size={16} className="text-sg-muted" />} 
                  value={unitCode} 
                  onChange={setUnitCode} 
                  placeholder="VD: SH-01"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase flex items-center justify-between">
                    <span>Tiền Cọc (VNĐ)</span>
                    <span className="text-orange-500 text-[12px]">{(depositAmount / 1e6).toFixed(0)} Triệu</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <DollarSign size={18} className="text-orange-500" />
                    </div>
                    <input 
                      type="text"
                      value={depositAmount > 0 ? new Intl.NumberFormat('vi-VN').format(depositAmount) : ''}
                      onChange={(e) => {
                        const numericValue = parseInt(e.target.value.replace(/\D/g, ''), 10);
                        setDepositAmount(isNaN(numericValue) ? 0 : numericValue);
                      }}
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 text-[16px] font-black text-orange-600 dark:text-orange-400 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 relative z-10">
                  <SearchableSelect 
                    label="Phương Thức GD"
                    icon={<ListPlus size={16} className="text-sg-muted" />}
                    options={PAYMENT_METHODS}
                    value={paymentMethod}
                    onChange={setPaymentMethod}
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
                    placeholder="Thông tin thêm về quy trình đặt cọc..."
                    className="w-full h-24 pl-12 pr-4 py-4 rounded-xl bg-sg-card/50 border border-sg-border/50 text-[13px] font-medium text-sg-heading focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleSubmit}
                className={`w-full h-12 mt-2 rounded-xl text-white font-black text-[15px] hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden flex items-center justify-center gap-2 ${
                  submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-linear-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/40'
                }`}
              >
                {submitting ? 'Đang xử lý...' : (
                   <>
                     <ShieldCheck size={18} />
                     {editData ? 'Lưu Kết Quả' : 'Tạo Chuyển Cọc'}
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
            disabled ? 'bg-sg-card border-sg-border/50 text-sg-muted cursor-not-allowed' : 'bg-transparent border-sg-border/50 text-sg-heading focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20'
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
          className="w-full h-12 pl-12 pr-10 rounded-xl border bg-transparent border-sg-border/50 text-[13px] font-bold focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-sg-heading transition-all"
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
                    ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400' 
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
