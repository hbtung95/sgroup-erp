/**
 * CashflowSection — Premium cashflow display
 * Features: Glassmorphism account cards, premium transaction list, dark mode
 */
import React from 'react';
import { View, Text, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Banknote,
  CreditCard,
  BookOpen,
} from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { useFinanceTransactions, useFinanceAccounts } from '../hooks/useFinance';
import { SGPlanningSectionTitle } from '@sgroup/ui/src/ui/components';

const ACCOUNT_TYPE_CONFIG: Record<string, { icon: any; gradient: [string, string]; color: string }> = {
  CASH: { icon: Banknote, gradient: ['#34d399', '#059669'], color: '#10b981' },
  BANK: { icon: CreditCard, gradient: ['#60a5fa', '#2563eb'], color: '#3b82f6' },
  EPAY: { icon: Wallet, gradient: ['#a78bfa', '#7c3aed'], color: '#8b5cf6' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export const CashflowSection = () => {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const { data: accountsData, isLoading: accountsLoading } = useFinanceAccounts();
  const { data: txData, isLoading: txLoading } = useFinanceTransactions({ limit: 8 });

  if (accountsLoading || txLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={{ color: cSub, marginTop: 12, fontWeight: '600' }}>Đang tải dòng tiền...</Text>
      </View>
    );
  }

  const accounts = Array.isArray(accountsData) ? accountsData : [];
  const transactions = Array.isArray(txData?.data) ? txData.data : [];

  return (
    <View style={{ flex: 1, gap: 28 }}>
      {/* ══════ SỔ QUỸ ══════ */}
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SGPlanningSectionTitle
            icon={BookOpen}
            title="Sổ Quỹ"
            accent="#10b981"
            badgeText="ACCOUNTS"
          />
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 16,
              }}
            />
            <Plus size={16} color="#fff" strokeWidth={2.5} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>Tạo Sổ</Text>
          </TouchableOpacity>
        </View>

        {accounts.length === 0 ? (
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
            <Wallet size={40} color="#94a3b8" />
            <Text style={{ fontSize: 15, fontWeight: '700', color: cSub, marginTop: 12 }}>
              Chưa có sổ quỹ nào
            </Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Tạo sổ quỹ đầu tiên để theo dõi dòng tiền
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {accounts.map((item: any) => {
              const config = ACCOUNT_TYPE_CONFIG[item.accountType] || ACCOUNT_TYPE_CONFIG.CASH;
              const Icon = config.icon;
              return (
                <View
                  key={item.id}
                  style={{
                    flex: 1,
                    minWidth: 200,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fafafa',
                    borderRadius: 24,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                    ...(Platform.OS === 'web'
                      ? {
                          transition: 'all 0.25s ease',
                          cursor: 'pointer',
                        }
                      : {}),
                  } as any}
                >
                  <LinearGradient
                    colors={config.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                      shadowColor: config.color,
                      shadowOpacity: 0.35,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 4,
                    }}
                  >
                    <Icon size={24} color="#fff" />
                  </LinearGradient>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginBottom: 4 }}>
                    {item.accountName}
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>
                    {fmt(item.currentBalance)}
                  </Text>
                  <View
                    style={{
                      marginTop: 10,
                      backgroundColor: `${config.color}15`,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: config.color, letterSpacing: 0.3 }}>
                      {item.accountType === 'CASH' ? '💵 TIỀN MẶT' : item.accountType === 'BANK' ? '🏦 NGÂN HÀNG' : '📱 VÍ ĐIỆN TỬ'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* ══════ GIAO DỊCH GẦN ĐÂY ══════ */}
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <SGPlanningSectionTitle
            icon={Banknote}
            title="Giao Dịch Gần Đây"
            accent="#3b82f6"
            badgeText="TRANSACTIONS"
          />
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 16,
              }}
            />
            <Plus size={16} color="#fff" strokeWidth={2.5} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>Tạo Phiếu</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
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
            <Banknote size={40} color="#94a3b8" />
            <Text style={{ fontSize: 15, fontWeight: '700', color: cSub, marginTop: 12 }}>
              Chưa có giao dịch nào
            </Text>
            <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Tạo phiếu thu/chi để bắt đầu ghi nhận giao dịch
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {transactions.map((tx: any) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <View
                  key={tx.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fafafa',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                    ...(Platform.OS === 'web'
                      ? { transition: 'all 0.2s ease', cursor: 'pointer' }
                      : {}),
                  } as any}
                >
                  {/* Icon */}
                  <LinearGradient
                    colors={isIncome ? ['#dcfce7', '#bbf7d0'] : ['#fee2e2', '#fecaca']}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                  >
                    {isIncome ? (
                      <ArrowDownRight size={22} color="#16a34a" strokeWidth={2.5} />
                    ) : (
                      <ArrowUpRight size={22} color="#dc2626" strokeWidth={2.5} />
                    )}
                  </LinearGradient>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: cText, letterSpacing: -0.2 }}>
                      {tx.note || (isIncome ? 'Phiếu thu' : 'Phiếu chi')}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8' }}>
                        {tx.transactionCode}
                      </Text>
                      <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: '#cbd5e1' }} />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8' }}>
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>

                  {/* Amount + Status */}
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '900',
                        letterSpacing: -0.5,
                        color: isIncome ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {isIncome ? '+' : '-'} {fmt(tx.amount)}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 10,
                        backgroundColor:
                          tx.status === 'APPROVED'
                            ? isDark
                              ? 'rgba(34,197,94,0.15)'
                              : '#dcfce7'
                            : isDark
                            ? 'rgba(245,158,11,0.15)'
                            : '#fef3c7',
                        borderWidth: 1,
                        borderColor:
                          tx.status === 'APPROVED'
                            ? 'rgba(34,197,94,0.25)'
                            : 'rgba(245,158,11,0.25)',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '800',
                          letterSpacing: 0.3,
                          color: tx.status === 'APPROVED' ? '#16a34a' : '#d97706',
                        }}
                      >
                        {tx.status === 'APPROVED' ? '✓ ĐÃ DUYỆT' : '⏳ CHỜ DUYỆT'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

// Keep backward compat export
export const CashflowTab = CashflowSection;
