/**
 * DebtSection — Premium debt management display
 * Features: Progress bars, glassmorphism cards, filter chips, dark mode
 */
import React, { useState } from 'react';
import { View, Text, Platform, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  HandCoins,
  Users,
  Building2,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { useFinanceDebts } from '../hooks/useFinance';
import { SGPlanningSectionTitle } from '@sgroup/ui/src/ui/components';

const DEBT_FILTERS = [
  {
    key: 'RECEIVABLE_CUSTOMER',
    label: 'Phải thu KH',
    icon: Users,
    color: '#3b82f6',
    gradient: ['#60a5fa', '#2563eb'] as [string, string],
  },
  {
    key: 'RECEIVABLE_DEVELOPER',
    label: 'Phải thu CĐT',
    icon: Building2,
    color: '#8b5cf6',
    gradient: ['#a78bfa', '#7c3aed'] as [string, string],
  },
  {
    key: 'PAYABLE_STAFF',
    label: 'Phải trả NS',
    icon: UserCheck,
    color: '#f97316',
    gradient: ['#fb923c', '#ea580c'] as [string, string],
  },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  PAID: { color: '#16a34a', bg: '#dcfce7', label: '✓ ĐÃ THANH TOÁN', icon: CheckCircle2 },
  PARTIAL: { color: '#d97706', bg: '#fef3c7', label: '◐ THANH TOÁN MỘT PHẦN', icon: Clock },
  UNPAID: { color: '#dc2626', bg: '#fee2e2', label: '✕ CHƯA THANH TOÁN', icon: AlertCircle },
  OVERDUE: { color: '#dc2626', bg: '#fee2e2', label: '⚠ QUÁ HẠN', icon: AlertCircle },
  CANCELLED: { color: '#64748b', bg: '#f1f5f9', label: '— ĐÃ HUỶ', icon: Clock },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export const DebtSection = () => {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const [debtType, setDebtType] = useState('RECEIVABLE_CUSTOMER');
  const { data: debtsData, isLoading } = useFinanceDebts({ debtType, limit: 10 });

  const debts = Array.isArray(debtsData?.data) ? debtsData.data : [];
  const activeFilter = DEBT_FILTERS.find((f) => f.key === debtType) || DEBT_FILTERS[0];

  // Summary stats
  const totalAmount = debts.reduce((s: number, d: any) => s + (d.totalAmount || 0), 0);
  const totalRemaining = debts.reduce((s: number, d: any) => s + (d.remainingAmount || 0), 0);
  const paidPercent = totalAmount > 0 ? Math.round(((totalAmount - totalRemaining) / totalAmount) * 100) : 0;

  return (
    <View style={{ flex: 1, gap: 24 }}>
      {/* Section Header */}
      <SGPlanningSectionTitle
        icon={HandCoins}
        title="Quản Lý Công Nợ"
        accent="#8b5cf6"
        badgeText="DEBTS"
      />

      {/* Filter Chips */}
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {DEBT_FILTERS.map((f) => {
          const isActive = debtType === f.key;
          const Icon = f.icon;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setDebtType(f.key)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: isActive
                  ? isDark
                    ? `${f.color}30`
                    : `${f.color}15`
                  : isDark
                  ? 'rgba(255,255,255,0.04)'
                  : '#f1f5f9',
                borderWidth: 1,
                borderColor: isActive
                  ? `${f.color}40`
                  : isDark
                  ? 'rgba(255,255,255,0.06)'
                  : '#e2e8f0',
                ...(Platform.OS === 'web'
                  ? { transition: 'all 0.2s ease', cursor: 'pointer' }
                  : {}),
              } as any}
            >
              <Icon size={14} color={isActive ? f.color : '#94a3b8'} strokeWidth={2.5} />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? '800' : '600',
                  color: isActive ? f.color : cSub,
                }}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary Bar */}
      {debts.length > 0 && (
        <View
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fafafa',
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 4 }}>
                TỔNG CÔNG NỢ
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>
                {fmt(totalAmount)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 4 }}>
                CÒN LẠI
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#dc2626', letterSpacing: -0.5 }}>
                {fmt(totalRemaining)}
              </Text>
            </View>
          </View>
          {/* Progress bar */}
          <View
            style={{
              height: 12,
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={activeFilter.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${paidPercent}%`,
                height: '100%',
                borderRadius: 6,
                shadowColor: activeFilter.color,
                shadowOpacity: 0.4,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '800',
              color: activeFilter.color,
              marginTop: 8,
              textAlign: 'right',
            }}
          >
            Đã thu {paidPercent}%
          </Text>
        </View>
      )}

      {/* Loading */}
      {isLoading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={activeFilter.color} />
          <Text style={{ color: cSub, marginTop: 12, fontWeight: '600' }}>Đang tải công nợ...</Text>
        </View>
      ) : debts.length === 0 ? (
        <View
          style={{
            padding: 40,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
            borderStyle: 'dashed',
          }}
        >
          <HandCoins size={40} color="#94a3b8" />
          <Text style={{ fontSize: 15, fontWeight: '700', color: cSub, marginTop: 12 }}>
            Không có công nợ nào
          </Text>
          <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            Dữ liệu sẽ hiển thị khi có phát sinh công nợ
          </Text>
        </View>
      ) : (
        /* Debt Cards */
        <View style={{ gap: 14 }}>
          {debts.map((item: any) => {
            const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.UNPAID;
            const paidPct =
              item.totalAmount > 0
                ? Math.round(((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100)
                : 0;

            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                  ...(Platform.OS === 'web'
                    ? { transition: 'all 0.2s ease', cursor: 'pointer' }
                    : {}),
                } as any}
              >
                {/* Header: code + status */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '800', color: cText, letterSpacing: -0.2 }}>
                    {item.debtCode}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 10,
                      backgroundColor: isDark ? `${statusCfg.color}20` : statusCfg.bg,
                      borderWidth: 1,
                      borderColor: `${statusCfg.color}25`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '800',
                        color: statusCfg.color,
                        letterSpacing: 0.3,
                      }}
                    >
                      {statusCfg.label}
                    </Text>
                  </View>
                </View>

                {/* Note */}
                <Text
                  style={{ fontSize: 14, color: cSub, marginBottom: 16 }}
                  numberOfLines={1}
                >
                  {item.note || 'Không có ghi chú'}
                </Text>

                {/* Amount row */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', marginBottom: 4 }}>
                      TỔNG TIỀN
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: cText, letterSpacing: -0.3 }}>
                      {fmt(item.totalAmount)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', marginBottom: 4 }}>
                      CÒN LẠI
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '900',
                        color: item.remainingAmount > 0 ? '#dc2626' : '#16a34a',
                        letterSpacing: -0.3,
                      }}
                    >
                      {fmt(item.remainingAmount)}
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View
                  style={{
                    height: 8,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={activeFilter.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: `${paidPct}%`,
                      height: '100%',
                      borderRadius: 4,
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: activeFilter.color,
                    marginTop: 6,
                    textAlign: 'right',
                  }}
                >
                  {paidPct}% hoàn thành
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// Keep backward compat export
export const DebtTab = DebtSection;
