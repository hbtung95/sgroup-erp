import React, { useState } from 'react';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, 
  Award, FileLock2, PenTool, Download, Lock, TrendingUp, CheckCircle, Clock, Star 
} from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../hooks/useHR';

const TABS = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'skills', label: 'Kỹ năng & Hiệu suất' },
  { key: 'timeline', label: 'Hành trình' },
];

export function EmployeeProfileScreen({ routeParams }: { routeParams?: URLSearchParams }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('overview');
  
  const employeeId = routeParams?.get('id');
  const { data: employeesData } = useEmployees({ search: '' });
  const employeeList = Array.isArray(employeesData?.data) ? employeesData.data : (Array.isArray(employeesData) ? employeesData : []);
  
  let displayUser = user;
  if (employeeId && employeeList.length > 0) {
    const found = employeeList.find((e: any) => String(e.id) === String(employeeId));
    if (found) {
       displayUser = {
         ...user,
         id: found.id,
         name: found.fullName,
         email: found.email || user?.email,
         role: found.position?.name || user?.role,
         ...found
       };
    }
  }

  return (
    <div className="relative flex flex-col w-full h-full bg-sg-bg overflow-x-hidden text-sg-text custom-scrollbar">
      {/* Top Navigation Bar with Glassmorphism */}
      <div className="sticky top-0 z-40 flex items-center px-6 py-4 border-b border-sg-border bg-sg-card/80 backdrop-blur-xl">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-colors mr-4"
        >
          <ArrowLeft size={18} className="text-sg-text" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-sg-heading tracking-[0.5px]">Hồ Sơ Nhân Sự</h1>
          <p className="text-xs font-bold text-sg-subtext uppercase tracking-[1px] mt-0.5">
            Thông tin chi tiết và hiệu suất
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {/* Animated Aurora Cover Background */}
        <div className="absolute top-0 left-0 right-0 h-56 bg-gradient-to-br from-sg-red/20 to-blue-500/10 blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 mt-16 relative z-10 w-full flex flex-col gap-8">
          
          {/* Header Card */}
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl bg-sg-card border border-sg-border shadow-sg-light">
            <div className="w-28 h-28 flex-shrink-0 rounded-full flex items-center justify-center bg-sg-red/10 border-4 border-sg-red/20 text-sg-red">
              <User size={48} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left">
              <h2 className="text-3xl font-black text-sg-heading tracking-tight mb-1">
                {displayUser?.name || displayUser?.fullName || 'Nguyễn Văn A'}
              </h2>
              <p className="text-sm font-extrabold text-sg-red tracking-wide uppercase mb-4">
                {displayUser?.role || displayUser?.position?.name || 'Chuyên Viên Nhân Sự (HR)'}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-green-500/15 text-green-600 border border-green-500/20">
                  Đang làm việc
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-600 border border-blue-500/20">
                  S-Group Hội Sở
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-sg-btn-bg text-sg-muted border border-sg-border">
                  Full-time
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-sg-btn-bg p-1.5 rounded-2xl border border-sg-border self-start">
            {TABS.map(t => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                    isActive ? 'bg-sg-card text-sg-red shadow-sg-light border border-sg-border' : 'text-sg-muted hover:text-sg-text hover:bg-sg-border'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 animate-fade-in-up">
              
              <div className="flex flex-col gap-6">
                {/* Contact Info */}
                <div className="p-6 rounded-3xl bg-sg-card border border-sg-border shadow-sg-light flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-sg-red" />
                    <h3 className="text-base font-extrabold text-sg-red tracking-wide uppercase">Thông tin liên hệ</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    <DetailItem icon={Mail} label="Email" value={displayUser?.email || 'nguyenvana@sgroup.vn'} />
                    <DetailItem icon={Phone} label="Điện thoại" value={displayUser?.phone || "+84 987 654 321"} />
                    <DetailItem icon={MapPin} label="Địa chỉ" value="Tòa nhà S-Group, Quận 1, TP.HCM" />
                  </div>
                </div>

                {/* Job Info */}
                <div className="p-6 rounded-3xl bg-sg-card border border-sg-border shadow-sg-light flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-sg-red" />
                    <h3 className="text-base font-extrabold text-sg-red tracking-wide uppercase">Thông tin công việc</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    <DetailItem icon={Briefcase} label="Phòng ban" value={displayUser?.department?.name || "Phòng Nhân Sự (HR)"} />
                    <DetailItem icon={Calendar} label="Ngày gia nhập" value="15/03/2023" />
                    <DetailItem icon={ShieldCheck} label="Mã nhân viên" value={displayUser?.employeeCode || "SG-HR-0042"} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Quick Stats Grid */}
                <div className="p-6 rounded-3xl bg-sg-card border border-sg-border shadow-sg-light flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-green-500" />
                    <h3 className="text-base font-extrabold text-green-500 tracking-wide uppercase">Tổng quan nhanh</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 border border-blue-500/20 to-transparent flex flex-col gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <Award size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-widest mb-1">KPI Hiện Tại</span>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-black text-sg-heading">95%</span>
                          <span className="text-xs font-bold text-green-500 mb-1">+5%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 border border-amber-500/20 to-transparent flex flex-col gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                        <CheckCircle size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-widest mb-1">Nhiệm vụ Hoàn thành</span>
                        <span className="text-2xl font-black text-sg-heading mt-0.5">142</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ESS Widgets */}
                <div className="p-6 rounded-3xl bg-sg-card border border-sg-border shadow-sg-light flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <FileLock2 size={18} className="text-pink-500" />
                    <h3 className="text-base font-extrabold text-pink-500 tracking-wide uppercase">Tài liệu & Chứng từ</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* Payslip Card */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-sg-border bg-sg-btn-bg hover:bg-sg-border cursor-pointer transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20 text-emerald-500 group-hover:scale-105 transition-transform">
                          <FileLock2 size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-sg-heading">Phiếu lương Tháng 02/2026</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Lock size={12} className="text-sg-muted" />
                            <span className="text-[11px] font-bold text-sg-muted">Yêu cầu mật khẩu để mở</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-sg-card flex items-center justify-center text-sg-muted border border-sg-border group-hover:text-sg-text transition-colors">
                        <Download size={16} />
                      </div>
                    </div>

                    {/* e-Signature Card */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                          <PenTool size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-blue-500">Phụ lục HĐLĐ 2026</span>
                          <span className="text-[11px] font-bold text-sg-subtext mt-1">Cần chữ ký số (e-Signature) của bạn</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-blue-500 group-hover:text-blue-600 tracking-wide uppercase px-3">Ký ngay</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab Content: Skills */}
          {activeTab === 'skills' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 animate-fade-in-up">
                {/* KPIs Core */}
                <div className="p-6 rounded-3xl bg-sg-card border border-sg-border shadow-sg-light flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Star size={18} className="text-amber-500" />
                    <h3 className="text-base font-extrabold text-amber-500 tracking-wide uppercase">Chỉ số KPIs cốt lõi</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    <KpiRow title="Chăm sóc nhân viên" value="85%" trend={12} />
                    <KpiRow title="Tuyển dụng" value="7" trend={-2} />
                    <KpiRow title="Đào tạo hội nhập" value="4" trend={0} />
                  </div>
                </div>

                {/* Professional Skills */}
                <div className="p-6 rounded-3xl bg-sg-card border border-sg-border shadow-sg-light flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <Award size={18} className="text-sg-red" />
                    <h3 className="text-base font-extrabold text-sg-red tracking-wide uppercase">Kỹ năng chuyên môn</h3>
                  </div>
                  <div className="flex flex-col gap-6">
                    <SkillRow title="Luật Lao Động" percent={90} colorClass="bg-green-500" />
                    <SkillRow title="Đánh giá Năng lực" percent={75} colorClass="bg-sg-red" />
                    <SkillRow title="Data Analytics HR" percent={50} colorClass="bg-amber-500" />
                  </div>
                </div>
             </div>
          )}

          {/* Tab Content: Timeline */}
          {activeTab === 'timeline' && (
             <div className="w-full max-w-3xl animate-fade-in-up pb-6">
               <div className="p-8 rounded-3xl bg-sg-card border border-sg-border shadow-sg-light flex flex-col gap-8">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-sg-muted" />
                    <h3 className="text-base font-extrabold text-sg-text tracking-wide uppercase">Hành trình phát triển</h3>
                  </div>

                  <div className="relative pl-6 border-l-2 border-sg-border flex flex-col gap-10">
                    <TimelineItem 
                      title="Đánh giá xuất sắc (Q1/2026)"
                      desc="Đạt danh hiệu nhân viên xuất sắc quý 1."
                      date="15/03/2026"
                      icon={<Star size={14} className="text-amber-500" />}
                      iconBg="bg-amber-500/15 border-amber-500/30"
                    />
                    <TimelineItem 
                      title="Thăng tiến"
                      desc="Chuyên viên Nhân sự (HR)"
                      date="01/01/2025"
                      icon={<TrendingUp size={14} className="text-green-500" />}
                      iconBg="bg-green-500/15 border-green-500/30"
                    />
                    <TimelineItem 
                      title="Hoàn thành thử việc"
                      desc="Chính thức gia nhập S-Group"
                      date="15/05/2023"
                    />
                    <TimelineItem 
                      title="Gia nhập S-Group"
                      desc="Vị trí Thực tập sinh Nhân sự"
                      date="15/03/2023"
                      icon={<CheckCircle size={14} className="text-blue-500" />}
                      iconBg="bg-blue-500/15 border-blue-500/30"
                    />
                  </div>
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-sg-btn-bg border border-sg-border flex items-center justify-center flex-shrink-0 text-sg-muted">
        <Icon size={16} />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-sg-muted uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-sm font-semibold text-sg-text">{value}</span>
      </div>
    </div>
  );
}

function KpiRow({ title, value, trend }: { title: string, value: string, trend: number }) {
  const isUp = trend > 0;
  const isDown = trend < 0;
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-sg-btn-bg border border-sg-border">
      <span className="text-sm font-extrabold text-sg-text">{title}</span>
      <div className="flex items-center gap-3">
        <span className="text-lg font-black text-sg-heading">{value}</span>
        {trend !== 0 && (
          <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${isUp ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500'}`}>
            {isUp ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  )
}

function SkillRow({ title, percent, colorClass }: { title: string, percent: number, colorClass: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-extrabold text-sg-text">{title}</span>
        <span className="text-sm font-bold text-sg-subtext">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-sg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function TimelineItem({ title, desc, date, icon, iconBg }: { title: string, desc: string, date: string, icon?: React.ReactNode, iconBg?: string }) {
  return (
    <div className="relative">
      <div className={`absolute -left-[37px] w-6 h-6 rounded-full border-2 flex items-center justify-center bg-sg-card ${iconBg || 'border-sg-border'}`}>
        {icon || <div className="w-1.5 h-1.5 rounded-full bg-sg-subtext" />}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-sg-muted uppercase tracking-widest mb-1">{date}</span>
        <h4 className="text-sm font-black text-sg-heading mb-1.5">{title}</h4>
        <p className="text-sm font-medium text-sg-subtext">{desc}</p>
      </div>
    </div>
  );
}
