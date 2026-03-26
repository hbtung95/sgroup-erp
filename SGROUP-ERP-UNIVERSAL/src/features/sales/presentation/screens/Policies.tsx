/**
 * Policies — Chính sách bán hàng & nội quy
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { BookOpen, ChevronDown, ChevronUp, Shield, Gift, Clock, AlertTriangle, Users } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGPlanningSectionTitle } from '../../../../shared/ui/components';

type PolicySection = {
  id: string;
  title: string;
  icon: any;
  color: string;
  items: string[];
};

const policies: PolicySection[] = [
  {
    id: '1', title: 'Chính Sách Hoa Hồng', icon: Gift, color: '#22c55e',
    items: [
      '• Sales cá nhân: hoa hồng 1.5% – 2.5% tùy dự án',
      '• Team Lead: bonus 0.3% trên GMV toàn team',
      '• Sales Manager: bonus 0.15% trên GMV department',
      '• Điều kiện: giao dịch hoàn tất (ký HĐ + nhận cọc)',
      '• Thanh toán: cuối tháng sau kỳ chốt sổ',
    ],
  },
  {
    id: '2', title: 'Quy Tắc Ứng Xử', icon: Shield, color: '#3b82f6',
    items: [
      '• Luôn mặc đồng phục khi tiếp khách tại showroom',
      '• Không cam kết ngoài phạm vi chính sách chủ đầu tư',
      '• Bảo mật thông tin khách hàng tuyệt đối',
      '• Không tranh giành khách hàng giữa các Sales',
      '• Tuân thủ quy trình CRM: cập nhật đầy đủ nhật ký',
    ],
  },
  {
    id: '3', title: 'Chính Sách Chấm Công', icon: Clock, color: '#f59e0b',
    items: [
      '• Giờ làm việc: 8:30 – 17:30 (thứ 2 – thứ 6)',
      '• Trực showroom cuối tuần: xoay ca theo lịch team',
      '• Đi trễ > 15 phút: tính 0.5 ngày nghỉ không phép',
      '• Tổng nghỉ phép: 12 ngày/năm (sau thử việc)',
      '• Check-in qua app: yêu cầu GPS tại địa điểm làm việc',
    ],
  },
  {
    id: '4', title: 'Tuân Thủ Pháp Luật', icon: AlertTriangle, color: '#ef4444',
    items: [
      '• Tuân thủ Luật Kinh doanh BĐS 2023',
      '• Không thu tiền mặt từ khách — mọi giao dịch qua tài khoản công ty',
      '• Hợp đồng đặt cọc phải có chữ ký Giám đốc hoặc người được ủy quyền',
      '• Lưu trữ chứng từ gốc tối thiểu 5 năm',
      '• Báo cáo vi phạm: hotline nội bộ 1900-xxxx',
    ],
  },
  {
    id: '5', title: 'Quy Định Team', icon: Users, color: '#8b5cf6',
    items: [
      '• Họp team hàng tuần: thứ 2, 9:00 – 9:30',
      '• Báo cáo hoạt động hàng ngày trước 18:00',
      '• Chia sẻ leads mới trong 24h qua nhóm Zalo/Teams',
      '• Target cá nhân: do Team Lead phân bổ từ target team',
      '• Review hiệu suất: cuối mỗi tháng với Team Lead',
    ],
  },
];

export function Policies() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 0,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 4 }}>NỘI QUY & QUY ĐỊNH</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Chính Sách Bán Hàng</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, marginTop: 8 }}>
            Cập nhật lần cuối: 01/03/2026 • Phiên bản 2.1
          </Text>
        </View>

        {/* Accordion List */}
        <View style={{ gap: 12 }}>
          {policies.map(section => {
            const isExpanded = expandedId === section.id;
            const SectionIcon = section.icon;
            return (
              <View key={section.id} style={cardStyle}>
                <TouchableOpacity
                  onPress={() => setExpandedId(isExpanded ? null : section.id)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 24, gap: 16,
                    backgroundColor: isExpanded ? (isDark ? `${section.color}10` : `${section.color}08`) : 'transparent',
                  }}
                >
                  <View style={{
                    width: 44, height: 44, borderRadius: 14,
                    backgroundColor: isDark ? `${section.color}20` : `${section.color}15`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SectionIcon size={22} color={section.color} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 17, fontWeight: '800', color: cText }}>{section.title}</Text>
                  {isExpanded
                    ? <ChevronUp size={20} color={cSub} />
                    : <ChevronDown size={20} color={cSub} />
                  }
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8, gap: 12, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                    {section.items.map((item, idx) => (
                      <Text key={idx} style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 24 }}>
                        {item}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
