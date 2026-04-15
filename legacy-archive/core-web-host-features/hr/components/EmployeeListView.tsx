import React from 'react';
import { Pencil } from 'lucide-react';
import { Employee } from '../types';
import { getInitials, nameToColorClass, STATUS_OPTIONS } from '../constants';

export interface EmployeeListViewProps {
  employees: Employee[];
  canEdit: boolean;
  onEdit: (employee: Employee) => void;
}

export function EmployeeListView({ employees, canEdit, onEdit }: EmployeeListViewProps) {
  return (
    <div className="bg-sg-card border border-sg-border rounded-sg-xl overflow-hidden shadow-sm">
      <table className="w-full text-left border-collapse">
         <thead>
            <tr className="bg-sg-btn-bg border-b border-sg-border">
               <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] w-2/5">Họ Tên</th>
               <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] w-1/4">Chức vụ / Phòng ban</th>
               <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] w-1/5">Liên hệ</th>
               <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] text-center">Trạng thái</th>
               {canEdit && <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] text-right"></th>}
            </tr>
         </thead>
         <tbody className="divide-y divide-sg-border">
            {employees.map((staff) => {
              const clr = nameToColorClass(staff.fullName || '');
              const st = STATUS_OPTIONS.find(s => s.value === staff.status) || STATUS_OPTIONS[0];
              return (
                <tr key={staff.id} onClick={() => window.location.hash = `hr_profile?id=${staff.id}`} className="hover:bg-sg-btn-bg transition-colors group cursor-pointer">
                   <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${clr.bg} border ${clr.border}`}>
                           <span className={`text-[13px] font-black ${clr.text}`}>{getInitials(staff.fullName || '')}</span>
                         </div>
                         <div>
                            <h5 className="text-[14px] font-extrabold text-sg-heading">{staff.fullName}</h5>
                            <span className="text-[12px] font-medium text-sg-subtext">{staff.code}</span>
                         </div>
                      </div>
                   </td>
                   <td className="px-6 py-4">
                      <span className="text-[13px] font-bold text-sg-heading block mb-1">{staff.position?.name || 'Nhân viên'}</span>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                        <span className="text-[12px] font-medium text-sg-subtext">{staff.department?.name || '—'}</span>
                        {staff.team?.name && (
                          <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                            <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wide">{staff.team.name}</span>
                          </div>
                        )}
                      </div>
                   </td>
                   <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-sg-heading block truncate mb-1" title={staff.email}>{staff.email || '—'}</span>
                      <span className="text-[12px] font-medium text-sg-subtext block">{staff.phone || '—'}</span>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${st.bg} ${st.color} border ${st.border}`}>
                        {st.label}
                      </span>
                   </td>
                   {canEdit && (
                     <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(staff); }} 
                          className="p-2 rounded-lg text-sg-muted hover:text-sg-heading hover:bg-sg-card transition-colors border border-transparent hover:border-sg-border shadow-sm opacity-0 group-hover:opacity-100"
                        >
                           <Pencil size={16} />
                        </button>
                     </td>
                   )}
                </tr>
              )
            })}
         </tbody>
      </table>
    </div>
  );
}
