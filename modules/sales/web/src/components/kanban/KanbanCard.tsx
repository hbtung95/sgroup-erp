"use client";

import React from "react";
import { ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import type { Transaction, TxStatus } from "../../lib/types";

type KanbanCardProps = {
  tx: Transaction;
  role: string;
  colId: string;
  onApprove: (id: string, newStatus: TxStatus) => void;
  onReject: (id: string) => void;
};

export default function KanbanCard({ tx, role, colId, onApprove, onReject }: KanbanCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    // Only Sales Manager can drag cards, or we can restrict it in drop logic
    if (role === 'sales_manager') {
      e.dataTransfer.setData('txId', tx.id);
      e.dataTransfer.setData('sourceCol', colId);
      e.currentTarget.classList.add('opacity-40');
    } else {
      e.preventDefault();
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
  };

  return (
    <div 
      draggable={role === 'sales_manager'}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`p-5 rounded-2xl border border-white/[0.08] bg-slate-900/70 backdrop-blur-sm hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300 flex flex-col ${role === 'sales_manager' ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
       <div className="flex justify-between items-center mb-3">
         <span className={`font-black text-sm px-2.5 py-1 rounded-md shadow-sm border ${colId === 'SOLD' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>{tx.productCode}</span>
         <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-white/5">#{tx.id.split('-')[1]}</span>
       </div>
       <p className="text-slate-300 text-sm mb-4 font-medium flex items-center">
           Giá cam kết: <strong className="text-emerald-400 ml-2 text-base">{tx.priceAtLock} Tỷ</strong>
       </p>
       
       <div className="bg-white/[0.02] rounded-xl p-3 mb-4 border border-white/[0.03]">
          <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold mb-1">Môi giới viên</p>
          <p className="text-slate-200 text-sm font-semibold truncate flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px]">{tx.salesStaffName?.charAt(0)}</span>
              {tx.salesStaffName}
          </p>
       </div>
       
       <div className="mt-auto">
          {role === 'sales_manager' && tx.status === 'PENDING_LOCK' && (
            <div className="flex gap-2">
              <button onClick={() => onApprove(tx.id, "LOCKED")} className="flex-1 py-2 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl shadow-sm hover:bg-emerald-500/30 hover:border-emerald-400 transition-all text-center">Xác Duyệt</button>
              <button onClick={() => onReject(tx.id)} className="flex-1 py-2 text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/30 transition-all flex items-center justify-center"><XCircle className="w-3.5 h-3.5 mr-1"/> Từ Chối</button>
            </div>
          )}
          {role === 'sales_manager' && tx.status === 'LOCKED' && (
            <button onClick={() => onApprove(tx.id, "DEPOSIT")} className="w-full py-2.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.4)] hover:brightness-110 flex justify-center items-center group transition-all">
              Khách Vào Cọc <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
          {role === 'sales_manager' && tx.status === 'DEPOSIT' && (
            <button onClick={() => onApprove(tx.id, "SOLD")} className="w-full py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:brightness-110 flex justify-center items-center transition-all">
              Xác Nhận HĐMB (Sold) <CheckCircle2 className="w-4 h-4 ml-1.5" />
            </button>
          )}
          {role === 'sales_staff' && tx.status === 'PENDING_LOCK' && (
            <div className="w-full py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-center text-orange-400 font-semibold italic">Đang chờ Sếp duyệt...</div>
          )}
          {role === 'sales_staff' && tx.status !== 'PENDING_LOCK' && (
              <div className="w-full h-8 flex items-center justify-center opacity-40"><span className="h-0.5 w-1/3 bg-slate-700 rounded-full"></span></div>
          )}
       </div>
    </div>
  );
}
