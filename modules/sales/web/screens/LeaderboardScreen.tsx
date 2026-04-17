import React, { useState } from 'react';
import { Trophy, Medal, MapPin, Users, Award, TrendingUp, Building2, Crown, User } from 'lucide-react';
import { useTopSellers, useTeamPerformance, formatVND } from '../hooks/useSalesData';
import { SkeletonLeaderboard } from '../components/shared';

// ═══════════════════════════════════════════════════════════
// LEADERBOARD SCREEN — Global Rankings
// Neo-Glassmorphism v2.2
// ═══════════════════════════════════════════════════════════

export function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<'sales' | 'teams'>('sales');

  const { data: topSellers, loading: sellersLoading } = useTopSellers(50);
  const { data: topTeams, loading: teamsLoading } = useTeamPerformance();

  // Sort teams by GMV just in case hook doesn't
  const sortedTeams = [...(topTeams || [])].sort((a, b) => b.gmv - a.gmv);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-[#0a0a0a]">
      {/* ════ HEADER ════ */}
      <div className="px-6 lg:px-10 py-8 border-b border-slate-100 dark:border-sg-border/40 bg-white dark:bg-sg-card backdrop-blur-xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy size={28} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-[28px] font-black text-sg-heading leading-tight tracking-tight">Bảng Xếp Hạng</h1>
              <p className="text-[13px] font-bold text-sg-muted mt-1">Đường đua doanh số SGroup Real Estate</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex p-1.5 bg-sg-btn-bg border border-sg-border rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-black transition-all ${
                activeTab === 'sales'
                  ? 'bg-white dark:bg-sg-card text-amber-500 shadow-sm border border-sg-border/50'
                  : 'text-sg-muted hover:text-sg-heading'
              }`}
            >
              <User size={16} /> Top Cá Nhân
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-black transition-all ${
                activeTab === 'teams'
                  ? 'bg-white dark:bg-sg-card text-emerald-500 shadow-sm border border-sg-border/50'
                  : 'text-sg-muted hover:text-sg-heading'
              }`}
            >
              <Users size={16} /> Top Phòng Ban
            </button>
          </div>
        </div>
      </div>

      {/* ════ CONTENT ════ */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-10">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* TAB: TOP SALES */}
          {activeTab === 'sales' && (
            <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-sg-max border border-slate-200/80 dark:border-sg-border p-6 lg:p-8 shadow-sg-lg sg-stagger">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[18px] font-black text-sg-heading flex items-center gap-2">
                  <Medal className="text-amber-500" size={20} /> Top Sales Xuất Sắc
                </h2>
                <span className="text-[11px] font-bold text-sg-muted bg-sg-card/50 px-3 py-1 rounded-lg">Cập nhật realtime</span>
              </div>

              {sellersLoading ? (
                <div className="space-y-4"><SkeletonLeaderboard /><SkeletonLeaderboard /></div>
              ) : (
                <div className="space-y-4">
                  {(topSellers || []).map((seller, idx) => (
                    <div
                      key={seller.staffId}
                      className="flex items-center gap-4 p-4 lg:p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-amber-500/30 hover:bg-white dark:hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 transition-all group sg-stagger"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      {/* Rank Number */}
                      <div className="relative shrink-0 flex items-center justify-center w-12 h-12">
                        {idx === 0 ? <Crown size={36} className="text-amber-500 drop-shadow-[0_4px_8px_rgba(245,158,11,0.4)]" /> :
                         idx === 1 ? <Medal size={28} className="text-slate-400 drop-shadow-md" /> :
                         idx === 2 ? <Medal size={28} className="text-orange-500 drop-shadow-md" /> :
                         <span className="text-[16px] font-black text-sg-muted opacity-50">#{idx + 1}</span>}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 p-0.5 shadow-md">
                         <div className="w-full h-full rounded-[10px] bg-white dark:bg-sg-card flex items-center justify-center overflow-hidden">
                           <span className="text-[16px] font-black text-amber-500">{seller.staffName.charAt(0)}</span>
                         </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="block text-[15px] font-black text-sg-heading truncate group-hover:text-amber-500 transition-colors">
                          {seller.staffName}
                        </span>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-sg-muted">
                          <span className="flex items-center gap-1"><Building2 size={12} /> {seller.teamName}</span>
                          <span className="flex items-center gap-1 text-emerald-500"><TrendingUp size={12} /> {seller.deals} deals</span>
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="text-right">
                        <span className="block text-[18px] font-black text-transparent bg-clip-text bg-linear-to-r from-amber-500 to-orange-500">
                          {formatVND(seller.gmv)}
                        </span>
                        <span className="block text-[10px] font-bold text-sg-muted uppercase tracking-widest mt-0.5">Tổng GMV</span>
                      </div>
                    </div>
                  ))}

                  {(!topSellers || topSellers.length === 0) && (
                    <div className="py-12 flex flex-col items-center justify-center text-sg-muted">
                      <Trophy size={48} className="opacity-20 mb-4" />
                      <p className="text-[14px] font-bold">Chưa có dữ liệu xếp hạng</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: TOP TEAMS */}
          {activeTab === 'teams' && (
            <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-sg-max border border-slate-200/80 dark:border-sg-border p-6 lg:p-8 shadow-sg-lg sg-stagger">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[18px] font-black text-sg-heading flex items-center gap-2">
                  <Award className="text-emerald-500" size={20} /> Top Phòng Ban Xuất Sắc
                </h2>
                <span className="text-[11px] font-bold text-sg-muted bg-sg-card/50 px-3 py-1 rounded-lg">Cập nhật realtime</span>
              </div>

              {teamsLoading ? (
                <div className="space-y-4"><SkeletonLeaderboard /><SkeletonLeaderboard /></div>
              ) : (
                <div className="space-y-4">
                  {sortedTeams.map((team, idx) => (
                    <div
                      key={team.teamId}
                      className="flex items-center gap-4 p-4 lg:p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group sg-stagger"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      {/* Rank Number */}
                      <div className="relative shrink-0 flex items-center justify-center w-12 h-12">
                        {idx === 0 ? <Crown size={36} className="text-emerald-500 drop-shadow-[0_4px_8px_rgba(16,185,129,0.4)]" /> :
                         idx === 1 ? <Medal size={28} className="text-teal-500 drop-shadow-md" /> :
                         idx === 2 ? <Medal size={28} className="text-cyan-500 drop-shadow-md" /> :
                         <span className="text-[16px] font-black text-sg-muted opacity-50">#{idx + 1}</span>}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="block text-[16px] font-black text-sg-heading truncate group-hover:text-emerald-500 transition-colors">
                          {team.teamName}
                        </span>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-sg-muted bg-sg-btn-bg px-2 py-0.5 rounded-md">
                            <Users size={12} /> {team.staffCount} nhân sự
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            <TrendingUp size={12} /> {team.closedDeals} deals
                          </span>
                        </div>
                      </div>

                      {/* Revenue */}
                      <div className="text-right">
                        <span className="block text-[18px] font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-500">
                          {formatVND(team.gmv)}
                        </span>
                        <span className="block text-[10px] font-bold text-sg-muted uppercase tracking-widest mt-0.5">GMV Phòng</span>
                      </div>
                    </div>
                  ))}

                  {sortedTeams.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-sg-muted">
                      <Users size={48} className="opacity-20 mb-4" />
                      <p className="text-[14px] font-bold">Chưa có dữ liệu phòng ban</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
