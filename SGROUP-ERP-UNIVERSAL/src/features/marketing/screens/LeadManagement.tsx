/**
 * LeadManagement — MQL/SQL lead pipeline, source attribution, quality scoring
 */
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator } from 'react-native';
import { Users, Search, Filter, Star, Phone, Mail, Globe, ArrowRight, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useLeads } from '../hooks/useMarketing';

const ACCENT = '#D97706';

const PIPELINE_STAGES = [
  { key: 'mql', label: 'MQL', count: 1245, color: '#3b82f6', pct: 100 },
  { key: 'sql', label: 'SQL', count: 486, color: '#8b5cf6', pct: 39 },
  { key: 'opportunity', label: 'Opportunity', count: 198, color: '#D97706', pct: 16 },
  { key: 'booking', label: 'Booking', count: 87, color: '#22c55e', pct: 7 },
  { key: 'closed', label: 'Closed Won', count: 42, color: '#059669', pct: 3.4 },
];

type LeadStatus = 'all' | 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON';

const STATUS_TABS: { key: LeadStatus; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'NEW', label: 'Mới' },
  { key: 'CONTACTED', label: 'Đã liên hệ' },
  { key: 'QUALIFIED', label: 'Đủ điều kiện' },
  { key: 'WON', label: 'Chuyển đổi' },
];

const STATUS_MAP: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: '#eff6ff', text: '#3b82f6', label: 'MỚI' },
  CONTACTED: { bg: '#fef3c7', text: '#D97706', label: 'ĐÃ LIÊN HỆ' },
  QUALIFIED: { bg: '#f5f3ff', text: '#8b5cf6', label: 'ĐỦ ĐK' },
  PROPOSAL: { bg: '#fef3c7', text: '#D97706', label: 'PROPOSAL' },
  WON: { bg: '#dcfce7', text: '#16a34a', label: 'CHUYỂN ĐỔI' },
  LOST: { bg: '#fee2e2', text: '#dc2626', label: 'MẤT' },
};

// Data from API via useLeads()

const getScoreColor = (score: number) => score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#94a3b8';

export function LeadManagement() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<LeadStatus>('all');

  const { data: rawLeads, isLoading } = useLeads(
    filter !== 'all' ? { status: filter } : undefined
  );

  const allLeads = (rawLeads || []).map((l: any) => ({
    id: l.id,
    name: l.name,
    phone: l.phone || '',
    email: l.email || '',
    source: l.source,
    campaign: l.campaign?.name || '—',
    score: l.score || 0,
    status: l.status,
    project: '',
    createdAt: new Date(l.createdAt).toLocaleDateString('vi-VN'),
  }));

  const filtered = useMemo(() => {
    if (!search.trim()) return allLeads;
    const q = search.toLowerCase();
    return allLeads.filter((l: any) => l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.source.toLowerCase().includes(q));
  }, [allLeads, search]);

  const card: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <LinearGradient colors={['#D97706', '#B45309']} style={{ width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
            <Users size={26} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: cText }}>MQL & LEAD MANAGEMENT</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 3 }}>{allLeads.length} leads</Text>
          </View>
        </View>

        {/* Pipeline Funnel */}
        <View style={card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#D977061A', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#D97706" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>Phễu Chuyển Đổi Lead</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            {PIPELINE_STAGES.map((stage, i) => (
              <View key={stage.key} style={{ flex: 1, minWidth: 140, alignItems: 'center' }}>
                <View style={{
                  width: '100%', paddingVertical: 20, borderRadius: 16,
                  backgroundColor: isDark ? `${stage.color}15` : `${stage.color}0D`,
                  alignItems: 'center', borderWidth: 1, borderColor: `${stage.color}30`,
                }}>
                  <Text style={{ fontSize: 28, fontWeight: '900', color: stage.color }}>{stage.count.toLocaleString()}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: stage.color, letterSpacing: 0.5, marginTop: 4 }}>{stage.label}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', marginTop: 2 }}>{stage.pct}%</Text>
                </View>
                {i < PIPELINE_STAGES.length - 1 && (
                  <View style={{ position: 'absolute', right: -18, top: '50%', zIndex: 1 }}>
                    <ArrowRight size={14} color="#94a3b8" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Search + Filter */}
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          <View style={{
            flex: 1, minWidth: 280, flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f8fafc',
            borderRadius: 14, paddingHorizontal: 16, height: 48,
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
          }}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              value={search} onChangeText={setSearch}
              placeholder="Tìm lead theo tên, SĐT, nguồn..."
              placeholderTextColor="#94a3b8"
              style={{ flex: 1, fontSize: 14, fontWeight: '600', color: cText, outline: 'none' } as any}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {STATUS_TABS.map(tab => (
              <TouchableOpacity key={tab.key} onPress={() => setFilter(tab.key)} style={{
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                backgroundColor: filter === tab.key ? (isDark ? 'rgba(217,119,6,0.2)' : '#fffbeb') : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                borderWidth: 1, borderColor: filter === tab.key ? `${ACCENT}40` : 'transparent',
              }}>
                <Text style={{ fontSize: 13, fontWeight: filter === tab.key ? '800' : '600', color: filter === tab.key ? ACCENT : '#64748b' }}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lead Cards */}
        <View style={{ gap: 12 }}>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={ACCENT} />
              <Text style={{ color: '#94a3b8', marginTop: 12, fontSize: 13 }}>Đang tải lead...</Text>
            </View>
          ) : filtered.map((lead: any) => {
            const s = STATUS_MAP[lead.status] || STATUS_MAP.NEW;
            return (
              <View key={lead.id} style={card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  {/* Avatar */}
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: ACCENT }}>{lead.name.charAt(0)}</Text>
                  </View>
                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{lead.name}</Text>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, backgroundColor: s.bg, borderWidth: 1, borderColor: `${s.text}20` }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: s.text }}>{s.label}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Phone size={12} color="#94a3b8" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8' }}>{lead.phone}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Mail size={12} color="#94a3b8" />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8' }}>{lead.email}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>
                      Nguồn: {lead.source} • Campaign: {lead.campaign} • Dự án: {lead.project} • {lead.createdAt}
                    </Text>
                  </View>
                  {/* Score */}
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: getScoreColor(lead.score), alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: getScoreColor(lead.score) }}>{lead.score}</Text>
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8' }}>SCORE</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
