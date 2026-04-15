import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, UsersRound, History, ArrowRightLeft, UserCircle, Briefcase, Building, CreditCard } from 'lucide-react';
import { Department, Position, Team, TransferRecord } from '../types';
import { STATUS_OPTIONS } from '../constants';

const employeeSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').nonempty('Vui lòng nhập họ tên'),
  englishName: z.string().optional(),
  email: z.string().email('Email không hợp lệ').nonempty('Vui lòng nhập email'),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
  relativePhone: z.string().optional(),
  
  identityCard: z.string().optional(),
  idIssueDate: z.string().optional(),
  idIssuePlace: z.string().optional(),
  vnId: z.string().optional(),
  
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  permanentAddress: z.string().optional(),
  contactAddress: z.string().optional(),

  taxCode: z.string().optional(),
  insuranceBookNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),

  departmentId: z.string().optional(),
  positionId: z.string().optional(),
  teamId: z.string().optional(),
  status: z.string().nonempty('Trạng thái không được để trống'),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export interface EmployeeFormModalProps {
  mode: 'create' | 'edit';
  initialData?: Partial<EmployeeFormData>;
  deptOptions: Department[];
  posOptions: Position[];
  teamOptions: Team[];
  transfers: TransferRecord[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  onDeptChange: (deptId: string) => void;
}

export function EmployeeFormModal({
  mode,
  initialData,
  deptOptions,
  posOptions,
  teamOptions,
  transfers,
  isSaving,
  onClose,
  onSubmit,
  onDeptChange
}: EmployeeFormModalProps) {
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      status: 'ACTIVE',
      ...initialData,
    }
  });

  const departmentId = watch('departmentId');
  
  useEffect(() => {
    if (departmentId) {
      onDeptChange(departmentId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentId]);

  const ErrorMsg = ({ name }: { name: keyof EmployeeFormData }) => {
    const error = errors[name];
    if (!error) return null;
    return <span className="text-red-500 text-[10px] font-bold mt-1 block">{error.message}</span>;
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-8 animate-sg-fade-in bg-sg-heading/40 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-sg-portal-bg rounded-sg-2xl border border-sg-border/50 shadow-sg-xl animate-sg-slide-up overflow-hidden ring-1 ring-white/50 dark:ring-white/5">
         
         <div className="px-8 pt-6 pb-4 flex items-center justify-between z-10 bg-sg-portal-bg shrink-0 border-b border-sg-border/50">
            <h3 className="text-2xl font-black tracking-tight text-sg-heading flex items-center gap-3">
               <UserCircle className="text-sg-red" size={28} />
               {mode === 'edit' ? 'Chỉnh sửa hồ sơ nhân sự' : 'Thêm hồ sơ nhân viên mới'}
            </h3>
            <button onClick={onClose} className="p-2 -mr-2 text-sg-muted hover:bg-sg-border rounded-full transition-all hover:rotate-90">
              <X size={20} strokeWidth={2.5} />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-sg-border [&::-webkit-scrollbar-thumb]:rounded-full">
            <form id="employee-form" onSubmit={handleSubmit(onSubmit)} className="p-8 flex flex-col gap-10">
               
               {/* Section 1: Personal Info */}
               <div className="flex flex-col gap-5">
                 <h4 className="text-sm font-black text-sg-heading uppercase tracking-widest flex items-center gap-2 border-b border-sg-border/50 pb-2">
                    <UserCircle size={16} className="text-blue-500"/> Thông tin cá nhân
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Họ và tên <span className="text-sg-red">*</span></label>
                       <input {...register('fullName')} placeholder="Vui lòng nhập họ và tên" className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                       <ErrorMsg name="fullName" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Tên tiếng Anh (Tuỳ chọn)</label>
                       <input {...register('englishName')} placeholder="VD: John Doe" className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Căn cước công dân (CCCD)</label>
                       <input {...register('identityCard')} placeholder="012345678901" className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Ngày cấp</label>
                         <input type="date" {...register('idIssueDate')} className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                       </div>
                       <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Mã định danh VN</label>
                         <input {...register('vnId')} placeholder="MĐD..." className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                       </div>
                    </div>
                 </div>
               </div>

               {/* Section 2: Contact Info */}
               <div className="flex flex-col gap-5">
                 <h4 className="text-sm font-black text-sg-heading uppercase tracking-widest flex items-center gap-2 border-b border-sg-border/50 pb-2">
                    <UserCircle size={16} className="text-green-500"/> Thông tin liên hệ
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Email công ty <span className="text-sg-red">*</span></label>
                       <input {...register('email')} type="email" placeholder="email@sgroup.vn" className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                       <ErrorMsg name="email" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">SĐT Cá nhân</label>
                          <input {...register('phone')} type="tel" placeholder="090..." className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                          <ErrorMsg name="phone" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">SĐT Người thân</label>
                          <input {...register('relativePhone')} type="tel" placeholder="090..." className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                       </div>
                    </div>
                    <div className="col-span-full">
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Địa chỉ hiện tại</label>
                       <input {...register('address')} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                    </div>
                 </div>
               </div>

               {/* Section 3: Job Role */}
               <div className="flex flex-col gap-5">
                 <h4 className="text-sm font-black text-sg-heading uppercase tracking-widest flex items-center gap-2 border-b border-sg-border/50 pb-2">
                    <Briefcase size={16} className="text-purple-500"/> Vị trí & Công việc
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 block">Phòng ban</label>
                       <div className="flex flex-wrap gap-2">
                          {deptOptions.map(d => (
                            <button
                              type="button"
                              key={d.id}
                              onClick={() => setValue('departmentId', watch('departmentId') === d.id ? '' : d.id, { shouldValidate: true })}
                              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all shadow-sm
                                ${watch('departmentId') === d.id ? 'bg-sg-red/10 text-sg-red-dark border-sg-red/30' : 'bg-white dark:bg-white/5 border-sg-border/50 text-sg-subtext hover:border-sg-border'}
                              `}
                            >
                              {d.name}
                            </button>
                          ))}
                       </div>
                    </div>

                    {(watch('departmentId') && teamOptions.length > 0) && (
                       <div className="flex flex-col gap-2 animate-sg-fade-in-up">
                         <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 flex items-center gap-1.5">Thuộc Team</label>
                         <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setValue('teamId', '')}
                              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all shadow-sm
                                ${!watch('teamId') ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white dark:bg-white/5 border-sg-border/50 text-sg-subtext'}
                              `}
                            >
                              Không gắn
                            </button>
                            {teamOptions.map(t => (
                              <button
                                type="button"
                                key={t.id}
                                onClick={() => setValue('teamId', watch('teamId') === t.id ? '' : t.id)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all shadow-sm
                                  ${watch('teamId') === t.id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white dark:bg-white/5 border-sg-border/50 text-sg-subtext'}
                                `}
                              >
                                {t.name}
                              </button>
                            ))}
                         </div>
                       </div>
                    )}
                    
                    <div className="flex flex-col gap-2 col-span-full">
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 block">Chức danh</label>
                       <div className="flex flex-wrap gap-2">
                          {posOptions.map(p => (
                            <button
                              type="button"
                              key={p.id}
                              onClick={() => setValue('positionId', watch('positionId') === p.id ? '' : p.id)}
                              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all shadow-sm
                                ${watch('positionId') === p.id ? 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white dark:bg-white/5 border-sg-border/50 text-sg-subtext'}
                              `}
                            >
                              {p.name}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
               </div>

               {/* Section 4: Bank & Tax */}
               <div className="flex flex-col gap-5">
                 <h4 className="text-sm font-black text-sg-heading uppercase tracking-widest flex items-center gap-2 border-b border-sg-border/50 pb-2">
                    <CreditCard size={16} className="text-amber-500"/> Thuế & Thanh toán
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Mã số thuế</label>
                       <input {...register('taxCode')} placeholder="..." className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Số sổ bảo hiểm</label>
                       <input {...register('insuranceBookNumber')} placeholder="..." className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Ngân hàng</label>
                       <input {...register('bankName')} placeholder="MBBank..." className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 mb-1.5 block">Số tài khoản</label>
                       <input {...register('bankAccount')} placeholder="..." className="h-11 w-full bg-white dark:bg-white/5 border border-sg-border/50 rounded-xl px-4 text-[14px] font-bold text-sg-heading placeholder:text-sg-muted/50 focus:outline-none focus:border-sg-red focus:ring-4 focus:ring-sg-red/10 transition-all" />
                    </div>
                 </div>
               </div>

               {/* Section 5: Status */}
               <div className="flex flex-col gap-2 pt-4 border-t border-sg-border/50">
                 <label className="text-[10px] font-black uppercase tracking-widest text-sg-subtext/70 block">Trạng thái làm việc <span className="text-sg-red">*</span></label>
                 <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        type="button"
                        key={s.value}
                        onClick={() => setValue('status', s.value, { shouldValidate: true })}
                        className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all shadow-sm
                          ${watch('status') === s.value ? `${s.bg} ${s.border} ${s.color} ring-2 ring-offset-2 ring-${s.color?.split('-')[1]}-500/50` : 'bg-white dark:bg-white/5 border-sg-border/50 text-sg-subtext'}
                        `}
                      >
                        {s.label}
                      </button>
                    ))}
                 </div>
                 <ErrorMsg name="status" />
               </div>

            </form>
         </div>

         {/* Modal Footer */}
         <div className="px-8 pb-6 pt-4 flex gap-4 shrink-0 bg-sg-portal-bg border-t border-sg-border/50">
            <button type="button" onClick={onClose} className="flex-1 h-12 rounded-2xl border border-sg-border/50 bg-white dark:bg-white/5 text-sg-subtext font-bold text-[14px] hover:text-sg-heading hover:border-sg-heading/30 transition-all shadow-sm">
               Huỷ & Đóng
            </button>
            <button type="submit" form="employee-form" disabled={isSaving} className={`flex-2 h-12 rounded-2xl font-black text-[14px] text-white transition-all shadow-sg-brand
              ${isSaving ? 'bg-sg-muted cursor-not-allowed' : 'bg-sg-red hover:bg-sg-red-light transform hover:-translate-y-0.5'}
            `}>
               {isSaving ? 'ĐANG LƯU...' : mode === 'edit' ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN THÊM NHÂN SỰ'}
            </button>
         </div>
      </div>
    </div>
  );
}
