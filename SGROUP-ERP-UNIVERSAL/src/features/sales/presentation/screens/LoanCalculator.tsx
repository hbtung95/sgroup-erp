/**
 * LoanCalculator — Công cụ tính khoản vay BĐS cho NVKD
 * Giúp tư vấn khách hàng nhanh về ngân hàng, lãi suất, trả góp
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { Calculator, Building, Percent, Calendar, TrendingDown, DollarSign, ChevronDown } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { SGPlanningSectionTitle } from '../../../../shared/ui/components';

const fmt = (n: number) => Math.round(n).toLocaleString('vi-VN');

const BANKS = [
  { name: 'Vietcombank', rate: 7.5 },
  { name: 'Techcombank', rate: 8.0 },
  { name: 'VPBank', rate: 8.5 },
  { name: 'BIDV', rate: 7.8 },
  { name: 'MB Bank', rate: 8.2 },
];

export function LoanCalculator() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const [propertyValue, setPropertyValue] = useState(3500); // Triệu
  const [downPaymentPct, setDownPaymentPct] = useState(30); // %
  const [loanTerm, setLoanTerm] = useState(20); // Năm
  const [interestRate, setInterestRate] = useState(8.0); // %

  const loanAmount = propertyValue * (1 - downPaymentPct / 100);
  const downPayment = propertyValue * downPaymentPct / 100;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount > 0 && monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;
  const totalPayment = monthlyPayment * numPayments;
  const totalInterest = totalPayment - loanAmount;

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  };

  const SliderRow = ({ label, value, unit, min, max, step, onChange, color }: any) => (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{label}</Text>
        <Text style={{ fontSize: 18, fontWeight: '900', color: color || cText }}>{typeof value === 'number' ? fmt(value) : value} {unit}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={() => onChange(Math.max(min, value - step))} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>−</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', overflow: 'hidden' }}>
          <View style={{ width: `${((value - min) / (max - min)) * 100}%`, height: '100%', borderRadius: 4, backgroundColor: color || '#3b82f6' }} />
        </View>
        <TouchableOpacity onPress={() => onChange(Math.min(max, value + step))} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#22c55e', textTransform: 'uppercase', marginBottom: 4 }}>CÔNG CỤ HỖ TRỢ</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Tính Khoản Vay BĐS</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, marginTop: 8 }}>
            Tính nhanh trả góp hàng tháng để tư vấn khách hàng
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          {/* Input Panel */}
          <View style={[cardStyle, { flex: 1.2, minWidth: 400 }]}>
            <SGPlanningSectionTitle icon={Calculator} title="Thông Tin Khoản Vay" accent="#3b82f6" badgeText="INPUT" style={{ marginBottom: 28 }} />

            <SliderRow label="Giá trị BĐS" value={propertyValue} unit="Triệu" min={500} max={50000} step={500} onChange={setPropertyValue} color="#3b82f6" />
            <SliderRow label="Tỷ lệ trả trước" value={downPaymentPct} unit="%" min={10} max={70} step={5} onChange={setDownPaymentPct} color="#8b5cf6" />
            <SliderRow label="Thời hạn vay" value={loanTerm} unit="năm" min={5} max={30} step={1} onChange={setLoanTerm} color="#f59e0b" />
            <SliderRow label="Lãi suất / năm" value={interestRate.toFixed(1)} unit="%" min={5} max={15} step={0.5} onChange={setInterestRate} color="#ef4444" />
          </View>

          {/* Result Panel */}
          <View style={{ flex: 1, minWidth: 350, gap: 20 }}>
            {/* Monthly Payment - Hero */}
            <View style={[cardStyle, {
              backgroundColor: isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff',
              borderColor: isDark ? 'rgba(59,130,246,0.2)' : '#bfdbfe',
            }]}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 }}>
                TRẢ GÓP HÀNG THÁNG
              </Text>
              <Text style={{ fontSize: 42, fontWeight: '900', color: isDark ? '#fff' : '#1e40af', letterSpacing: -1 }}>
                {fmt(monthlyPayment)} <Text style={{ fontSize: 18, fontWeight: '700' }}>₫</Text>
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6', marginTop: 8 }}>
                ≈ {(monthlyPayment / 1000000).toFixed(1)} triệu VNĐ/tháng
              </Text>
            </View>

            {/* Breakdown */}
            <View style={cardStyle}>
              <View style={{ gap: 16 }}>
                {[
                  { label: 'Giá trị BĐS', value: `${fmt(propertyValue)} Tr`, color: cText },
                  { label: 'Trả trước', value: `${fmt(downPayment)} Tr (${downPaymentPct}%)`, color: '#22c55e' },
                  { label: 'Số tiền vay', value: `${fmt(loanAmount)} Tr`, color: '#3b82f6' },
                  { label: 'Tổng lãi phải trả', value: `${fmt(totalInterest)} Tr`, color: '#ef4444' },
                  { label: 'Tổng phải trả', value: `${fmt(totalPayment)} Tr`, color: '#8b5cf6' },
                ].map((row, i) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: cSub }}>{row.label}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: row.color }}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bank Comparison */}
            <View style={cardStyle}>
              <SGPlanningSectionTitle icon={Building} title="So Sánh Ngân Hàng" accent="#22c55e" badgeText="BANKS" style={{ marginBottom: 16 }} />
              <View style={{ gap: 10 }}>
                {BANKS.map((bank, i) => {
                  const mr = bank.rate / 100 / 12;
                  const mp = loanAmount > 0 && mr > 0
                    ? (loanAmount * mr * Math.pow(1 + mr, numPayments)) / (Math.pow(1 + mr, numPayments) - 1)
                    : 0;
                  return (
                    <View key={i} style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      padding: 14, borderRadius: 14,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                      borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                    }}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{bank.name}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>{bank.rate}%/năm</Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#3b82f6' }}>
                        {(mp / 1000000).toFixed(1)} <Text style={{ fontSize: 12, fontWeight: '700' }}>tr/tháng</Text>
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
