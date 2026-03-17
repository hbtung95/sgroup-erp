/**
 * BenefitsScreen — HR Benefits and Social Insurance
 */
import React from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Briefcase, Search, ShieldCheck, Heart, Plane, Plus } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import { useEmployees } from '../hooks/useHR';

// Benefits screen now uses employee data from the API

export function BenefitsScreen() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const { data: empData, isLoading } = useEmployees({ status: 'ACTIVE' });
  const employees = empData?.data || [];

  const benefitsData = employees.map((e: any) => ({
    id: e.id,
    code: e.employeeCode,
    name: e.fullName,
    bhxh: e.identityNumber || '-',
    pkHealth: e.status === 'ACTIVE' ? 'Gói Tiêu chuẩn' : '-',
    status: e.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING',
  }));

  const COLUMNS: any = [
    { key: 'name', title: 'NHÂN VIÊN', flex: 1.5, render: (v: any, row: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{row.code}</Text>
      </View>
    ) },
    { key: 'bhxh', title: 'MÃ SỐ BẢO HIỂM', flex: 1.2, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: cText }}>{v}</Text> },
    { key: 'pkHealth', title: 'BH SỨC KHỎE', flex: 1.5, render: (v: any) => <Text style={{ fontSize: 12, color: v === '-' ? cSub : '#ec4899' }}>{v}</Text> },
    { key: 'status', title: 'TRẠNG THÁI', flex: 1, align: 'center', render: (v: any) => {
      const isActive = v === 'ACTIVE';
      return (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: isActive ? '#dcfce7' : '#fef3c7', alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: isActive ? '#16a34a' : '#d97706' }}>
            {isActive ? 'ĐANG THAM GIA' : 'CHỜ ĐĂNG KÝ'}
          </Text>
        </View>
      );
    } }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: '#10b98120', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} color="#10b981" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Phúc lợi & BHXH</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Quản lý bảo hiểm và gói phúc lợi</Text>
            </View>
          </View>
          <TouchableOpacity style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: '#10b981', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
            ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
          }}>
            <Plus size={16} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>ĐĂNG KÝ BẢO HIỂM MỚI</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'BHXH / BHYT', desc: 'Bảo hiểm bắt buộc theo luật', icon: ShieldCheck, color: '#3b82f6', info: '240 thành viên' },
            { label: 'BH SỨC KHỎE', desc: 'Khám chữa bệnh 24/7 nội trú', icon: Heart, color: '#ec4899', info: '150 thành viên' },
            { label: 'TEAM BUILDING', desc: 'Sự kiện du lịch công ty hằng năm', icon: Plane, color: '#f59e0b', info: 'Dự kiến: T07/2026' },
          ].map((s, i) => (
            <View key={i} style={{
              flex: 1, minWidth: 260, padding: 24, borderRadius: 20,
              backgroundColor: cardBg, borderWidth: 1, borderColor,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={22} color={s.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{s.label}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: cSub, marginTop: 2 }}>{s.desc}</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: s.color }}>{s.info}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Table actions */}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 }}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: cardBg, borderWidth: 1, borderColor,
            borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
          }}>
            <Search size={18} color={cSub} />
            <Text style={{ color: cSub, fontSize: 14 }}>Tìm nhân viên...</Text>
          </View>
        </View>

        {/* Table */}
        <SGCard variant="glass" noPadding>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={{ color: cSub, marginTop: 12, fontSize: 13 }}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <SGTable 
              columns={COLUMNS} 
              data={benefitsData} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          )}
        </SGCard>
      </ScrollView>
    </View>
  );
}
