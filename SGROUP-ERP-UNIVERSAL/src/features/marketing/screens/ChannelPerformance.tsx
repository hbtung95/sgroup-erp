/**
 * ChannelPerformance — Details metrics for each marketing channel
 */
import React from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Radio, BarChart3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useChannels } from '../hooks/useMarketing';

// Data from API via useChannels()

const fmtMoney = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)} Tr`;
  return v.toLocaleString('vi-VN');
};

const fmtNum = (n: number) => n.toLocaleString('vi-VN');

export function ChannelPerformance() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;

  const CHANNEL_COLORS: Record<string,string> = { FACEBOOK: '#1877F2', GOOGLE: '#EA4335', TIKTOK: '#000000', ZALO: '#0068FF', YOUTUBE: '#FF0000', EMAIL: '#8b5cf6' };

  const { data: rawChannels, isLoading } = useChannels();

  const channels = (rawChannels || []).map((ch: any) => ({
    id: ch.id,
    name: ch.channelKey,
    color: CHANNEL_COLORS[ch.channelKey] || '#64748b',
    spend: Number(ch.spend) || 0,
    revenue: Number(ch.revenue) || 0,
    leads: ch.leads || 0,
    conversions: ch.conversions || 0,
    roas: ch.roas || 0,
    impressions: 0,
    clicks: 0,
  }));

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
          {isLoading ? (
             <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{ marginTop: 16, color: cText }}>Đang tải dữ liệu ROI kênh quảng cáo...</Text>
             </View>
          ) : (
            channels.map((ch: any) => {
              const iconColor = ch.color;
              return (
                <View key={ch.id} style={card}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${iconColor}15`, alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 size={22} color={iconColor} />
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
