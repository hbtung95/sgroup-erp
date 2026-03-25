/**
 * PayrollScreen — Premium HR Payroll and Compensation Management
 * Features: View payslips, Privacy Mode (Fintech style), detailed compensations
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Search, FileText, CheckCircle, Clock, Eye, EyeOff, LayoutGrid, List, BarChart3, TrendingUp, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import type { HRRole } from '../HRSidebar';
import { usePayroll } from '../hooks/useHR';

const fmt = (n: number) => n.toLocaleString('vi-VN');
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const MOCK_HISTORY = [
  { month: 'T10', budget: 100, actual: 85 },
  { month: 'T11', budget: 100, actual: 94 },
  { month: 'T12', budget: 120, actual: 118 },
  { month: 'T01', budget: 110, actual: 98 },
  { month: 'T02', budget: 110, actual: 105 },
  { month: 'T03', budget: 110, actual: 108, forecast: true },
];



export function PayrollScreen({ userRole }: { userRole?: HRRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const [isPrivate, setIsPrivate] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Fetch real payroll from API
  const { data: rawPayroll, isLoading } = usePayroll({ year: String(currentYear), month: String(currentMonth) });

  const safePayroll = Array.isArray(rawPayroll) ? rawPayroll : (rawPayroll as any)?.data ?? [];

  // Transform API data for table
  const payrollData = safePayroll.map((r: any) => ({
    id: r.id,
    code: r.employee?.employeeCode || '',
    name: r.employee?.fullName || '',
    dept: r.employee?.department?.name || '',
    basic: Number(r.baseSalaryValue) || 0,
    allowance: Number(r.totalAllowance) || 0,
    commission: Number(r.commission) || 0,
    deduction: Number(r.totalDeduction) + Number(r.taxBhiT) || 0,
    total: Number(r.netPay) || 0,
    status: r.status === 'PAID' ? 'PAID' : r.status === 'APPROVED' ? 'APPROVED' : 'PENDING',
  }));

  const totalFund = payrollData.reduce((s: number, r: any) => s + r.total, 0);
  const totalAllowance = payrollData.reduce((s: number, r: any) => s + r.allowance + r.commission, 0);
  const totalDeduction = payrollData.reduce((s: number, r: any) => s + r.deduction, 0);
  const paidPct = payrollData.length > 0 ? Math.round(payrollData.filter((r: any) => r.status === 'PAID').length / payrollData.length * 100) : 0;

  const mask = (val: number) => isPrivate ? '***,***' : fmt(val);

  const COLUMNS: any = [
    { key: 'name', title: 'NHÂN VIÊN', flex: 1.5, render: (v: any, row: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{row.code} • {row.dept}</Text>
      </View>
    ) },
    { key: 'basic', title: 'LƯƠNG CƠ BẢN', flex: 1, render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '600', color: cText, fontVariant: ['tabular-nums'] }}>{mask(v)} ₫</Text> },
    { key: 'allowance', title: 'PHỤ CẤP / THƯỞNG', flex: 1, render: (v: any, row: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#10b981', fontVariant: ['tabular-nums'] }}>+ {mask(v + row.commission)} ₫</Text>
      </View>
    ) },
    { key: 'deduction', title: 'KHẤU TRỪ', flex: 1, render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '600', color: '#ef4444', fontVariant: ['tabular-nums'] }}>- {mask(v)} ₫</Text> },
    { key: 'total', title: 'THỰC LÃNH', flex: 1, render: (v: any) => <Text style={{ fontSize: 14, fontWeight: '800', color: '#3b82f6', fontVariant: ['tabular-nums'] }}>{mask(v)} ₫</Text> },
    { key: 'status', title: 'TRẠNG THÁI', flex: 0.8, align: 'center', render: (v: any) => {
      const isPaid = v === 'PAID';
      return (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: isPaid ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: isPaid ? '#16a34a' : '#d97706' }}>
            {isPaid ? 'ĐÃ CHI' : 'CHỜ DUYỆT'}
          </Text>
        </View>
      );
    } },
    { key: 'actions', title: '', flex: 0.5, align: 'right', render: () => (
      <TouchableOpacity style={{ padding: 6, backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 8 }}>
        <FileText size={16} color="#3b82f6" />
      </TouchableOpacity>
    ) }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Fintech Premium Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <LinearGradient 
              colors={['#8b5cf6', '#6366f1']} start={{x:0,y:0}} end={{x:1,y:1}}
              style={{ width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', 
                     shadowColor: '#8b5cf6', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}
            >
              <Wallet size={28} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -1 }}>Quản trị Quỹ lương</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Dữ liệu tài chính: Tháng {currentMonth}/{currentYear}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={() => setIsPrivate(!isPrivate)}
              style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: isPrivate ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)', 
              paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16,
              borderWidth: 1, borderColor: isPrivate ? 'rgba(34,197,94,0.2)' : 'rgba(244,63,94,0.2)',
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              {isPrivate ? <EyeOff size={18} color="#22c55e" /> : <Eye size={18} color="#f43f5e" />}
              <Text style={{ fontSize: 13, fontWeight: '800', color: isPrivate ? '#22c55e' : '#f43f5e' }}>
                {isPrivate ? 'CHẾ ĐỘ MẬT' : 'HIỂN THỊ'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={{
              backgroundColor: '#8b5cf6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16,
              shadowColor: '#8b5cf6', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
              justifyContent: 'center',
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>CHỐT BẢNG LƯƠNG</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Financial KPI Cards */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'TỔNG QUỸ LƯƠNG', val: mask(totalFund), unit: '₫', icon: DollarSign, color: '#8b5cf6', shadow: '#8b5cf6', gradient: ['#8b5cf6', '#6366f1'] },
            { label: 'TỔNG THƯỞNG / PHỤ CẤP', val: mask(totalAllowance), unit: '₫', icon: ArrowUpRight, color: '#10b981', shadow: '#10b981', gradient: ['#10b981', '#059669'] },
            { label: 'BHXH & KHẤU TRỪ', val: mask(totalDeduction), unit: '₫', icon: ArrowDownRight, color: '#f43f5e', shadow: '#f43f5e', gradient: ['#f43f5e', '#e11d48'] },
            { label: 'ĐÃ THANH TOÁN', val: isPrivate ? '***' : `${paidPct}%`, unit: '', icon: CheckCircle, color: '#3b82f6', shadow: '#3b82f6', gradient: ['#3b82f6', '#2563eb'] },
          ].map((s, i) => (
            <LinearGradient
              key={i}
              colors={isDark ? ['rgba(30,41,59,0.7)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#ffffff']}
              style={{
                flex: 1, minWidth: 220, padding: 24, borderRadius: 28,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                shadowColor: isDark ? '#000' : s.shadow, shadowOpacity: isDark ? 0.5 : 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <LinearGradient
                  colors={s.gradient as [string, string]} start={{x:0, y:0}} end={{x:1, y:1}}
                  style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: s.shadow, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width:0, height:4} }}
                >
                  <s.icon size={22} color="#fff" />
                </LinearGradient>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1, fontVariant: ['tabular-nums'] }}>{s.val}</Text>
                {s.unit ? <Text style={{ fontSize: 16, fontWeight: '700', color: cSub }}>{s.unit}</Text> : null}
              </View>
            </LinearGradient>
          ))}
        </Animated.View>

        {/* Payroll Analytics Dashboard */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{
          backgroundColor: isDark ? 'rgba(30,41,59,0.35)' : '#ffffff',
          borderRadius: 28, padding: 32,
          borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          ...(Platform.OS === 'web' ? { 
            backdropFilter: 'blur(32px)', 
            WebkitBackdropFilter: 'blur(32px)',
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 12px 32px rgba(0,0,0,0.04)' 
          } : {}),
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <LinearGradient
                colors={isDark ? ['rgba(139,92,246,0.2)', 'rgba(99,102,241,0.05)'] : ['#f5f3ff', '#e0e7ff']}
                style={{ padding: 14, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,0.1)' }}
              >
                <BarChart3 size={24} color="#8b5cf6" />
              </LinearGradient>
              <View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: cText, letterSpacing: -0.5 }}>Phân tích Ngân sách & Dự báo</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Xu hướng quỹ lương 6 tháng gần nhất</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>Ngân sách Mức trần</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <LinearGradient colors={['#8b5cf6', '#6366f1']} style={{ width: 14, height: 14, borderRadius: 4 }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>Thực chi</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <LinearGradient colors={['#f59e0b', '#d97706']} style={{ width: 14, height: 14, borderRadius: 4 }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>Dự báo (AI)</Text>
              </View>
            </View>
          </View>

          {/* Chart Area */}
          <View style={{ height: 260, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 10 }}>
            {MOCK_HISTORY.map((item, idx) => {
              const maxBudget = 130; // Chart Y-axis max
              const budgetH = (item.budget / maxBudget) * 100 + '%';
              const actualH = (item.actual / maxBudget) * 100 + '%';
              
              return (
                <View key={idx} style={{ alignItems: 'center', flex: 1, gap: 16 }}>
                  {item.forecast && (
                    <Animated.View entering={FadeInDown.delay(800)} style={{ position: 'absolute', top: -30, backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#f59e0b' }}>AI FORECAST</Text>
                    </Animated.View>
                  )}
                  <View style={{ width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {/* Budget Bar */}
                    <View style={{ 
                      position: 'absolute', bottom: 0, width: 48, height: budgetH as any, 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', 
                      borderRadius: 12, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                      borderStyle: item.forecast ? 'dashed' : 'solid'
                    }} />
                    
                    {/* Actual Bar */}
                    <Animated.View 
                      entering={FadeInDown.delay(300 + idx * 100).springify()} 
                      style={{ 
                        position: 'absolute', bottom: 0, width: 48, height: actualH as any, 
                        borderRadius: 12, opacity: isPrivate ? 0.4 : 1,
                        shadowColor: item.forecast ? '#f59e0b' : '#8b5cf6', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }
                      }} 
                    >
                      <LinearGradient
                        colors={item.forecast ? ['#f59e0b', '#d97706'] : ['#8b5cf6', '#6366f1']}
                        style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                      />
                    </Animated.View>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: item.forecast ? '#f59e0b' : cSub }}>{item.month}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Filters */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flexDirection: 'row', gap: 16, alignItems: 'center', marginTop: 12 }}>
          <View style={{
            flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            borderRadius: 16, padding: 4,
          }}>
            <TouchableOpacity onPress={() => setViewMode('table')} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: viewMode === 'table' ? (isDark ? '#3b82f6' : '#fff') : 'transparent', shadowColor: '#000', shadowOpacity: viewMode === 'table' ? 0.05 : 0, shadowRadius: 4, elevation: viewMode === 'table' ? 2 : 0 }}>
              <List size={18} color={viewMode === 'table' ? (isDark ? '#fff' : cText) : cSub} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('grid')} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: viewMode === 'grid' ? (isDark ? '#3b82f6' : '#fff') : 'transparent', shadowColor: '#000', shadowOpacity: viewMode === 'grid' ? 0.05 : 0, shadowRadius: 4, elevation: viewMode === 'grid' ? 2 : 0 }}>
              <LayoutGrid size={18} color={viewMode === 'grid' ? (isDark ? '#fff' : cText) : cSub} />
            </TouchableOpacity>
          </View>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', 
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            borderRadius: 16, paddingHorizontal: 20, paddingVertical: 14,
            shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
          }}>
            <Search size={20} color={cSub} />
            <Text style={{ color: cSub, fontSize: 15, fontWeight: '600' }}>Tìm kiếm CBNV theo tên hoặc mã số...</Text>
          </View>
          <TouchableOpacity style={{
            paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16,
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', 
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
            shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>Bộ lọc Trạng thái: Tất cả</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Content View */}
        {isLoading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={{ color: cSub, marginTop: 16, fontSize: 14, fontWeight: '600' }}>Đang tính toán dữ liệu lương...</Text>
          </View>
        ) : viewMode === 'table' ? (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{
            backgroundColor: isDark ? 'rgba(30,41,59,0.35)' : '#ffffff',
            borderRadius: 28, overflow: 'hidden',
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            ...(Platform.OS === 'web' ? { 
              backdropFilter: 'blur(32px)', 
              WebkitBackdropFilter: 'blur(32px)',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 12px 32px rgba(0,0,0,0.04)' 
            } : {}),
          }}>
            <SGTable 
              columns={COLUMNS} 
              data={payrollData} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          </Animated.View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            {payrollData.length === 0 ? (
              <Text style={{ color: cSub, fontSize: 15, padding: 32, textAlign: 'center', width: '100%' }}>Không có dữ liệu bảng lương tháng này.</Text>
            ) : null}
            {payrollData.map((item: any, idx: number) => {
              const isPaid = item.status === 'PAID';
              return (
                <Animated.View
                  entering={FadeInDown.delay(300 + idx * 40).duration(400).springify()}
                  key={item.id || idx}
                  style={{
                    flex: 1, minWidth: 320, maxWidth: Platform.OS === 'web' ? '48%' : '100%', borderRadius: 24,
                    shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4,
                  }}
                >
                  <LinearGradient
                    colors={isDark ? ['rgba(30,41,59,0.5)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#ffffff']}
                    style={{ flex: 1, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
                  >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                      <LinearGradient
                        colors={isDark ? ['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.05)'] : ['#eff6ff', '#dbeafe']}
                        style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(59,130,246,0.1)' }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#3b82f6' }}>{item.name.charAt(0)}</Text>
                      </LinearGradient>
                      <View>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{item.name}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 2 }}>{item.code} • {item.dept}</Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: isPaid ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: isPaid ? '#16a34a' : '#d97706', letterSpacing: 0.5 }}>
                        {isPaid ? 'ĐÃ CHI' : 'CHỜ DUYỆT'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ gap: 12, marginBottom: 24, paddingHorizontal: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Lương cơ bản</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: cText, fontVariant: ['tabular-nums'] }}>{mask(item.basic)} ₫</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Phụ cấp / Thưởng</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#10b981', fontVariant: ['tabular-nums'] }}>+ {mask(item.allowance + item.commission)} ₫</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Khấu trừ</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#ef4444', fontVariant: ['tabular-nums'] }}>- {mask(item.deduction)} ₫</Text>
                    </View>
                  </View>

                  <View style={{ borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 0.5 }}>Thực lãnh</Text>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: '#3b82f6', fontVariant: ['tabular-nums'], letterSpacing: -0.5 }}>{mask(item.total)} ₫</Text>
                  </View>
                  </LinearGradient>
                </Animated.View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}
