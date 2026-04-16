import React from 'react';
import {
  Building2, Users, TrendingUp, Target, Loader2,
  DollarSign, Award, BarChart3, ChevronRight,
} from 'lucide-react';
import { useTeamPerformance, useTeams, formatVND, formatPercent } from '../hooks/useSalesData';
import { SkeletonCard, AnimatedCounter } from '../components/shared';

// ═══════════════════════════════════════════════════════════
// DEPARTMENT SCREEN — Sales Divisions & Performance Cards
// Neo-Glassmorphism v2.2 • sg-stagger • gradient cards
// ═══════════════════════════════════════════════════════════

const TEAM_GRADIENTS = [
  { bar: 'from-emerald-400 to-teal-600',   bg: 'bg-emerald-500', light: 'from-emerald-500/10 to-teal-500/5' },
  { bar: 'from-blue-400 to-indigo-600',    bg: 'bg-blue-500',    light: 'from-blue-500/10 to-indigo-500/5' },
  { bar: 'from-amber-400 to-orange-600',   bg: 'bg-amber-500',   light: 'from-amber-500/10 to-orange-500/5' },
  { bar: 'from-violet-400 to-purple-600',  bg: 'bg-violet-500',  light: 'from-violet-500/10 to-purple-500/5' },
  { bar: 'from-rose-400 to-pink-600',      bg: 'bg-rose-500',    light: 'from-rose-500/10 to-pink-500/5' },
  { bar: 'from-cyan-400 to-sky-600',       bg: 'bg-cyan-500',    light: 'from-cyan-500/10 to-sky-500/5' },
];

export function DepartmentScreen() {
  const { data: teams, loading: teamsLoading } = useTeams();
  const { data: performanceData, loading: perfLoading } = useTeamPerformance();

  const loading = teamsLoading || perfLoading;

  const enrichedTeams = (teams || []).map((team, idx) => {
    const perf = (performanceData || []).find(p => p.teamId === team.id);
    return { ...team, perf, colors: TEAM_GRADIENTS[idx % TEAM_GRADIENTS.length] };
  });

  const totalGMV = (performanceData || []).reduce((s, p) => s + p.gmv, 0);
  const totalRevenue = (performanceData || []).reduce((s, p) => s + p.revenue, 0);
  const totalStaff = (performanceData || []).reduce((s, p) => s + p.staffCount, 0);
  const totalDeals = (performanceData || []).reduce((s, p) => s + p.closedDeals, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">

      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between sg-stagger" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Building2 size={18} className="text-violet-500" />
          </div>
          <div>
            <h2 className="text-[18px] font-black text-sg-heading">Khối Kinh Doanh</h2>
            <span className="text-[11px] font-bold text-sg-muted">{enrichedTeams.length} phòng ban • {totalStaff} nhân sự</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[12px] font-black pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Đồng bộ từ CRM</span>
        </div>
      </div>

      {/* ═══ Summary KPIs ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryKPI icon={<DollarSign size={18} />} label="Tổng GMV" value={totalGMV} formatter={formatVND} color="text-blue-500" gradient="from-blue-500/10 to-indigo-500/5" delay={60} />
        <SummaryKPI icon={<TrendingUp size={18} />} label="Tổng Doanh Thu" value={totalRevenue} formatter={formatVND} color="text-emerald-500" gradient="from-emerald-500/10 to-teal-500/5" delay={120} />
        <SummaryKPI icon={<Award size={18} />} label="Deals Chốt" value={totalDeals} color="text-amber-500" gradient="from-amber-500/10 to-orange-500/5" delay={180} />
        <SummaryKPI icon={<Users size={18} />} label="Tổng Nhân Sự" value={totalStaff} color="text-violet-500" gradient="from-violet-500/10 to-purple-500/5" delay={240} />
      </div>

      {/* ═══ Team Cards ═══ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {enrichedTeams.map((team, idx) => {
            const winRate = team.perf && team.perf.totalDeals > 0 ? (team.perf.closedDeals / team.perf.totalDeals) * 100 : 0;
            return (
              <div
                key={team.id}
                className="relative group perspective-distant sg-stagger"
                style={{ animationDelay: `${300 + idx * 80}ms` }}
              >
                <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-sg-2xl border border-slate-200/80 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-700 hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] group-hover:-translate-y-3 relative overflow-hidden">
                  {/* Glass effects */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className={`absolute -right-20 -top-20 w-56 h-56 rounded-full bg-linear-to-br ${team.colors.light} blur-[60px] opacity-30 group-hover:opacity-70 group-hover:scale-125 transition-all duration-1000`} />

                  {/* Gradient header bar */}
                  <div className={`h-1.5 bg-linear-to-r ${team.colors.bar}`} />

                  <div className="p-6">
                    {/* Team header */}
                    <div className="flex items-center gap-3 mb-5 relative z-10">
                      <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${team.colors.bar} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700`}>
                        <span className="text-[18px] font-black text-white drop-shadow">{team.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[16px] font-black text-sg-heading group-hover:text-emerald-500 transition-colors">{team.name}</h3>
                        <span className="text-[11px] font-bold text-sg-muted">{team.managerName || 'Chưa có Manager'}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        team.status === 'ACTIVE' ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-400 bg-slate-400/10 border border-slate-400/20'
                      }`}>
                        {team.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
                      </span>
                    </div>

                    {/* Performance metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                      <MetricBox label="GMV" value={team.perf ? formatVND(team.perf.gmv) : '—'} color="text-blue-500" />
                      <MetricBox label="Revenue" value={team.perf ? formatVND(team.perf.revenue) : '—'} color="text-emerald-500" />
                      <MetricBox label="Deals" value={team.perf?.closedDeals?.toString() || '0'} color="text-amber-500" />
                      <MetricBox label="Nhân sự" value={team.perf?.staffCount?.toString() || '0'} color="text-violet-500" />
                    </div>

                    {/* Win rate bar */}
                    {team.perf && team.perf.totalDeals > 0 && (
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Win Rate</span>
                          <span className="text-[11px] font-black text-emerald-500">{formatPercent(winRate)}</span>
                        </div>
                        <div className="h-2 bg-sg-btn-bg rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full bg-linear-to-r ${team.colors.bar} shadow-sm`}
                            style={{
                              width: `${winRate}%`,
                              animation: 'bar-width 1200ms cubic-bezier(0.16, 1, 0.3, 1) 500ms both',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Members preview */}
                    {team.members && team.members.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-sg-border/20 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-0.5">
                          {team.members.slice(0, 5).map((m, mIdx) => (
                            <div key={m.id} title={m.fullName} className={`w-8 h-8 rounded-lg bg-linear-to-br ${team.colors.bar} border-2 border-white dark:border-black/30 flex items-center justify-center shadow-md ${mIdx > 0 ? '-ml-2' : ''}`}>
                              <span className="text-[9px] font-black text-white">{m.fullName[0]}</span>
                            </div>
                          ))}
                          {team.members.length > 5 && (
                            <span className="ml-2 text-[10px] font-bold text-sg-muted">+{team.members.length - 5}</span>
                          )}
                        </div>
                        <ChevronRight size={16} className="text-sg-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {enrichedTeams.length === 0 && (
            <div className="col-span-full py-16 text-center sg-stagger" style={{ animationDelay: '200ms' }}>
              <Building2 size={40} className="mx-auto text-sg-muted mb-3 opacity-30" />
              <p className="text-[14px] font-bold text-sg-muted">Chưa có phòng ban nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══ Sub-components ═══

function SummaryKPI({ icon, label, value, formatter, color, gradient, delay }: {
  icon: React.ReactNode; label: string; value: number; formatter?: (v: number) => string; color: string; gradient: string; delay: number;
}) {
  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[20px] border border-slate-200/80 dark:border-sg-border p-4 shadow-sg-sm hover:shadow-sg-md hover:-translate-y-0.5 transition-all relative overflow-hidden group sg-stagger" style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-linear-to-br ${gradient} blur-xl opacity-40 group-hover:opacity-70 transition-opacity`} />
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
      <div className="relative z-10">
        <span className={color}>{icon}</span>
        <p className="text-[10px] font-bold text-sg-muted uppercase tracking-wider mt-2">{label}</p>
        <AnimatedCounter
          value={value}
          formatter={formatter || ((v: number) => Math.round(v).toLocaleString('vi-VN'))}
          className="text-[20px] font-black text-sg-heading"
        />
      </div>
    </div>
  );
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-3 rounded-xl bg-sg-card/50 border border-sg-border/30 hover:bg-sg-card/80 transition-colors">
      <span className="block text-[9px] font-bold text-sg-muted uppercase">{label}</span>
      <span className={`block text-[14px] font-black ${color}`}>{value}</span>
    </div>
  );
}

// Inject animation keyframe
if (typeof document !== 'undefined') {
  const styleId = 'sg-dept-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `@keyframes bar-width { from { width: 0%; } }`;
    document.head.appendChild(style);
  }
}
