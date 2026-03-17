/**
 * LeavesScreen — HR Leave Requests Management
 */
import React from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Search, CheckCircle, Clock, XCircle, FileText } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import { useLeaves } from '../hooks/useHR';

// Leave type display map
const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'Nghỉ phép năm',
  SICK: 'Nghỉ ốm',
  UNPAID: 'Nghỉ không lương',
  MATERNITY: 'Nghỉ thai sản',
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: '#dcfce7', text: '#16a34a', label: 'ĐÃ DUYỆT' },
  PENDING: { bg: '#fef3c7', text: '#d97706', label: 'CHỜ DUYỆT' },
  REJECTED: { bg: '#fee2e2', text: '#dc2626', label: 'TỪ CHỐI' },
};

export function LeavesScreen() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  // Fetch real leaves from API
  const { data: rawLeaves, isLoading } = useLeaves();
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');

  // Transform for table display
  const leavesData = (rawLeaves || []).map((l: any) => ({
    id: l.id,
    code: l.employee?.employeeCode || '',
    name: l.employee?.fullName || '',
    dept: '',
    type: LEAVE_TYPE_LABELS[l.leaveType] || l.leaveType,
    from: fmtDate(l.startDate),
    to: fmtDate(l.endDate),
    days: l.totalDays,
    status: l.status,
  }));

  const pendingCount = leavesData.filter((l: any) => l.status === 'PENDING').length;
  const approvedCount = leavesData.filter((l: any) => l.status === 'APPROVED').length;
  const rejectedCount = leavesData.filter((l: any) => l.status === 'REJECTED').length;

  const COLUMNS: any = [
    { key: 'name', title: 'NHÂN VIÊN', flex: 1.5, render: (v: any, row: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{row.dept}</Text>
      </View>
    ) },
    { key: 'type', title: 'LOẠI ĐƠN', flex: 1.2, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: cText }}>{v}</Text> },
    { key: 'time', title: 'THỜI GIAN', flex: 1.5, render: (_: any, row: any) => (
      <View>
        <Text style={{ fontSize: 12, color: cText }}>{row.from} - {row.to}</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#f59e0b', marginTop: 2 }}>{row.days} ngày</Text>
      </View>
    ) },
    { key: 'status', title: 'TRẠNG THÁI', flex: 1, align: 'center', render: (v: any) => {
      const s = STATUS_CONFIG[v];
      return (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: s.bg, alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: s.text }}>{s.label}</Text>
        </View>
      );
    } },
    { key: 'actions', title: '', flex: 0.5, align: 'right', render: () => (
      <TouchableOpacity style={{ padding: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#3b82f6' }}>Duyệt</Text>
      </TouchableOpacity>
    ) }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: '#f59e0b20', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={24} color="#f59e0b" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Quản lý Đơn từ</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Duyệt đơn xin phép, thai sản, công tác</Text>
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'CHỜ DUYỆT', val: String(pendingCount), icon: Clock, color: '#f59e0b' },
            { label: 'ĐÃ DUYỆT', val: String(approvedCount), icon: CheckCircle, color: '#10b981' },
            { label: 'TỪ CHỐI', val: String(rejectedCount), icon: XCircle, color: '#ef4444' },
          ].map((s, i) => (
            <View key={i} style={{
              flex: 1, minWidth: 200, padding: 22, borderRadius: 20,
              backgroundColor: cardBg, borderWidth: 1, borderColor,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={20} color={s.color} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: cSub, flex: 1 }}>{s.label}</Text>
              </View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>{s.val}</Text>
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
              <ActivityIndicator size="large" color="#f59e0b" />
              <Text style={{ color: cSub, marginTop: 12, fontSize: 13 }}>Đang tải đơn từ...</Text>
            </View>
          ) : (
            <SGTable 
              columns={COLUMNS} 
              data={leavesData} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          )}
        </SGCard>
      </ScrollView>
    </View>
  );
}
