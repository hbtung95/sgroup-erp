/**
 * FinanceScreen — Premium Finance & Accounting Dashboard
 * Features: Hero header, KPI cards, Cashflow section, Debt section
 * Supports dark mode via useAppTheme
 */
import React from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  Wallet,
  HandCoins,
} from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { FinanceErrorBoundary } from '../../components/FinanceErrorBoundary';
import { CashflowSection } from '../../components/CashflowTab';
import { DebtSection } from '../../components/DebtTab';
import { useFinanceDashboard, useFinanceAccounts, useFinanceTransactions, useFinanceDebts } from '../../hooks/useFinance';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} Tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} Tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('vi-VN');
};

export function FinanceScreen() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const { data: dashboardStats, isLoading: dashLoading } = useFinanceDashboard();
  const { data: accountsData, isLoading: accLoading } = useFinanceAccounts();
  const { data: txData, isLoading: txLoading } = useFinanceTransactions({ limit: 8 });
  const { data: debtsReceivable } = useFinanceDebts({ debtType: 'RECEIVABLE_CUSTOMER', limit: 5 });
  const { data: debtsPayable } = useFinanceDebts({ debtType: 'PAYABLE_STAFF', limit: 5 });

  const accounts = Array.isArray(accountsData) ? accountsData : [];
  const transactions = Array.isArray(txData?.data) ? txData.data : [];

  // Calculate KPI values
  const totalBalance = accounts.reduce((sum: number, a: any) => sum + (a.currentBalance || 0), 0);
  const totalIncome = transactions.filter((t: any) => t.type === 'INCOME').reduce((s: number, t: any) => s + (t.amount || 0), 0);
  const totalExpense = transactions.filter((t: any) => t.type === 'EXPENSE').reduce((s: number, t: any) => s + (t.amount || 0), 0);
  const totalReceivable = Array.isArray(debtsReceivable?.data)
    ? debtsReceivable.data.reduce((s: number, d: any) => s + (d.remainingAmount || 0), 0)
    : 0;

  const isLoading = dashLoading || accLoading || txLoading;

  const kpiCards = [
    {
      id: 'income',
      label: 'TỔNG THU',
      value: fmtShort(totalIncome),
      gradient: ['#34d399', '#059669'] as [string, string],
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      id: 'expense',
      label: 'TỔNG CHI',
      value: fmtShort(totalExpense),
      gradient: ['#fb923c', '#ea580c'] as [string, string],
      icon: TrendingDown,
      color: '#f97316',
    },
    {
      id: 'balance',
      label: 'SỐ DƯ RÒNG',
      value: fmtShort(totalBalance),
      gradient: ['#60a5fa', '#2563eb'] as [string, string],
      icon: Wallet,
      color: '#3b82f6',
    },
    {
      id: 'receivable',
      label: 'PHẢI THU',
      value: fmtShort(totalReceivable),
      gradient: ['#a78bfa', '#7c3aed'] as [string, string],
      icon: HandCoins,
      color: '#8b5cf6',
    },
  ];

  // Glassmorphism card style
  const card = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.55)' : 'rgba(255,255,255,0.85)',
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(40px)',
          boxShadow: isDark
            ? '0 16px 40px rgba(0,0,0,0.5)'
            : '0 12px 32px rgba(0,0,0,0.06)',
        }
      : {
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 4,
        }),
  };

  return (
    <FinanceErrorBoundary>
      <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
        <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }}>

          {/* ══════════ HERO HEADER ══════════ */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <LinearGradient
                colors={isDark ? ['#10b981', '#059669'] : ['#34d399', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#10b981',
                  shadowOpacity: 0.5,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 8,
                }}
              >
                <Landmark size={32} color="#fff" strokeWidth={2.5} />
              </LinearGradient>
              <View>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: '900',
                    color: cText,
                    letterSpacing: -0.8,
                  }}
                >
                  TÀI CHÍNH & KẾ TOÁN
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#94a3b8',
                    marginTop: 6,
                  }}
                >
                  Tổng quan dòng tiền, sổ quỹ & công nợ
                </Text>
              </View>
            </View>
          </View>

          {/* ══════════ KPI CARDS ══════════ */}
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={{ color: cSub, marginTop: 12, fontWeight: '600' }}>
                Đang tải dữ liệu tài chính...
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 10 }}>
              {kpiCards.map((k) => (
                <View
                  key={k.id}
                  style={{
                    flex: 1,
                    minWidth: 220,
                    backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.9)',
                    borderRadius: 28,
                    padding: 28,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)',
                    ...(Platform.OS === 'web'
                      ? {
                          backdropFilter: 'blur(20px)',
                          boxShadow: isDark
                            ? '0 12px 32px rgba(0,0,0,0.3)'
                            : '0 8px 24px rgba(0,0,0,0.06)',
                          transition: 'all 0.3s ease',
                        }
                      : {
                          shadowColor: '#000',
                          shadowOpacity: isDark ? 0.3 : 0.04,
                          shadowRadius: 20,
                          shadowOffset: { width: 0, height: 10 },
                          elevation: 4,
                        }),
                  } as any}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 24,
                    }}
                  >
                    <LinearGradient
                      colors={k.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: k.color,
                        shadowOpacity: 0.4,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 4,
                      }}
                    >
                      {(() => {
                        const Icon = k.icon;
                        return <Icon size={26} color="#fff" />;
                      })()}
                    </LinearGradient>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '800',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    {k.label}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                    <Text
                      style={{
                        fontSize: 36,
                        fontWeight: '900',
                        color: cText,
                        letterSpacing: -1.5,
                      }}
                    >
                      {k.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ══════════ MAIN CONTENT: 2 COLUMNS ══════════ */}
          <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
            {/* LEFT: Cashflow Section */}
            <View style={[card as any, { flex: 1.2, minWidth: 400 }]}>
              <CashflowSection />
            </View>

            {/* RIGHT: Debt Section */}
            <View style={[card as any, { flex: 1, minWidth: 400 }]}>
              <DebtSection />
            </View>
          </View>

        </ScrollView>
      </View>
    </FinanceErrorBoundary>
  );
}
