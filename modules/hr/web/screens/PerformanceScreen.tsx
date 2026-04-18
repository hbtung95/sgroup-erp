import React, { useState } from 'react';
import { TrendingUp, Target, Award, Star, Search, CheckCircle, Clock, LayoutGrid, List, Medal, Crown } from 'lucide-react';
import { usePerformance } from '../hooks/useHR';
import type { HRRole } from '../HRSidebar';

const currentYear = new Date().getFullYear();

function scoreToRating(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  return 'C';
}

const RATING_COLORS: Record<string, string> = {
  'A': 'text-purple-500',
  'A-': 'text-blue-500',
  'B+': 'text-emerald-500',
  'B': 'text-amber-500',
  'C': 'text-red-500',
  '-': 'text-slate-400',
};

export function PerformanceScreen({ userRole }: { userRole?: HRRole }) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${currentYear}`;
  const { data: rawPerformance, isLoading } = usePerformance({ period: currentQuarter });
  const safePerformance = Array.isArray(rawPerformance) ? rawPerformance : (rawPerformance as any)?.data ?? [];

  const perfData = safePerformance.map((p: any) => {
    const score = p.overallScore || 0;
    const statusMap: Record<string, string> = { DRAFT: 'NOT_STARTED', SUBMITTED: 'IN_PROGRESS', ACKNOWLEDGED: 'COMPLETED' };
    return {
      id: p.id,
      code: p.employee?.employeeCode || '',
      name: p.employee?.fullName || '',
      dept: p.employee?.department?.name || 'Vận Hành',
      role: 'Chuyên viên',
      target: 100,
      actual: Math.round(score),
      rating: score > 0 ? scoreToRating(score) : '-',
      status: statusMap[p.status] || p.status,
    };
  }).filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()));

  const completedCount = perfData.filter((r: any) => r.status === 'COMPLETED').length;
  const inProgressCount = perfData.filter((r: any) => r.status === 'IN_PROGRESS').length;
  const highPerformers = perfData.filter((r: any) => ['A', 'A-'].includes(r.rating)).length;
  const completePct = perfData.length > 0 ? Math.round(completedCount / perfData.length * 100) : 0;

  return (
    <div className="p-8 pb-32 animate-sg-fade-in flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-[20px] bg-emerald-500/10 flex items-center justify-center shadow-sm">
            <TrendingUp size={28} className="text-emerald-500" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[32px] font-black text-sg-heading tracking-tight leading-none">Đánh giá Hiệu suất (KPIs)</h2>
            <p className="text-[15px] font-medium text-sg-subtext mt-1.5">Kỳ đánh giá: {currentQuarter}</p>
          </div>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all text-[13px] font-black uppercase tracking-wider">
          TẠO KỲ ĐÁNH GIÁ MỚI
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TỔNG NHẬN ĐÁNH GIÁ', val: String(perfData.length), unit: 'người', icon: Target, bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-500' },
          { label: 'TỈ LỆ HOÀN TẤT', val: String(completePct), unit: '%', icon: CheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-500/10', color: 'text-emerald-500' },
          { label: 'XẾP LOẠI A & A-', val: String(highPerformers), unit: 'người', icon: Star, bg: 'bg-purple-50 dark:bg-purple-500/10', color: 'text-purple-500' },
          { label: 'ĐANG ĐÁNH GIÁ', val: String(inProgressCount), unit: 'người', icon: Clock, bg: 'bg-amber-50 dark:bg-amber-500/10', color: 'text-amber-500' },
        ].map((s, i) => (
          <div key={i} className="bg-sg-card border border-sg-border p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex flex-row items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <span className="text-[11px] font-black text-sg-subtext uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[36px] font-black text-sg-heading tracking-tight leading-none">{s.val}</span>
              <span className="text-[14px] font-bold text-sg-subtext">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gamification Leaderboard */}
      <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-500/10 dark:to-sg-portal-bg border border-amber-200 dark:border-amber-500/20 rounded-[28px] p-8 shadow-sm flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col justify-center min-w-[200px]">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-4">
            <Crown size={28} className="text-amber-500" />
          </div>
          <h3 className="text-[22px] font-black text-sg-heading tracking-tight">Bảng Vàng Thành Tích</h3>
          <p className="text-[13px] font-bold text-sg-subtext mt-1.5">Top 3 cá nhân xuất sắc nhất Quý</p>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Nguyễn Văn A', role: 'Trưởng phòng Kinh Doanh', score: 98, badge: 'Vua Doanh Số', color: 'text-amber-500', bgBadge: 'bg-amber-500/15' },
            { name: 'Trần Thị B', role: 'Chuyên viên Marketing', score: 95, badge: 'Sáng tạo', color: 'text-slate-500 dark:text-slate-400', bgBadge: 'bg-slate-500/15' },
            { name: 'Lê Văn C', role: 'Dev Lead', score: 92, badge: 'Bug Hunter', color: 'text-orange-600 dark:text-orange-500', bgBadge: 'bg-orange-500/15' },
          ].map((lb, idx) => (
            <div key={idx} className="bg-sg-card/80 backdrop-blur-md border border-sg-border rounded-[20px] p-5 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[15px] font-black ${lb.color}`}>#{idx + 1}</span>
                  {idx === 0 ? <Crown size={16} className={lb.color} /> : <Medal size={16} className={lb.color} />}
                </div>
                <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-wider ${lb.bgBadge} ${lb.color}`}>
                  {lb.badge}
                </span>
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-[16px] font-black text-sg-heading leading-tight truncate">{lb.name}</span>
                <span className="text-[12px] font-bold text-sg-subtext uppercase tracking-wider mt-1 truncate">{lb.role}</span>
              </div>
              <div className="mt-auto pt-2 flex items-baseline gap-1">
                <span className={`text-[28px] font-black tracking-tight ${lb.color}`}>{lb.score}</span>
                <span className={`text-[14px] font-bold ${lb.color}`}>% KPI</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex flex-row bg-sg-card border border-sg-border p-1 rounded-xl shadow-sm">
          <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-sg-btn-bg text-sg-heading shadow-sm' : 'text-sg-subtext hover:text-sg-heading'}`}>
            <List size={20} />
          </button>
          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-sg-btn-bg text-sg-heading shadow-sm' : 'text-sg-subtext hover:text-sg-heading'}`}>
            <LayoutGrid size={20} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-row items-center gap-3 bg-sg-card border border-sg-border rounded-xl px-5 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500">
          <Search size={20} className="text-sg-muted" />
          <input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm nhân viên, phòng ban..."
            className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-sg-heading placeholder:text-sg-subtext"
          />
        </div>
      </div>

      {/* Content View */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-sm font-bold text-sg-subtext">Đang tải dữ liệu OKR/KPIs...</span>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-sg-card border border-sg-border rounded-[28px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-sg-btn-bg/50 border-b border-sg-border">
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider">Nhân viên</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider">Vị trí</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider w-[240px]">Tiến độ KPIs</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider text-center">Xếp loại</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider text-center">Trạng thái</th>
                  <th className="px-6 py-5 text-[12px] font-black text-sg-subtext uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sg-border">
                {perfData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-[15px] font-medium text-sg-subtext">Không có dữ liệu đánh giá nào trong khoảng này.</td>
                  </tr>
                )}
                {perfData.map((item: any) => {
                  let bg = 'bg-sg-btn-bg/50', text = 'text-sg-subtext', label = 'CHƯA BẮT ĐẦU';
                  if (item.status === 'COMPLETED') { bg = 'bg-emerald-500/15'; text = 'text-emerald-500'; label = 'ĐÃ HOÀN TẤT'; }
                  if (item.status === 'IN_PROGRESS') { bg = 'bg-amber-500/15'; text = 'text-amber-500'; label = 'ĐANG ĐÁNH GIÁ'; }
                  
                  return (
                    <tr key={item.id} className="hover:bg-sg-btn-bg/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-sg-heading">{item.name}</span>
                          <span className="text-[12px] font-medium text-sg-subtext mt-0.5">{item.code} • {item.dept}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-medium text-sg-heading">{item.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className={`text-[12px] font-black ${item.actual >= 100 ? 'text-emerald-500' : item.actual >= 80 ? 'text-amber-500' : 'text-red-500'}`}>{item.actual}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-sg-btn-bg rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.actual >= 100 ? 'bg-emerald-500' : item.actual >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(item.actual, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[18px] font-black ${RATING_COLORS[item.rating] || 'text-sg-heading'}`}>{item.rating}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1.5 rounded-[8px] text-[10px] font-black tracking-wider uppercase ${bg} ${text}`}>{label}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[13px] font-bold text-blue-500 hover:text-blue-600">Chi tiết</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {perfData.map((item: any) => {
            let bg = 'bg-sg-btn-bg', text = 'text-sg-subtext', label = 'CHƯA BẮT ĐẦU';
            if (item.status === 'COMPLETED') { bg = 'bg-emerald-500/15'; text = 'text-emerald-500'; label = 'HOÀN TẤT'; }
            if (item.status === 'IN_PROGRESS') { bg = 'bg-amber-500/15'; text = 'text-amber-500'; label = 'ĐANG ĐG'; }
            
            return (
              <div key={item.id} className="bg-sg-card border border-sg-border p-6 rounded-[28px] shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3 w-full pr-4">
                    <div className="w-12 h-12 rounded-full border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Target size={20} className="text-emerald-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[16px] font-black text-sg-heading truncate w-full">{item.name}</span>
                      <span className="text-[12px] font-bold text-sg-subtext mt-1 truncate">{item.code} • {item.dept}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-wider ${bg} ${text}`}>{label}</span>
                </div>

                <div className="flex flex-col gap-2 mb-6 px-1">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[12px] font-black uppercase tracking-wider text-sg-subtext">Tiến độ KPIs</span>
                    <span className={`text-[20px] font-black leading-none ${item.actual >= 100 ? 'text-emerald-500' : item.actual >= 80 ? 'text-amber-500' : 'text-red-500'}`}>{item.actual}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-sg-btn-bg rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.actual >= 100 ? 'bg-emerald-500' : item.actual >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(item.actual, 100)}%` }} />
                  </div>
                </div>

                <div className="mt-auto pt-5 border-t border-sg-border flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-sg-subtext uppercase tracking-wider mb-0.5">XẾP LOẠI</span>
                    <span className={`text-[24px] font-black leading-none ${RATING_COLORS[item.rating] || 'text-sg-heading'}`}>{item.rating}</span>
                  </div>
                  <button className="px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 font-black text-[12px] uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                    Chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
