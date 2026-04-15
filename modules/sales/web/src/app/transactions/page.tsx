"use client";

import { useEffect, useState } from "react";
import { Clock, ShieldCheck, DollarSign, CheckCircle2, Search } from "lucide-react";
import { MOCK_TRANSACTIONS, updateTxStatus, HR_SALES_STAFF } from "../../lib/salesMocks";
import type { Transaction, TxStatus } from "../../lib/types";
import KanbanCard from "../../components/kanban/KanbanCard";

const KANBAN_COLUMNS = [
  { id: "PENDING_LOCK", label: "Chờ Duyệt Lock", color: "border-orange-500", bg: "bg-orange-500/10", icon: Clock },
  { id: "LOCKED", label: "Đã Lock Phê Duyệt", color: "border-blue-500", bg: "bg-blue-500/10", icon: ShieldCheck },
  { id: "DEPOSIT", label: "Đã Vào Cầm Cọc", color: "border-indigo-500", bg: "bg-indigo-500/10", icon: DollarSign },
  { id: "SOLD", label: "Chốt Bán (Sold)", color: "border-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
];

export default function KanbanPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [role, setRole] = useState("sales_manager");
  const [filter, setFilter] = useState("");

  useEffect(() => {
     setTransactions([...MOCK_TRANSACTIONS]);
  }, []);

  const handleApprove = async (id: string, newStatus: TxStatus) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
    await updateTxStatus(id, newStatus);
    setTransactions([...MOCK_TRANSACTIONS]);
  };

  const handleReject = async (id: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: "REJECTED" } : tx));
    await updateTxStatus(id, "REJECTED");
    setTransactions([...MOCK_TRANSACTIONS]);
  };

  const filteredTransactions = transactions.filter(tx => 
      tx.productCode?.toLowerCase().includes(filter.toLowerCase()) || 
      tx.salesStaffName?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (role === 'sales_manager') {
       e.currentTarget.classList.add('ring-2', 'ring-blue-500', 'bg-white/[0.02]');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-white/[0.02]');
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-white/[0.02]');
    
    if (role !== 'sales_manager') return;

    const txId = e.dataTransfer.getData('txId');
    const sourceCol = e.dataTransfer.getData('sourceCol');

    // Basic logic mapping drop validation
    if (!txId || sourceCol === targetColId) return;
    
    const isValidProgress = (
        (sourceCol === 'PENDING_LOCK' && targetColId === 'LOCKED') ||
        (sourceCol === 'LOCKED' && targetColId === 'DEPOSIT') ||
        (sourceCol === 'DEPOSIT' && targetColId === 'SOLD')
    );

    if (isValidProgress) {
        await handleApprove(txId, targetColId as TxStatus);
    } else {
        alert('Phải kéo thả theo đúng quy trình từ trái sang phải!');
    }
  };

  return (
    <div className="h-[90vh] flex flex-col antialiased">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             Giao Dịch Bảng Rổ
             <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]">Live Sync</span>
          </h1>
          <p className="text-slate-400 font-medium mt-1.5 flex items-center">
             Liên kết phòng Kinh Doanh: <span className="text-blue-400 font-semibold ml-2">{HR_SALES_STAFF.name} ({HR_SALES_STAFF.id})</span>
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
                 <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                 <input 
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Tìm mã hoặc nhân sự..." 
                    className="w-full md:w-64 bg-slate-900/60 border border-white/10 text-white rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500" 
                 />
            </div>
            <div className="flex p-1 bg-slate-900/60 rounded-xl shadow-inner border border-white/10 backdrop-blur-md shrink-0">
               <button 
                  onClick={() => setRole("sales_staff")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${role === 'sales_staff' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)] transform scale-105' : 'text-slate-400 hover:bg-white/10'}`}>
                  NVKD
               </button>
               <button 
                  onClick={() => setRole("sales_manager")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${role === 'sales_manager' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_4px_15px_rgba(16,185,129,0.4)] transform scale-105' : 'text-slate-400 hover:bg-white/10'}`}>
                  Giám Đốc (TPKD)
               </button>
            </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        {KANBAN_COLUMNS.map((col) => {
           const colTxs = filteredTransactions.filter(t => t.status === col.id);
           
           return (
             <div 
               key={col.id} 
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={(e) => handleDrop(e, col.id)}
               className="flex-none w-[340px] flex flex-col h-full glass-panel rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group transition-all duration-300"
             >
               <div className={`p-5 min-h-[72px] border-b border-white/10 ${col.bg} flex justify-between items-center z-10 font-sans backdrop-blur-md`}>
                 <h3 className={`font-extrabold flex items-center gap-2 text-white tracking-tight`}>
                    <col.icon className={`w-5 h-5 ${col.color.replace('border-','text-')}`} />
                    {col.label}
                 </h3>
                 <span className="bg-slate-900/80 text-white border border-white/10 font-black px-3 py-1 text-xs rounded-full shadow-inner">{colTxs.length}</span>
               </div>
               
               <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar z-10">
                 {colTxs.map(tx => (
                   <KanbanCard 
                      key={tx.id} 
                      tx={tx} 
                      role={role} 
                      colId={col.id} 
                      onApprove={handleApprove} 
                      onReject={handleReject} 
                   />
                 ))}
                 
                 {colTxs.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-60">
                         <col.icon className="w-10 h-10 mb-3 opacity-30" />
                         <span className="text-xs font-medium">Kéo thả thẻ trống</span>
                     </div>
                 )}
               </div>
               
               {col.id === 'PENDING_LOCK' && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[50px] -z-10"></div>}
               {col.id === 'SOLD' && <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] -z-10"></div>}
             </div>
           );
        })}
      </div>
    </div>
  );
}
