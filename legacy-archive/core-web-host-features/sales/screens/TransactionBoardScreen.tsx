import React, { useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { 
  Building2, 
  Handshake, 
  MapPin, 
  User, 
  Clock, 
  Banknote,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Lock
} from 'lucide-react';

const STAGES = [
  { id: 'PENDING_LOCK', title: 'YÊU CẦU LOCK', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { id: 'LOCKED', title: 'ĐÃ LOCK', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { id: 'DEPOSIT', title: 'ĐÃ CỌC', color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20' },
  { id: 'SOLD', title: 'ĐÃ CHỐT', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
];

const MOCK_TX = [
  { id: 'tx1', customerName: 'Nguyễn Văn A', productCode: 'A1-05', price: 2500000000, status: 'PENDING_LOCK', staff: 'nv1', project: 'GL-Project' },
  { id: 'tx2', customerName: 'Trần Thị B', productCode: 'B2-10', price: 3100000000, status: 'LOCKED', staff: 'nv2', project: 'GL-Project' },
  { id: 'tx3', customerName: 'Lê Văn C', productCode: 'C3-15', price: 1800000000, status: 'DEPOSIT', staff: 'nv1', project: 'Rivera' },
  { id: 'tx4', customerName: 'Phạm Thị D', productCode: 'D4-20', price: 4200000000, status: 'SOLD', staff: 'nv3', project: 'Aqua' }
];

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export function TransactionBoardScreen() {
  const user = useAuthStore(s => s.user);
  
  // Trưởng phòng & Giám đốc có quyền duyệt
  const isManagerOrAdmin = user?.role === 'sales_manager' || user?.role === 'admin' || user?.role === 'sales_director';

  const [transactions, setTransactions] = useState(MOCK_TX);
  const [draggedTxId, setDraggedTxId] = useState<string | null>(null);

  const handleApproveLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'LOCKED' } : t));
  };

  const handleProceedStage = (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatusMap: Record<string, string> = {
      'LOCKED': 'DEPOSIT',
      'DEPOSIT': 'SOLD'
    };
    const next = nextStatusMap[currentStatus];
    if (next) {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: next } : t));
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isManagerOrAdmin) {
       e.preventDefault();
       return;
    }
    e.dataTransfer.setData('txId', id);
    setDraggedTxId(id);
  };

  const handleDragEnd = () => {
    setDraggedTxId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDraggedTxId(null);
    if (!isManagerOrAdmin) return;
    
    const id = e.dataTransfer.getData('txId');
    if (!id) return;
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-hidden">
      
      {/* Cinematic Ambient Glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="px-6 sm:px-10 lg:px-12 py-8 border-b border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/30 backdrop-blur-3xl relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sg-stagger" style={{ animationDelay: '0ms' }}>
          <div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 w-fit mb-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
               <Handshake size={14} className="text-amber-500 drop-shadow-sm" />
               <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em]">Transaction Center</span>
            </div>
            <h2 className="text-[36px] sm:text-[40px] font-black text-transparent bg-clip-text bg-linear-to-r from-sg-heading to-sg-heading/70 tracking-tight drop-shadow-lg leading-none">Pipeline Giao Dịch</h2>
          </div>
          
          <div className="hidden sm:flex items-center gap-6 bg-white/5 dark:bg-black/40 backdrop-blur-lg border border-white/10 dark:border-white/5 px-6 py-3 rounded-[20px]">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Deals</span>
               <span className="text-[15px] font-black text-sg-heading drop-shadow-sm">{transactions.length} Active</span>
             </div>
             <div className="w-px h-8 bg-white/10" />
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Volume</span>
               <span className="text-[15px] font-black text-emerald-500 drop-shadow-sm">{(transactions.reduce((s, t) => s + t.price, 0) / 1000000000).toFixed(2)} Tỷ</span>
             </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="h-full px-6 sm:px-10 lg:px-12 py-8 min-w-max flex gap-8 items-start">
          
          {STAGES.map((stage, colIdx) => {
            const colTx = transactions.filter(t => t.status === stage.id);

            return (
              <div 
                key={stage.id} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`sg-stagger w-[380px] flex flex-col h-full bg-white/5 dark:bg-black/30 backdrop-blur-3xl rounded-[32px] border border-white/10 dark:border-white/5 shadow-[0_16px_40px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-500 relative group/col`}
                style={{ animationDelay: `${colIdx * 100}ms` }}
              >
                {/* Drag Target Glow */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/col:opacity-100 pointer-events-none transition-opacity duration-300" />
                
                {/* Stage Ambient Glow inside column */}
                <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full ${stage.bg} blur-[60px] opacity-20 pointer-events-none`} />

                {/* Column Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/10 dark:border-white/5 relative z-10 pointer-events-none">
                   <div className={`absolute top-0 left-0 right-0 h-1.5 ${stage.bg.replace('/10', '/80')}`} />
                   <div className="flex items-center gap-3">
                     <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shadow-lg ${stage.bg.replace('/10', '/20')} ${stage.color} border ${stage.border}`}>
                       {stage.id === 'SOLD' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                     </div>
                     <h3 className={`text-[17px] font-black tracking-tight drop-shadow-sm ${stage.color}`}>{stage.title}</h3>
                   </div>
                   <div className={`px-3 py-1.5 rounded-xl text-[13px] font-black shadow-inner border bg-white/10 dark:bg-black/40 ${stage.color} ${stage.border}`}>
                     {colTx.length}
                   </div>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 custom-scrollbar relative z-10">
                  {colTx.map(tx => {
                    const isDragged = draggedTxId === tx.id;
                    return (
                      <div 
                        key={tx.id} 
                        draggable={isManagerOrAdmin}
                        onDragStart={(e) => handleDragStart(e, tx.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white/10 dark:bg-black/40 backdrop-blur-2xl border ${isDragged ? 'border-amber-500 opacity-50 scale-95' : 'border-white/10 dark:border-white/5'} rounded-[24px] p-6 flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.12)] hover:border-${stage.color.replace('text-', '')}/40 transition-all duration-300 ${isManagerOrAdmin ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} group hover:-translate-y-2 relative overflow-hidden`}
                      >
                         <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full ${stage.bg} blur-[40px] opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none`} />

                         {/* Header: Project & Code */}
                         <div className="flex items-start justify-between relative z-10">
                           <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-[0.1em] border shadow-xs flex items-center gap-1.5 ${stage.bg} ${stage.color} ${stage.border}`}>
                             <Building2 size={12} /> {tx.project}
                           </span>
                           <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sg-muted hover:text-white transition-colors">
                             <MoreHorizontal size={14} />
                           </button>
                         </div>
                         
                         {/* Product ID & Price */}
                         <div className="flex flex-col relative z-10">
                           <h4 className="text-[28px] font-black text-sg-heading leading-none group-hover:text-amber-500 transition-colors drop-shadow-sm mb-2">{tx.productCode}</h4>
                           <div className="flex items-center gap-1.5">
                             <Banknote size={16} className="text-emerald-500 drop-shadow-sm" /> 
                             <span className="text-[18px] font-black text-emerald-500 drop-shadow-sm">{(tx.price / 1000000000).toFixed(2)} Tỷ VNĐ</span>
                           </div>
                         </div>

                         {/* Customer Info Box */}
                         <div className="bg-white/5 dark:bg-black/50 border border-white/10 dark:border-white/5 rounded-[16px] p-4 flex flex-col gap-3 relative z-10 mt-1">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 shadow-inner flex items-center justify-center shrink-0">
                                <User size={14} className="text-white" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Khách hàng</span>
                                <span className="text-[14px] font-black text-sg-heading truncate w-full">{tx.customerName}</span>
                              </div>
                            </div>
                            <div className="h-px bg-white/5 w-full" />
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-sg-subtext flex items-center gap-1.5"><Clock size={12}/> Vừa cập nhật</span>
                              <span className="text-[11px] font-black text-sg-heading bg-white/10 px-2 py-0.5 rounded-[6px] uppercase tracking-wider">Sale: {tx.staff.toUpperCase()}</span>
                            </div>
                         </div>

                         {/* Contextual Approvals / Flow Actions */}
                         <div className="pt-2 flex items-center gap-3 relative z-10 mt-1">
                            {stage.id === 'PENDING_LOCK' && (
                              <button 
                                onClick={(e) => handleApproveLock(tx.id, e)}
                                disabled={!isManagerOrAdmin}
                                className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-[13px] font-black transition-all shadow-[0_4px_16px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white"
                              >
                                <Lock size={16} /> {isManagerOrAdmin ? "Duyệt Yêu Cầu Lock" : "Đang chờ Giám đốc duyệt"}
                              </button>
                            )}

                            {(stage.id === 'LOCKED' || stage.id === 'DEPOSIT') && (
                              <button 
                                onClick={(e) => handleProceedStage(tx.id, stage.id, e)}
                                disabled={!isManagerOrAdmin}
                                className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-[13px] font-black transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${stage.id === 'LOCKED' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-blue-500/20' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20'}`}
                              >
                                {stage.id === 'LOCKED' ? <><Banknote size={16}/> Chuyển Xác Nhận Cọc</> : <><CheckCircle2 size={16}/> Chuyển Hoàn Tất Ký HĐ</>}
                              </button>
                            )}

                            {stage.id === 'SOLD' && (
                              <div className="flex-1 h-12 bg-white/5 border border-white/5 rounded-xl flex flex-col items-center justify-center">
                                <span className="text-[12px] font-black text-emerald-500 flex items-center gap-1.5"><CheckCircle2 size={14}/> GIAO DỊCH THÀNH CÔNG</span>
                                <span className="text-[9px] font-bold text-sg-muted uppercase tracking-widest mt-0.5">CONTRACT CLOSED</span>
                              </div>
                            )}
                         </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
