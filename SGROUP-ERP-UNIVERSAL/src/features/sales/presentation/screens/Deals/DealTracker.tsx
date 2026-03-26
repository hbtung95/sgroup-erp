/**
 * DealTracker — Tiến Độ Giao Dịch
 * Connected to useDeals hook with real pipeline management
 * Redesigned with a Kanban board focusing on closing stages
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FileText, CheckCircle2, ChevronRight, Calculator, AlignLeft, TrendingUp, AlertCircle, Clock } from 'lucide-react-native';
import { useAppTheme } from '../../../../../shared/theme/useAppTheme';
import { useDeals, Deal, DealStage } from '../../../hooks/useDeals';

const STAGE_CONFIG: Record<DealStage, { label: string; color: string; bg: string; icon: any }> = {
  LEAD: { label: 'LEAD', color: '#94a3b8', bg: '#f1f5f9', icon: Clock },
  MEETING: { label: 'HẸN GẶP', color: '#6366f1', bg: '#eef2ff', icon: Clock },
  BOOKING: { label: 'GIỮ CHỖ', color: '#8b5cf6', bg: '#f5f3ff', icon: Clock },
  DEPOSIT: { label: 'ĐẶT CỌC', color: '#f59e0b', bg: '#fffbeb', icon: Calculator },
  CONTRACT: { label: 'KÝ HĐMB', color: '#3b82f6', bg: '#eff6ff', icon: FileText },
  COMPLETED: { label: 'HOÀN TẤT', color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
  CANCELLED: { label: 'ĐÃ HỦY', color: '#dc2626', bg: '#fee2e2', icon: AlertCircle },
};

const STAGE_FLOW: DealStage[] = ['DEPOSIT', 'CONTRACT', 'COMPLETED'];

export function DealTracker() {
  const { theme, isDark } = useAppTheme();
  const navigation = useNavigation<any>();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cBg = isDark ? theme.colors.background : theme.colors.backgroundAlt;

  const { deals, loading, updateDeal } = useDeals();

  // Filter deals to only show deals in STAGE_FLOW
  const pipelineDeals = deals.filter(d => STAGE_FLOW.includes(d.stage));
  const totalValue = pipelineDeals.reduce((sum, d) => sum + d.dealValue, 0);




  const isWeb = Platform.OS === 'web';
  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.7)' : '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    ...(isWeb ? { backdropFilter: 'blur(16px)' } : {}),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 12,
    elevation: 4,
  };

  // Render Deal Card
  const renderDealCard = (deal: Deal) => {
    const cfg = STAGE_CONFIG[deal.stage];
    const Icon = cfg.icon;
    const nextIdx = STAGE_FLOW.indexOf(deal.stage);
    const canAdvance = nextIdx >= 0 && nextIdx < STAGE_FLOW.length - 1;

    return (
      <View key={deal.id} style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
        borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
        ...(isWeb ? { cursor: 'pointer', transition: 'all 0.2s' } as any : {})
      }}>
        {/* Header: Project & Code */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: cfg.color, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{deal.productCode || 'Căn Hộ'}</Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: cText }} numberOfLines={1}>{deal.projectName || 'Chưa cập nhật dự án'}</Text>
          </View>
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? `${cfg.color}20` : cfg.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={cfg.color} />
          </View>
        </View>

        {/* Info: Customer & Value */}
        <View style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#fff', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Khách hàng</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: cText }}>{deal.customerName}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Giá trị</Text>
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#10b981' }}>{deal.dealValue} Tỷ</Text>
          </View>
        </View>

        {/* Status Chip */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
          height: 40, borderRadius: 10, backgroundColor: isDark ? `${cfg.color}15` : cfg.bg,
        }}>
          {canAdvance ? (
             <Clock size={16} color={cfg.color} />
          ) : (
             <CheckCircle2 size={16} color={cfg.color} />
          )}
          <Text style={{ fontSize: 13, fontWeight: '800', color: cfg.color, textTransform: 'uppercase' }}>
            {deal.stage === 'COMPLETED' ? 'GIAO DỊCH HOÀN TẤT' : `ĐANG Ở BƯỚC ${cfg.label}`}
          </Text>
        </View>

        {/* Cross-Module Integration: Finance */}
        {['DEPOSIT', 'CONTRACT', 'COMPLETED'].includes(deal.stage) && (
          <TouchableOpacity 
            onPress={() => {
              if (Platform.OS === 'web') {
                window.location.hash = 'debts';
              }
              navigation.navigate('FinanceModule');
            }}
            style={{ 
              marginTop: 12, paddingVertical: 10, borderRadius: 10, 
              backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', 
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: isDark ? 'rgba(59,130,246,0.3)' : '#bfdbfe'
            }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6' }}>Tra cứu Công nợ (Finance)</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: cBg }}>
      {/* Top Summary Bar */}
      <View style={{ paddingHorizontal: 32, paddingTop: 32, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <TrendingUp size={20} color="#3b82f6" />
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5 }}>Quản lý hợp đồng</Text>
            </View>
            <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Pipeline Giao Dịch</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: cSub, marginTop: 4 }}>
              Đang theo dõi <Text style={{ color: cText, fontWeight: '800' }}>{pipelineDeals.length}</Text> giao dịch trọng điểm • Quy mô <Text style={{ color: '#10b981', fontWeight: '800' }}>{totalValue.toFixed(1)} Tỷ</Text>
            </Text>
          </View>

        </View>
      </View>

      {/* Kanban Board */}
      <ScrollView horizontal bounces={false} style={{ flex: 1 }} contentContainerStyle={{ padding: 32, gap: 24 }}>
        {STAGE_FLOW.map((stage) => {
          const cfg = STAGE_CONFIG[stage];
          const stageDeals = pipelineDeals.filter(d => d.stage === stage);
          const stageGMV = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);

          return (
            <View key={stage} style={[cardStyle, { width: 340, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }]}>
              {/* Kanban Column Header */}
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cfg.color }} />
                    <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{cfg.label}</Text>
                  </View>
                  <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: cText }}>{stageDeals.length}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Tổng trị giá: <Text style={{ color: cfg.color, fontWeight: '800' }}>{stageGMV.toFixed(1)} Tỷ</Text></Text>
              </View>

              {/* Kanban Column Body */}
              <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
                {stageDeals.length > 0 ? (
                  stageDeals.map(d => renderDealCard(d))
                ) : (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, opacity: 0.5 }}>
                    <AlignLeft size={32} color={cSub} style={{ marginBottom: 12 }} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, textAlign: 'center' }}>Chưa có giao dịch nào{'\n'}trong giai đoạn này</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

    </View>
  );
}
