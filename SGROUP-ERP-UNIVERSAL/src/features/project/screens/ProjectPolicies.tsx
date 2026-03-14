import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useTheme, typography } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard, SGButton } from '../../../shared/ui';
import { Plus, Percent, CalendarClock, ChevronRight, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

const MOCK_POLICIES = [
  { 
    id: '1', name: 'Chiết khấu Thanh toán sớm 95%', 
    startDate: '01/10/2023', endDate: '31/12/2023',
    status: 'ACTIVE',
    rules: ['Chiết khấu 8% vào giá bán', 'Miễn phí quản lý 2 năm', 'Tặng gói nội thất 100tr'],
    color: '#10b981'
  },
  { 
    id: '2', name: 'Chính sách Vay NH 70% Ân hạn gốc lãi', 
    startDate: '15/10/2023', endDate: '15/01/2024',
    status: 'ACTIVE',
    rules: ['Bảo lãnh NH MBBank', 'Hỗ trợ lãi suất 0% trong 18 tháng', 'Ân hạn nợ gốc 18 tháng'],
    color: '#3b82f6'
  },
  { 
    id: '3', name: 'Hoa hồng Đại lý Quý 4/2023', 
    startDate: '01/10/2023', endDate: '31/12/2023',
    status: 'DRAFT',
    rules: ['Phí MG căn tiêu chuẩn: 2.5%', 'Phí MG căn góc: 3%', 'Thưởng nóng 20tr/căn'],
    color: '#f59e0b'
  },
];

export function ProjectPolicies() {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const [activeTab, setActiveTab] = useState('active');

  return (
    <View style={styles.container}>
      {/* Aurora Backdrop */}
      {Platform.OS === 'web' && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 0, overflow: 'hidden' }]} pointerEvents="none">
          <View style={{
            position: 'absolute', top: '10%', right: '-5%', width: 450, height: 450,
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.03)' : 'rgba(16, 185, 129, 0.02)',
            borderRadius: 225,
          } as any} />
        </View>
      )}

      <View style={[styles.header, { zIndex: 1 }]}>
        <View>
          <Text style={[typography.h1, { color: colors.text, fontWeight: '800', letterSpacing: -0.5 }]}>Chính sách Bán hàng</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8, fontSize: 15 }]}>
            Thiết lập chiết khấu, tiến độ thanh toán và phí môi giới
          </Text>
        </View>
        <SGButton title="Thêm Chính sách" icon={<Plus size={18} color="#fff" />} variant="primary" onPress={() => {}} 
          style={{ backgroundColor: '#10b981' }} />
      </View>

      <View style={{ flexDirection: 'row', gap: 24, flex: 1, zIndex: 1 }}>
        {/* Left Column: List */}
        <View style={{ flex: 1.5 }}>
          <View style={[styles.sectionCard, isDark ? styles.glassCardDark : styles.glassCardLight, Platform.OS === 'web' && styles.glassEffect as any]}>
            <View style={{ flexDirection: 'row', gap: 24, marginBottom: 24, borderBottomWidth: 2, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
              {['active', 'draft'].map(tab => (
                <TouchableOpacity 
                  key={tab} 
                  onPress={() => setActiveTab(tab)}
                  style={{ paddingBottom: 14, borderBottomWidth: 3, borderBottomColor: activeTab === tab ? '#10b981' : 'transparent', marginBottom: -2 }}
                >
                  <Text style={[typography.body, { 
                    color: activeTab === tab ? '#10b981' : colors.textSecondary,
                    fontWeight: activeTab === tab ? '800' : '600'
                  }]}>
                    {tab === 'active' ? 'Đang áp dụng' : 'Bản nháp / Đã đóng'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 40 }}>
              {MOCK_POLICIES.filter(p => activeTab === 'active' ? p.status === 'ACTIVE' : p.status === 'DRAFT').map(policy => (
                <TouchableOpacity key={policy.id} style={[styles.policyCard, {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderLeftColor: policy.color, borderLeftWidth: 4,
                  ...(Platform.OS === 'web' && { boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.03)' } as any),
                }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.h4, { color: colors.text, marginBottom: 10, fontWeight: '800' }]}>{policy.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <CalendarClock size={14} color={colors.textTertiary} style={{ marginRight: 6 }} />
                          <Text style={[typography.micro, { color: colors.textSecondary, fontWeight: '500' }]}>{policy.startDate} - {policy.endDate}</Text>
                        </View>
                        <View style={{ backgroundColor: `${policy.color}15`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: `${policy.color}30` }}>
                          <Text style={[typography.micro, { color: policy.color, fontWeight: '800', fontSize: 10 }]}>{policy.status === 'ACTIVE' ? 'HIỆU LỰC' : 'NHÁP'}</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={20} color={colors.textTertiary} />
                  </View>
                  
                  <View style={{ marginTop: 18, paddingTop: 18, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', gap: 10 }}>
                    {policy.rules.map((r, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <CheckCircle2 size={14} color={policy.color} style={{ marginRight: 10 }} />
                        <Text style={[typography.body, { color: colors.textSecondary, fontSize: 14 }]}>{r}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Right Column: Info Panel */}
        <View style={{ flex: 1 }}>
          <View style={[styles.sectionCard, isDark ? styles.glassCardDark : styles.glassCardLight, Platform.OS === 'web' && styles.glassEffect as any, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: isDark ? 'rgba(16,185,129,0.08)' : '#ecfdf5', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
              <Percent size={36} color="#10b981" />
            </View>
            <Text style={[typography.h3, { color: colors.text, marginBottom: 12, textAlign: 'center', fontWeight: '800' }]}>Chính sách Bán hàng</Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, lineHeight: 22 }]}>
              Chọn một chính sách bên trái để xem chi tiết các điều khoản, tiến độ thanh toán và đối tượng áp dụng.
            </Text>
            <SGButton title="Xem tài liệu hướng dẫn" variant="outline" style={{ marginTop: 32, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: isDesktop ? 40 : 20, paddingBottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  policyCard: { padding: 22, borderRadius: 16, borderWidth: 1 },
  sectionCard: { padding: 28, borderRadius: 20, flex: 1 },
  glassEffect: {
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', transition: 'transform 0.2s' } as any),
  },
  glassCardDark: { backgroundColor: 'rgba(30, 41, 59, 0.65)', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1, ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' } as any) },
  glassCardLight: { backgroundColor: 'rgba(255, 255, 255, 0.85)', borderColor: 'rgba(0, 0, 0, 0.04)', borderWidth: 1, ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)' } as any) },
});
