/**
 * ChannelPerformance — Details metrics for each marketing channel
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Radio, Facebook, Youtube, Send, MonitorPlay, Search as SearchIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { marketingPlanningApi } from '../api/marketingApi';

const MOCK_CHANNELS = [
  { id: '1', name: 'Facebook Ads', icon: Facebook, color: '#1877F2', spend: 285000000, impressions: 4500000, clicks: 125000, ctr: 2.78, cpc: 2280, leads: 645, cpl: 441000, roas: 3.8 },
  { id: '2', name: 'Google Ads', icon: SearchIcon, color: '#EA4335', spend: 210000000, impressions: 2100000, clicks: 84000, ctr: 4.00, cpc: 2500, leads: 521, cpl: 403000, roas: 4.5 },
  { id: '3', name: 'TikTok Ads', icon: MonitorPlay, color: '#000000', colorDark: '#FFFFFF', spend: 95000000, impressions: 3800000, clicks: 65000, ctr: 1.71, cpc: 1461, leads: 184, cpl: 516000, roas: 2.8 },
  { id: '4', name: 'Zalo Ads', icon: Send, color: '#0068FF', spend: 42000000, impressions: 1200000, clicks: 32000, ctr: 2.67, cpc: 1312, leads: 95, cpl: 442000, roas: 3.5 },
  { id: '5', name: 'Youtube Ads', icon: Youtube, color: '#FF0000', spend: 35000000, impressions: 2500000, clicks: 18000, ctr: 0.72, cpc: 1944, leads: 42, cpl: 833000, roas: 1.5 },
];

const fmtMoney = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)} Tr`;
  return v.toLocaleString('vi-VN');
};

const fmtNum = (n: number) => n.toLocaleString('vi-VN');

export function ChannelPerformance() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  
  const [channels, setChannels] = useState<any[]>(MOCK_CHANNELS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketingPlanningApi.getChannelROI('base')
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const mapped = res.map(d => {
            const mock = MOCK_CHANNELS.find(m => m.name.toUpperCase().includes(d.channelKey.split('_')[0])) || MOCK_CHANNELS[0];
            return {
              ...mock,
              name: d.channelLabel || mock.name,
              spend: d.budgetVnd,
              revenue: d.revenue || 0,
              leads: d.leadsCount || 0,
              roas: d.roi > 0 ? d.roi.toFixed(2) : mock.roas
            };
          });
          setChannels(mapped);
        }
      })
      .catch(err => console.error('Failed to load Channel ROI from backend', err))
      .finally(() => setLoading(false));
  }, []);

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
            <Radio size={26} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: cText }}>HIỆU SUẤT KÊNH</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 3 }}>Phân tích chuyên sâu hiệu quả từng kênh quảng cáo</Text>
          </View>
        </View>

        <View style={{ gap: 16 }}>
          {loading ? (
             <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 16, color: cText }}>Đang tải dữ liệu ROI kênh quảng cáo...</Text>
             </View>
          ) : (
            channels.map(ch => {
              const iconColor = isDark && ch.colorDark ? ch.colorDark : ch.color;
              return (
                <View key={ch.id} style={card}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${iconColor}15`, alignItems: 'center', justifyContent: 'center' }}>
                      <ch.icon size={22} color={iconColor} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>{ch.name}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    {[
                      { label: 'Spend', value: fmtMoney(ch.spend), tone: '#f59e0b' },
                      { label: 'Revenue', value: fmtMoney(ch.revenue || 0), tone: '#10b981' },
                      { label: 'Impressions', value: fmtNum(ch.impressions), tone: '#64748b' },
                      { label: 'Clicks', value: fmtNum(ch.clicks), tone: '#3b82f6' },
                      { label: 'Leads', value: fmtNum(ch.leads), tone: '#22c55e' },
                      { label: 'ROAS', value: `${ch.roas}x`, tone: '#D97706' },
                    ].map((m, idx) => (
                      <View key={idx} style={{ flex: 1, minWidth: 100, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: isDark ? 'transparent' : '#f1f5f9' }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</Text>
                        <Text style={{ fontSize: 16, fontWeight: '900', color: m.tone }}>{m.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}
