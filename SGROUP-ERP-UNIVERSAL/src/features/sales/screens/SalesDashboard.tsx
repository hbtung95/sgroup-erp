/**
 * SalesDashboard — Role-aware dashboard showing KPIs, funnel, recent deals
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { DollarSign, TrendingUp, ShoppingCart, Users, Target, ArrowUpRight, Filter, PhoneCall, Calendar, AlertCircle, Clock, CheckCircle2, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGGradientStatCard, SGTable, SGPlanningSectionTitle, SGButton } from '../../../shared/ui/components';
import type { SalesRole } from '../SalesSidebar';
import { useSalesData } from '../hooks/useSalesData';
import { SalesQuickForms } from '../components/forms/SalesQuickForms';
import { useDeals } from '../hooks/useDeals';
import { useGetKpiCards, useGetActualFunnel } from '../hooks/useSalesReport';

// Icon map for KPI cards from API
const KPI_ICONS: Record<string, any> = { gmv: DollarSign, revenue: TrendingUp, deals: ShoppingCart, staff: Users, target: Target };
const KPI_COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f59e0b'];
const FUNNEL_COLORS = ['#94a3b8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#8b5cf6', '#7c3aed'];

const STAGE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  LEAD: { bg: '#f1f5f9', text: '#64748b', label: 'Lead' },
  MEETING: { bg: '#eff6ff', text: '#3b82f6', label: 'Hẹn gặp' },
  BOOKING: { bg: '#f5f3ff', text: '#8b5cf6', label: 'Giữ chỗ' },
  DEPOSIT: { bg: '#fef3c7', text: '#d97706', label: 'Đặt cọc' },
  CONTRACT: { bg: '#ecfdf5', text: '#059669', label: 'Ký HĐ' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', label: '✓ Hoàn tất' },
  CANCELLED: { bg: '#fef2f2', text: '#dc2626', label: 'Huỷ' },
};

const PERSONAL_PIPELINE: { id: string; customer: string; project: string; phone: string; type: string; action: string; time: string; stage: string }[] = [];

const fmt = (n: number) => n.toLocaleString('vi-VN');

const DEAL_COLUMNS = [
  { key: 'customer', title: 'KHÁCH HÀNG', flex: 1.5, render: (v: any, r: any) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: '900', color: '#64748b' }}>{v?.charAt(0) || 'K'}</Text>
      </View>
      <View>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#1e293b' }}>{v}</Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 3 }}>
          {r.project} <Text style={{ color: '#cbd5e1' }}>•</Text> <Text style={{ color: '#3b82f6' }}>{r.unitCode}</Text>
        </Text>
      </View>
    </View>
  )},
  { key: 'value', title: 'GIÁ TRỊ', flex: 1, align: 'right' as const, render: (v: any, r: any) => (
    <View style={{ alignItems: 'flex-end', justifyContent: 'center', marginRight: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: '900', color: '#3b82f6' }}>{r.transactionValue} <Text style={{ fontSize: 12, fontWeight: '700' }}>Tỷ</Text></Text>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>{new Date(r.date).toLocaleDateString('vi-VN')}</Text>
    </View>
  )},
  { key: 'status', title: 'TRẠNG THÁI', width: 110, align: 'center' as const, render: (v: any) => {
    const s = STAGE_COLORS[v] || STAGE_COLORS.LEAD;
    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: s.bg, alignSelf: 'center', borderWidth: 1, borderColor: `${s.text}20` }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: s.text, letterSpacing: 0.3 }}>{s.label.toUpperCase()}</Text>
      </View>
    );
  }}
];

export function SalesDashboard({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const salesDataHook = useSalesData();
  const { kpiData } = salesDataHook;
  const { deals } = useDeals();

  // Team/Director KPI and Funnel from API
  const now = new Date();
  const { data: kpiCards, isLoading: kpiLoading } = useGetKpiCards({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const { data: funnelData, isLoading: funnelLoading } = useGetActualFunnel({ year: now.getFullYear(), month: now.getMonth() + 1 });

  // Transform API data into display format
  const teamKpi = (kpiCards || []).map((k: any, i: number) => ({
    id: k.id || `kpi-${i}`,
    label: k.label || k.title || '',
    value: k.value?.toLocaleString?.('vi-VN') ?? String(k.value ?? 0),
    unit: k.unit || '',
    change: k.change ?? k.growthPct ?? 0,
    color: KPI_COLORS[i % KPI_COLORS.length],
    icon: KPI_ICONS[k.key] || Target,
  }));

  const teamFunnel = (funnelData || []).map((s: any, i: number) => ({
    stage: s.stage || s.label || '',
    count: s.count ?? s.value ?? 0,
    color: FUNNEL_COLORS[i % FUNNEL_COLORS.length],
    pct: s.pct ?? s.percentage ?? 0,
  }));

  const personalPipeline = deals.filter((d: any) => ['BOOKING', 'DEPOSIT', 'MEETING', 'LEAD'].includes(d.stage)).slice(0, 5).map((d: any) => ({
    id: d.id,
    customer: d.customerName || '',
    project: d.projectName || '',
    phone: d.customerPhone || '',
    type: d.stage === 'DEPOSIT' ? 'urgent' : d.stage === 'MEETING' ? 'meeting' : 'call',
    action: d.stage === 'DEPOSIT' ? `Nợ cọc — ${d.productCode || d.dealCode}` : d.stage === 'MEETING' ? `Hẹn gặp — ${d.productCode || d.dealCode}` : `Follow up — ${d.productCode || d.dealCode}`,
    time: d.dealDate ? new Date(d.dealDate).toLocaleDateString('vi-VN') : '',
    stage: d.stage,
  }));

  const card: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 28, padding: 32,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)' } : {}),
  };

  const showTeam = userRole !== 'sales';
  const showTotal = userRole === 'sales_director' || userRole === 'ceo' || userRole === 'sales_admin';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }}>
        {/* -------------- HEADER -------------- */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
             <LinearGradient colors={['#3b82f6', '#2563eb']} style={{ width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
               <ShoppingCart size={28} color="#fff" />
             </LinearGradient>
             <View>
               <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>
                 {userRole === 'sales' ? 'HIỆU SUẤT CÁ NHÂN' : showTotal ? 'TỔNG QUAN KINH DOANH' : 'Hiệu SUẤT TEAM'}
               </Text>
               <Text style={{ fontSize: 14, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Dữ liệu tổng hợp từ Báo cáo ngày — Năm 2026</Text>
             </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SGButton 
              title="Nhập Báo Cáo Nhanh" 
              icon={Plus as any} 
              onPress={() => setShowQuickAdd(true)} 
              size="lg"
            />
          </View>
        </View>

        {/* -------------- KPI CARDS -------------- */}
        {userRole === 'sales' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 10 }}>
            {/* Dynamic KPIs for Sales */}
            {[
              { id: 'k1', label: 'TỔNG SỐ LƯỢNG GIAO DỊCH', value: kpiData.totalTransactions, unit: 'Căn', color: '#22c55e', icon: Target },
              { id: 'k2', label: 'TỔNG HOA HỒNG DỰ KIẾN (Tỷ Lệ Demo)', value: (kpiData.totalRevenue * 1000 * 0.02).toFixed(1), unit: 'Tr', color: '#8b5cf6', icon: DollarSign }, // ~2% as dummy commission
              { id: 'k3', label: 'TỔNG KHÁCH HÀNG MỚI (Leads)', value: kpiData.totalLeads, unit: 'KH', color: '#3b82f6', icon: Users },
              { id: 'k4', label: 'TỔNG SỐ LỊCH HẸN', value: kpiData.totalMeetings, unit: 'Lịch', color: '#f59e0b', icon: Calendar },
            ].map(k => (
              <View key={k.id} style={{ 
                flex: 1, minWidth: 240, backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#ffffff', 
                borderRadius: 24, padding: 24, 
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${k.color}1A`, alignItems: 'center', justifyContent: 'center' }}>
                    {(() => { const Icon = k.icon; return <Icon size={22} color={k.color} />; })()}
                  </View>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 38, fontWeight: '900', color: cText, letterSpacing: -1 }}>{k.value}</Text>
                  {k.unit && <Text style={{ fontSize: 16, fontWeight: '700', color: '#94a3b8' }}>{k.unit}</Text>}
                </View>
              </View>
            ))}
          </View>
        ) : kpiLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#3b82f6" /><Text style={{ color: cSub, marginTop: 12, fontWeight: '600' }}>Đang tải KPI...</Text></View>
        ) : teamKpi.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ fontSize: 40, marginBottom: 12 }}>📊</Text><Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có dữ liệu KPI</Text><Text style={{ color: cSub, fontSize: 13, marginTop: 4 }}>Dữ liệu sẽ hiển thị khi có giao dịch</Text></View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 10 }}>
            {teamKpi.map((k: any) => (
              <View key={k.id} style={{ 
                flex: 1, minWidth: 240, backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#ffffff', 
                borderRadius: 24, padding: 24, 
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${k.color}1A`, alignItems: 'center', justifyContent: 'center' }}>
                    {(() => { const Icon = k.icon; return <Icon size={22} color={k.color} />; })()}
                  </View>
                  {k.change !== undefined && (
                    <View style={{ backgroundColor: `${k.change > 0 ? '#22c55e' : '#ef4444'}1A`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                       <Text style={{ fontSize: 13, fontWeight: '800', color: k.change > 0 ? '#16a34a' : '#ef4444' }}>
                         {k.change > 0 ? '+' : ''}{k.change}%
                       </Text>
                    </View>
                  )}
                </View>
                
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 38, fontWeight: '900', color: cText, letterSpacing: -1 }}>{k.value}</Text>
                  {k.unit && <Text style={{ fontSize: 16, fontWeight: '700', color: '#94a3b8' }}>{k.unit}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          {/* Pipeline Funnel / My Pipeline */}
          {userRole === 'sales' ? (
            <View style={[card, { flex: 1, minWidth: 400 }]}>
              <SGPlanningSectionTitle 
                icon={Filter}
                title="Phễu Chuyển Đổi Thực Tế (Từ Báo Cáo)"
                accent="#8b5cf6"
                badgeText="DYNAMIC PIPELINE"
                style={{ marginBottom: 28 }}
              />
              {kpiData.funnel.map((s, i) => (
                <View key={i} style={{ marginBottom: 18 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: cText, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.stage}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: s.color }}>{fmt(s.count)}</Text>
                      <View style={{ backgroundColor: `${s.color}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: s.color }}>{s.pct}%</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ height: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 8, padding: 2 }}>
                    <View style={{ width: `${s.pct}%`, height: '100%', backgroundColor: s.color, borderRadius: 6, shadowColor: s.color, shadowOpacity: 0.4, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 3 }} />
                  </View>
                </View>
              ))}
            </View>
          ) : showTeam ? (
            <View style={[card, { flex: 1, minWidth: 400 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <SGPlanningSectionTitle 
                  icon={CheckCircle2}
                  title="Việc Cần Xử Lý"
                  accent="#ef4444"
                  badgeText="MY PIPELINE"
                />
                <View style={{ backgroundColor: '#ef44441A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                   <Text style={{ fontSize: 12, fontWeight: '800', color: '#ef4444' }}>{personalPipeline.length} Nhiệm vụ</Text>
                </View>
              </View>

              <View style={{ gap: 16 }}>
                {personalPipeline.length === 0 ? (
                  <View style={{ padding: 24, alignItems: 'center' }}><Text style={{ color: cSub, fontSize: 14, fontWeight: '600' }}>🎉 Không có việc cần xử lý</Text></View>
                ) : null}
                {personalPipeline.map((task) => {
                  const s = STAGE_COLORS[task.stage] || STAGE_COLORS.LEAD;
                  return (
                    <View key={task.id} style={{ 
                      flexDirection: 'row', 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                      borderRadius: 16, padding: 16, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'
                    }}>
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: task.type === 'urgent' ? '#fef2f2' : task.type === 'meeting' ? '#eff6ff' : '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                         {task.type === 'urgent' ? <AlertCircle size={24} color="#ef4444" /> : task.type === 'meeting' ? <Users size={24} color="#3b82f6" /> : <PhoneCall size={24} color="#22c55e" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{task.action}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: '#64748b', marginTop: 4 }}>
                               {task.customer} <Text style={{ color: '#cbd5e1' }}>•</Text> {task.phone}
                            </Text>
                          </View>
                          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: s.bg, borderWidth: 1, borderColor: `${s.text}20` }}>
                             <Text style={{ fontSize: 10, fontWeight: '800', color: s.text, letterSpacing: 0.3 }}>{s.label.toUpperCase()}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
                          <Clock size={14} color="#94a3b8" />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: task.type === 'urgent' ? '#ef4444' : '#64748b' }}>{task.time}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Pipeline Funnel FOR TEAM */}
          {showTeam && (
            <View style={[card, { flex: 1, minWidth: 400 }]}>
              <SGPlanningSectionTitle 
                icon={Filter}
                title="Phễu Bán Hàng"
                accent="#8b5cf6"
                badgeText="PIPELINE"
                style={{ marginBottom: 28 }}
              />
              {funnelLoading ? (
                <View style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator size="small" color="#8b5cf6" /></View>
              ) : teamFunnel.length === 0 ? (
                <View style={{ padding: 24, alignItems: 'center' }}><Text style={{ color: cSub, fontSize: 14, fontWeight: '600' }}>Chưa có dữ liệu phễu</Text></View>
              ) : null}
              {teamFunnel.map((s: any, i: number) => (
                <View key={i} style={{ marginBottom: 18 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: cText, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.stage}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: s.color }}>{fmt(s.count)}</Text>
                      <View style={{ backgroundColor: `${s.color}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: s.color }}>{s.pct}%</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ height: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 8, padding: 2 }}>
                    <View style={{ width: `${s.pct}%`, height: '100%', backgroundColor: s.color, borderRadius: 6, shadowColor: s.color, shadowOpacity: 0.4, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 3 }} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recent Deals */}
          <View style={[card, { flex: 1.2, minWidth: 400 }]}>
            <SGPlanningSectionTitle 
              icon={ShoppingCart}
              title={userRole === 'sales' ? "Lịch Sử Giao Dịch Gần Đây" : "Giao Dịch Gần Đây"}
              accent="#3b82f6"
              badgeText="RECENT TRANSACTIONS"
              style={{ marginBottom: 20 }}
            />
            {userRole === 'sales' && deals.length > 0 ? (
              <SGTable 
                columns={[
                  { key: 'customer', title: 'MÃ CĂN & DỰ ÁN', flex: 1.5, render: (v, r: any) => (
                    <View style={{ paddingVertical: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#1e293b' }}>{r.productCode || r.dealCode}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 3 }}>
                        {r.projectName} <Text style={{ color: '#cbd5e1' }}>•</Text> <Text style={{ color: '#3b82f6' }}>{r.customerName}</Text>
                      </Text>
                    </View>
                  )},
                  { key: 'value', title: 'GIÁ TRỊ', flex: 1, align: 'right' as const, render: (v, r: any) => (
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#3b82f6' }}>{r.dealValue} <Text style={{ fontSize: 12, fontWeight: '700' }}>Tỷ</Text></Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </View>
                  )},
                  { key: 'stage', title: 'TRẠNG THÁI', width: 110, align: 'center' as const, render: (v: any) => {
                    const s = STAGE_COLORS[v] || STAGE_COLORS.LEAD;
                    return (
                      <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: s.bg, alignSelf: 'center', borderWidth: 1, borderColor: `${s.text}20` }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: s.text, letterSpacing: 0.3 }}>{s.label.toUpperCase()}</Text>
                      </View>
                    );
                  }}
                ]} 
                data={deals} 
                onRowPress={() => {}} 
                style={{ borderWidth: 0, backgroundColor: 'transparent' }}
              />
            ) : (
              <SGTable 
                columns={DEAL_COLUMNS} 
                data={deals} 
                onRowPress={(row) => console.log('Press row', row)} 
                style={{ borderWidth: 0, backgroundColor: 'transparent' }}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Render Quick Form Modal when visible */}
      {showQuickAdd && (
        <SalesQuickForms 
          visible={showQuickAdd} 
          onClose={() => setShowQuickAdd(false)} 
          dataHook={salesDataHook} 
        />
      )}
    </View>
  );
}
