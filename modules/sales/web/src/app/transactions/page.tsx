"use client";

import { useState, useEffect } from "react";
import { Clock, Search, ShieldCheck, DollarSign, CheckCircle2, ChevronRight, XCircle } from "lucide-react";
import axios from "axios";

// Status match with Go Backend
type TxStatus = "PENDING_LOCK" | "LOCKED" | "DEPOSIT" | "SOLD" | "CANCELLED" | "REJECTED";

type Transaction = {
  id: string;
  productId: string;
  salesStaffId: string;
  status: TxStatus;
  priceAtLock: number;
  productCode?: string; // Mocked relation
};

// Mock data to visualize immediately
const MOCK_DATA: Transaction[] = [
  { id: "tx-1", productId: "prd-1", productCode: "VHO-S1.01-05", salesStaffId: "staff-789", status: "PENDING_LOCK", priceAtLock: 3.25 },
  { id: "tx-2", productId: "prd-2", productCode: "VHO-S2.05-12A", salesStaffId: "staff-789", status: "PENDING_LOCK", priceAtLock: 4.10 },
  { id: "tx-3", productId: "prd-3", productCode: "VHO-S1.02-15", salesStaffId: "staff-789", status: "LOCKED", priceAtLock: 2.85 },
  { id: "tx-4", productId: "prd-4", productCode: "VHO-S3.01-20", salesStaffId: "staff-789", status: "LOCKED", priceAtLock: 5.50 },
  { id: "tx-5", productId: "prd-5", productCode: "VHO-S1.01-08", salesStaffId: "staff-789", status: "DEPOSIT", priceAtLock: 2.95 },
  { id: "tx-6", productId: "prd-6", productCode: "VHO-S1.05-22", salesStaffId: "staff-789", status: "SOLD", priceAtLock: 3.80 },
];

const KANBAN_COLUMNS = [
  { id: "PENDING_LOCK", label: "Chờ Duyệt Lock", color: "border-orange-500", bg: "bg-orange-50", icon: Clock },
  { id: "LOCKED", label: "Đã Lock", color: "border-blue-500", bg: "bg-blue-50", icon: ShieldCheck },
  { id: "DEPOSIT", label: "Đã Vào Cọc", color: "border-indigo-500", bg: "bg-indigo-50", icon: DollarSign },
  { id: "SOLD", label: "Chốt Bán", color: "border-green-500", bg: "bg-green-50", icon: CheckCircle2 },
];

export default function KanbanPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_DATA);
  const [role, setRole] = useState("sales_manager"); // mock role toggle
  
  const handleApprove = async (id: string, newStatus: TxStatus) => {
    // Optimistic UI update
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: newStatus } : tx));
  };

  const handleReject = async (id: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: "REJECTED" } : tx));
  };

  return (
    <div className="h-[90vh] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Kanban Giao Dịch
            <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">Live</span>
          </h1>
          <p className="text-slate-500 font-medium">Kéo thả hoặc sử dụng nút bấm để duyệt trạng thái (Mock data)</p>
        </div>
        <div className="flex bg-white/60 p-1 rounded-xl shadow-sm border border-white">
          <button 
           onClick={() => setRole("sales_staff")}
           className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${role === 'sales_staff' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>
            Góc nhìn NVKD
          </button>
          <button 
           onClick={() => setRole("sales_manager")}
           className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${role === 'sales_manager' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-white'}`}>
            Góc nhìn TPKD
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => {
           const colTxs = transactions.filter(t => t.status === col.id);
           
           return (
             <div key={col.id} className="flex-none w-80 flex flex-col h-full bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg overflow-hidden">
               <div className={`p-4 border-t-4 ${col.color} bg-white/60 flex justify-between items-center`}>
                 <h3 className="font-bold flex items-center gap-2 text-slate-700">
                    <col.icon className="w-5 h-5 text-slate-600" />
                    {col.label}
                 </h3>
                 <span className="bg-slate-200 text-slate-600 font-bold px-2.5 py-0.5 text-sm rounded-full">{colTxs.length}</span>
               </div>
               
               <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                 {colTxs.map(tx => (
                   <div key={tx.id} className={`p-4 rounded-xl shadow-md border border-white bg-white/80 hover:bg-white hover:scale-[1.02] hover:shadow-xl transition-all cursor-grab relative group`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-sm">{tx.productCode}</span>
                        <span className="text-xs font-bold text-slate-400">#{tx.id}</span>
                      </div>
                      <p className="text-slate-600 text-sm mb-1">Giá Lock: <strong className="text-slate-900">{tx.priceAtLock} Tỷ</strong></p>
                      <p className="text-slate-500 text-xs mb-3">Tạo bởi: {tx.salesStaffId}</p>
                      
                      {/* Actions based on Role & Status */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                         {role === 'sales_manager' && tx.status === 'PENDING_LOCK' && (
                           <>
                             <button onClick={() => handleApprove(tx.id, "LOCKED")} className="flex-1 py-1.5 text-xs font-bold bg-green-500 text-white rounded shadow-sm hover:bg-green-600">Duyệt Lock</button>
                             <button onClick={() => handleReject(tx.id)} className="flex-1 py-1.5 text-xs font-bold bg-red-50 text-red-600 rounded hover:bg-red-100">Từ Chối</button>
                           </>
                         )}
                         {role === 'sales_manager' && tx.status === 'LOCKED' && (
                           <button onClick={() => handleApprove(tx.id, "DEPOSIT")} className="w-full py-1.5 text-xs font-bold bg-indigo-500 text-white rounded shadow-sm hover:bg-indigo-600 flex justify-center items-center">
                             Chuyển Sang Cọc <ChevronRight className="w-3 h-3 ml-1" />
                           </button>
                         )}
                         {role === 'sales_manager' && tx.status === 'DEPOSIT' && (
                           <button onClick={() => handleApprove(tx.id, "SOLD")} className="w-full py-1.5 text-xs font-bold bg-green-600 text-white rounded shadow-sm hover:bg-green-700 flex justify-center items-center">
                             Chốt Bán (Sold) <CheckCircle2 className="w-3 h-3 ml-1" />
                           </button>
                         )}
                         {role === 'sales_staff' && tx.status === 'PENDING_LOCK' && (
                           <span className="w-full py-1 text-xs text-center text-orange-600 font-medium italic">Đang chờ sếp duyệt...</span>
                         )}
                      </div>
                   </div>
                 ))}
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );
}
