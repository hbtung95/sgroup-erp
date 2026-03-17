/**
 * TimekeepingScreen — HR Time & Attendance Management
 * Features: Daily overview, employee attendance list, leave requests
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, CheckCircle, AlertCircle, Calendar, Users, XCircle, Search } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import type { HRRole } from '../HRSidebar';
import { useAttendance } from '../hooks/useHR';

const fmt = (n: number) => n.toLocaleString('vi-VN');

// Status config for attendance display

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  ON_TIME: { bg: '#dcfce7', text: '#16a34a', label: 'Đúng giờ' },
  LATE: { bg: '#fef3c7', text: '#d97706', label: 'Đi trễ' },
  ABSENT: { bg: '#fee2e2', text: '#dc2626', label: 'Vắng mặt' },
};

export function TimekeepingScreen({ userRole }: { userRole?: HRRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const today = new Date();
  const currentDate = today.toLocaleDateString('vi-VN');
  const todayStr = today.toISOString().split('T')[0];

  // Fetch real attendance from API
  const { data: rawAttendance, isLoading } = useAttendance({ date: todayStr });

  const safeAttendance = Array.isArray(rawAttendance) ? rawAttendance : (rawAttendance as any)?.data ?? [];

  // Transform API data for table display
  const attendanceData = safeAttendance.map((a: any) => {
    const fmtTime = (d: string | null) => d ? new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—';
    const statusMap: Record<string, string> = { PRESENT: 'ON_TIME', LATE: 'LATE', ABSENT: 'ABSENT', HALF_DAY: 'LATE', DAY_OFF: 'ABSENT' };
    return {
      id: a.id,
      code: a.employee?.employeeCode || '',
      name: a.employee?.fullName || '',
      dept: a.employee?.department?.name || '',
      shift: 'Hành chính',
      checkIn: fmtTime(a.checkInTime),
      checkOut: fmtTime(a.checkOutTime),
      status: statusMap[a.status] || a.status,
    };
  });

  const presentCount = attendanceData.filter((a: any) => a.status === 'ON_TIME').length;
  const lateCount = attendanceData.filter((a: any) => a.status === 'LATE').length;
  const absentCount = attendanceData.filter((a: any) => a.status === 'ABSENT').length;

  const COLUMNS: any = [
    { key: 'name', title: 'NHÂN VIÊN', flex: 1.5, render: (v: any, row: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{row.code} • {row.dept}</Text>
      </View>
    ) },
    { key: 'shift', title: 'CA LÀM VIỆC', flex: 1, render: (v: any) => <Text style={{ fontSize: 12, color: cText }}>{v}</Text> },
    { key: 'checkIn', title: 'CHECK IN', flex: 1, render: (v: any, row: any) => (
      <Text style={{ fontSize: 13, fontWeight: '800', color: row.status === 'LATE' ? '#d97706' : cText }}>{v}</Text>
    ) },
    { key: 'checkOut', title: 'CHECK OUT', flex: 1, render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '600', color: cText }}>{v}</Text> },
    { key: 'status', title: 'TRẠNG THÁI', flex: 1, align: 'center', render: (v: any) => {
      const s = STATUS_CONFIG[v];
      return (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: s?.bg || '#f1f5f9', alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: s?.text || '#64748b' }}>{s?.label.toUpperCase() || v}</Text>
        </View>
      );
    } },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: '#3b82f620', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} color="#3b82f6" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Chấm công & Điểm danh</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Hôm nay: {currentDate}</Text>
            </View>
          </View>
          <TouchableOpacity style={{
            backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
            ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
          }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>XUẤT BẢNG CÔNG</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'TỔNG ĐIỂM DANH', val: attendanceData.length, icon: Users, color: '#3b82f6' },
            { label: 'ĐÚNG GIờ', val: presentCount, icon: CheckCircle, color: '#22c55e' },
            { label: 'ĐI TRỄ', val: lateCount, icon: AlertCircle, color: '#f59e0b' },
            { label: 'VẮNG MẶT', val: absentCount, icon: XCircle, color: '#ef4444' },
          ].map((s, i) => (
            <View key={i} style={{
              flex: 1, minWidth: 160, padding: 20, borderRadius: 20,
              backgroundColor: cardBg, borderWidth: 1, borderColor,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={18} color={s.color} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: cSub, flex: 1, flexWrap: 'wrap' }}>{s.label}</Text>
              </View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: cText }}>{s.val}</Text>
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
          <TouchableOpacity style={{
            paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
            backgroundColor: cardBg, borderWidth: 1, borderColor,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>Phòng ban: Tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Table */}
        <SGCard variant="glass" noPadding>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={{ color: cSub, marginTop: 12, fontSize: 13 }}>Đang tải dữ liệu chấm công...</Text>
            </View>
          ) : (
            <SGTable 
              columns={COLUMNS} 
              data={attendanceData} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          )}
        </SGCard>

      </ScrollView>
    </View>
  );
}
