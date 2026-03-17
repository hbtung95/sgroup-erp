/**
 * CampaignManager — Campaign list with status filters, search, and performance metrics
 */
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import { Megaphone, Search, Plus, TrendingUp, Users, Wallet, Eye, MousePointerClick, ArrowUpRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useCampaigns } from '../hooks/useMarketing';

const ACCENT = '#D97706';

type CampaignStatus = 'all' | 'RUNNING' | 'PAUSED' | 'DRAFT' | 'COMPLETED';

const STATUS_TABS: { key: CampaignStatus; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'RUNNING', label: 'Đang chạy' },
  { key: 'PAUSED', label: 'Tạm dừng' },
  { key: 'DRAFT', label: 'Nháp' },
  { key: 'COMPLETED', label: 'Hoàn tất' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  RUNNING: { bg: '#dcfce7', text: '#16a34a', label: 'ĐANG CHẠY' },
  PAUSED: { bg: '#fef3c7', text: '#D97706', label: 'TẠM DỪNG' },
  DRAFT: { bg: '#f1f5f9', text: '#64748b', label: 'NHÁP' },
  COMPLETED: { bg: '#eff6ff', text: '#3b82f6', label: 'HOÀN TẤT' },
};

// Data comes from API

const fmtMoney = (v: number) => {
  if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)} Tỷ`;
  if (v >= 1000000) return `${(v / 1000000).toFixed(0)} Tr`;
  return v.toLocaleString('vi-VN');
};

const fmtNum = (n: number) => n.toLocaleString('vi-VN');

export function CampaignManager() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus>('all');

  const { data: rawCampaigns, isLoading } = useCampaigns(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );

  const allCampaigns = (rawCampaigns || []).map((c: any) => ({
    ...c,
    budget: Number(c.budget) || 0,
    spend: Number(c.spend) || 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cpl: c.leads > 0 ? Math.round(Number(c.spend) / c.leads) : 0,
    roas: 0,
  }));

  const filtered = useMemo(() => {
    if (!search.trim()) return allCampaigns;
    const q = search.toLowerCase();
    return allCampaigns.filter((c: any) => c.name.toLowerCase().includes(q) || c.channel.toLowerCase().includes(q));
  }, [allCampaigns, search]);

  const runningCount = allCampaigns.filter((c: any) => c.status === 'RUNNING').length;

  const card: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <LinearGradient colors={['#D97706', '#B45309']} style={{ width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
              <Megaphone size={26} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 26, fontWeight: '900', color: cText }}>QUẢN LÝ CHIẾN DỊCH</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 3 }}>{allCampaigns.length} chiến dịch • {runningCount} đang chạy</Text>
            </View>
          </View>
          <TouchableOpacity style={{
            flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ACCENT,
            paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
            shadowColor: ACCENT, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
          }}>
            <Plus size={18} color="#fff" strokeWidth={3} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Tạo Chiến Dịch</Text>
          </TouchableOpacity>
        </View>

        {/* Search + Filters */}
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          <View style={{
            flex: 1, minWidth: 280, flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
            borderRadius: 14, paddingHorizontal: 16, height: 48,
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
          }}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Tìm chiến dịch, kênh..."
              placeholderTextColor="#94a3b8"
              style={{ flex: 1, fontSize: 14, fontWeight: '600', color: cText, outline: 'none' } as any}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {STATUS_TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setStatusFilter(tab.key)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                  backgroundColor: statusFilter === tab.key
                    ? (isDark ? 'rgba(217,119,6,0.2)' : '#fffbeb')
                    : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                  borderWidth: 1, borderColor: statusFilter === tab.key ? `${ACCENT}40` : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: statusFilter === tab.key ? '800' : '600',
                  color: statusFilter === tab.key ? ACCENT : '#64748b',
                }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Campaign Cards */}
        {isLoading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={ACCENT} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#94a3b8', marginTop: 12 }}>Đang tải chiến dịch...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>Không tìm thấy chiến dịch</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Thử thay đổi bộ lọc hoặc tìm kiếm khác</Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {filtered.map((c: any) => {
              const s = STATUS_STYLES[c.status] || STATUS_STYLES.draft;
              const spendPct = c.budget > 0 ? Math.round((c.spend / c.budget) * 100) : 0;
              return (
                <View key={c.id} style={card}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 17, fontWeight: '900', color: cText }}>{c.name}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>
                        {c.channel} • {c.objective} • {c.startDate} → {c.endDate}
                      </Text>
                    </View>
                    <View style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: s.bg, borderWidth: 1, borderColor: `${s.text}20` }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: s.text, letterSpacing: 0.3 }}>{s.label}</Text>
                    </View>
                  </View>

                  {/* Metrics Row */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    {[
                      { icon: Eye, label: 'Impressions', value: fmtNum(c.impressions), color: '#64748b' },
                      { icon: MousePointerClick, label: 'Clicks', value: fmtNum(c.clicks), color: '#3b82f6' },
                      { icon: TrendingUp, label: 'CTR', value: `${c.ctr}%`, color: '#8b5cf6' },
                      { icon: Users, label: 'Leads', value: fmtNum(c.leads), color: '#22c55e' },
                      { icon: Wallet, label: 'CPL', value: fmtMoney(c.cpl), color: '#f59e0b' },
                      { icon: ArrowUpRight, label: 'ROAS', value: `${c.roas}x`, color: '#D97706' },
                    ].map(m => (
                      <View key={m.label} style={{ minWidth: 110, gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          {(() => { const I = m.icon; return <I size={14} color={m.color} />; })()}
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>{m.label}</Text>
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>{m.value}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Budget Bar */}
                  <View style={{ marginTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>Budget: {fmtMoney(c.budget)}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: spendPct > 85 ? '#ef4444' : ACCENT }}>{spendPct}% đã dùng</Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{
                        width: `${Math.min(spendPct, 100)}%`, height: '100%', borderRadius: 4,
                        backgroundColor: spendPct > 85 ? '#ef4444' : spendPct > 60 ? '#f59e0b' : '#22c55e',
                      } as any} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
