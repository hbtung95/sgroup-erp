/**
 * TimekeepingScreen — HR Time & Attendance Management
 * Features: Daily overview, employee attendance list, leave requests
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Clock, CheckCircle, AlertCircle, Calendar, Users, XCircle, Search, LayoutGrid, List, CalendarDays, ArrowRight, Grid, Eye } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [mainTab, setMainTab] = useState<'attendance' | 'schedule'>('attendance');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
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

  const MOCK_SCHEDULE = [
    { name: 'Nguyễn Văn A', role: 'Nhân viên kinh doanh', shifts: [ { day: 0, type: 'S1' }, { day: 1, type: 'S1' }, { day: 2, type: 'S2' }, { day: 3, type: 'S1' }, { day: 4, type: 'S3' } ] },
    { name: 'Trần Thị B', role: 'Trưởng phòng Marketing', shifts: [ { day: 0, type: 'S2' }, { day: 1, type: 'S2' }, { day: 3, type: 'S1' }, { day: 4, type: 'S1' }, { day: 5, type: 'S1' } ] },
    { name: 'Lê C', role: 'IT Support', shifts: [ { day: 1, type: 'S3' }, { day: 2, type: 'S3' }, { day: 4, type: 'S2' }, { day: 5, type: 'S2' }, { day: 6, type: 'S1' } ] },
    { name: 'Phạm D', role: 'Kế toán', shifts: [ { day: 0, type: 'S1' }, { day: 1, type: 'S1' }, { day: 2, type: 'S1' }, { day: 3, type: 'S1' }, { day: 4, type: 'S1' } ] },
    { name: 'Đoàn E', role: 'Dự án', shifts: [ { day: 0, type: 'S3' }, { day: 2, type: 'S2' }, { day: 3, type: 'S2' }, { day: 5, type: 'S1' }, { day: 6, type: 'S2' } ] },
  ];
  const WEEK_DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  
  const SHIFTS = {
    'S1': { label: 'Sáng', bg: isDark ? 'rgba(59,130,246,0.2)' : '#eff6ff', color: '#3b82f6', border: 'rgba(59,130,246,0.4)' },
    'S2': { label: 'Chiều', bg: isDark ? 'rgba(245,158,11,0.2)' : '#fef3c7', color: '#d97706', border: 'rgba(245,158,11,0.4)' },
    'S3': { label: 'Tối', bg: isDark ? 'rgba(139,92,246,0.2)' : '#f3e8ff', color: '#8b5cf6', border: 'rgba(139,92,246,0.4)' }
  };

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
        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
        </Animated.View>

        {/* Main Tabs Segmented Control */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={{ flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', padding: 6, borderRadius: 16, alignSelf: 'flex-start', marginTop: 8 }}>
          <TouchableOpacity onPress={() => setMainTab('attendance')} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: mainTab === 'attendance' ? (isDark ? '#3b82f6' : '#fff') : 'transparent', shadowOpacity: mainTab === 'attendance' ? 0.05 : 0, elevation: mainTab === 'attendance' ? 2 : 0, shadowColor: '#000', shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: mainTab === 'attendance' ? (isDark ? '#fff' : cText) : cSub }}>Điểm danh hôm nay</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMainTab('schedule')} style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: mainTab === 'schedule' ? (isDark ? '#3b82f6' : '#fff') : 'transparent', shadowOpacity: mainTab === 'schedule' ? 0.05 : 0, elevation: mainTab === 'schedule' ? 2 : 0, shadowColor: '#000', shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: mainTab === 'schedule' ? (isDark ? '#fff' : cText) : cSub }}>Xếp ca (Gantt Chart)</Text>
          </TouchableOpacity>
        </Animated.View>

        {mainTab === 'attendance' ? (
          <>
            {/* Stats Summary */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'TỔNG ĐIỂM DANH', val: attendanceData.length, icon: Users, color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'], shadow: '#3b82f6' },
            { label: 'ĐÚNG GIỜ', val: presentCount, icon: CheckCircle, color: '#22c55e', gradient: ['#10b981', '#059669'], shadow: '#10b981' },
            { label: 'ĐI TRỄ', val: lateCount, icon: AlertCircle, color: '#f59e0b', gradient: ['#f59e0b', '#d97706'], shadow: '#f59e0b' },
            { label: 'VẮNG MẶT', val: absentCount, icon: XCircle, color: '#ef4444', gradient: ['#ef4444', '#dc2626'], shadow: '#ef4444' },
          ].map((s, i) => (
            <LinearGradient
              key={i}
              colors={isDark ? ['rgba(30,41,59,0.7)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#f8fafc']}
              style={{
                flex: 1, minWidth: 200, padding: 24, borderRadius: 24,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                shadowColor: isDark ? '#000' : s.shadow, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 5,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <LinearGradient
                  colors={s.gradient as [string, string]} start={{x:0, y:0}} end={{x:1, y:1}}
                  style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: s.shadow, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width:0, height:4} }}
                >
                  <s.icon size={22} color="#fff" />
                </LinearGradient>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, flex: 1, letterSpacing: 0.5 }}>{s.label}</Text>
              </View>
              <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>{s.val}</Text>
            </LinearGradient>
          ))}
        </Animated.View>

        {/* ═══ Attendance Heatmap (Contribution Graph) ═══ */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ 
          padding: 24, borderRadius: 28, backgroundColor: isDark ? 'rgba(30,41,59,0.35)' : '#ffffff',
          borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
          shadowColor: '#000', shadowOpacity: isDark ? 0.2 : 0.05, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4,
          marginTop: 8
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ padding: 8, borderRadius: 10, backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#dcfce7' }}>
                <CalendarDays size={18} color="#10b981" />
              </View>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>Biểu đồ Chuyên cần (90 ngày)</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 2 }}>Tỷ lệ đi làm đúng giờ toàn công ty</Text>
              </View>
            </View>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6' }}>Phân tích chi tiết</Text>
              <ArrowRight size={14} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
            <View style={{ gap: 4 }}>
              {/* Generate 5 rows of 18 cols for ~90 days */}
              {new Array(5).fill(0).map((_, rIdx) => (
                <View key={rIdx} style={{ flexDirection: 'row', gap: 4 }}>
                  {new Array(18).fill(0).map((_, cIdx) => {
                    const rnd = Math.random();
                    const status = rnd > 0.95 ? 'absent' : rnd > 0.85 ? 'late' : 'present';
                    const bg = status === 'present' ? (isDark ? 'rgba(16,185,129,0.8)' : '#22c55e') :
                               status === 'late' ? (isDark ? 'rgba(245,158,11,0.8)' : '#f59e0b') :
                               (isDark ? 'rgba(239,68,68,0.8)' : '#ef4444');
                    return (
                      <Animated.View 
                        entering={FadeInDown.delay(300 + cIdx * 10 + rIdx * 20).duration(300)}
                        key={cIdx} 
                        style={{ 
                          width: 16, height: 16, borderRadius: 4, backgroundColor: bg,
                          opacity: status === 'present' ? (0.4 + Math.random() * 0.6) : 1 // vary green intensity
                        }} 
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>Thấp</Text>
            <View style={{ flexDirection: 'row', gap: 4 }}>
               {['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.4)', 'rgba(16,185,129,0.6)', 'rgba(16,185,129,0.8)', '#10b981'].map((c, i) => (
                 <View key={i} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c }} />
               ))}
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>Cao</Text>
            <View style={{ width: 1, height: 12, backgroundColor: borderColor, marginHorizontal: 4 }} />
            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
               <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#f59e0b' }} />
               <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>Trễ</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
               <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#ef4444' }} />
               <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>Vắng</Text>
            </View>
          </View>
        </Animated.View>

        {/* Table actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 }}>
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
        </Animated.View>

        {/* Content View */}
        {isLoading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ color: cSub, marginTop: 16, fontSize: 14, fontWeight: '600' }}>Đang tải dữ liệu chấm công...</Text>
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
              data={attendanceData} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          </Animated.View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            {attendanceData.length === 0 ? (
              <Text style={{ color: cSub, fontSize: 15, padding: 32, textAlign: 'center', width: '100%' }}>Chưa có người nào chấm công hôm nay.</Text>
            ) : null}
            {attendanceData.map((item: any, idx: number) => {
              const s = STATUS_CONFIG[item.status] || { bg: '#f1f5f9', text: '#64748b', label: item.status };
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
                    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', flex: 1 }}>
                      <LinearGradient
                        colors={isDark ? ['rgba(59,130,246,0.2)', 'rgba(59,130,246,0.05)'] : ['#eff6ff', '#dbeafe']}
                        style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(59,130,246,0.1)' }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#3b82f6' }}>{item.name.charAt(0)}</Text>
                      </LinearGradient>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: cText }} numberOfLines={1}>{item.name}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 2 }}>{item.code} • {item.dept}</Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: s.bg }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: s.text, letterSpacing: 0.5 }}>
                        {s.label.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ gap: 14, marginBottom: 8, paddingHorizontal: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center', flex: 1, padding: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                       <Text style={{ fontSize: 12, fontWeight: '700', color: cSub, textTransform: 'uppercase', marginBottom: 4 }}>Check In</Text>
                       <Text style={{ fontSize: 20, fontWeight: '900', color: item.status === 'LATE' ? '#f59e0b' : cText, fontVariant: ['tabular-nums'] }}>{item.checkIn}</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1, padding: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                       <Text style={{ fontSize: 12, fontWeight: '700', color: cSub, textTransform: 'uppercase', marginBottom: 4 }}>Check Out</Text>
                       <Text style={{ fontSize: 20, fontWeight: '900', color: cText, fontVariant: ['tabular-nums'] }}>{item.checkOut}</Text>
                    </View>
                  </View>
                  </LinearGradient>
                </Animated.View>
              );
            })}
          </View>
        )}
          </>
        ) : (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flex: 1, marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: cText, letterSpacing: -0.5 }}>Điều phối ca làm việc</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, marginTop: 4 }}>Tuần này (Dựa trên hệ thống gợi ý AI)</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                {Object.entries(SHIFTS).map(([k, v]) => (
                  <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: v.bg, borderWidth: 1, borderColor: v.border }} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>Ca {v.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ 
              backgroundColor: isDark ? 'rgba(30,41,59,0.35)' : '#ffffff',
              borderRadius: 24, borderWidth: 1, borderColor, 
              overflow: 'hidden', paddingBottom: 16,
              ...(Platform.OS === 'web' ? { 
                backdropFilter: 'blur(32px)', 
                WebkitBackdropFilter: 'blur(32px)',
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 12px 32px rgba(0,0,0,0.04)' 
              } : {}),
            }}>
              {/* Header Row */}
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                <View style={{ width: 220, padding: 16, justifyContent: 'center', borderRightWidth: 1, borderRightColor: borderColor }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 0.5 }}>Nhân viên</Text>
                </View>
                {WEEK_DAYS.map((day, dIdx) => (
                  <View key={dIdx} style={{ flex: 1, padding: 16, alignItems: 'center', borderRightWidth: dIdx < 6 ? 1 : 0, borderRightColor: borderColor }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: dIdx > 4 ? '#ef4444' : cText }}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Data Rows */}
              {MOCK_SCHEDULE.map((emp, idx) => (
                <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: borderColor, minHeight: 70 }}>
                  <View style={{ width: 220, padding: 16, justifyContent: 'center', borderRightWidth: 1, borderRightColor: borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : '#ffffff' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: cText }}>{emp.name}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: cSub, marginTop: 4 }}>{emp.role}</Text>
                  </View>
                  {WEEK_DAYS.map((_, dIdx) => {
                    const shift = emp.shifts.find(s => s.day === dIdx);
                    return (
                      <View key={dIdx} style={{ flex: 1, padding: 8, borderRightWidth: dIdx < 6 ? 1 : 0, borderRightColor: borderColor }}>
                        {shift && (
                          <Animated.View entering={FadeInDown.delay(100 + idx * 50 + dIdx * 20).springify()} style={{ 
                            flex: 1, backgroundColor: (SHIFTS as any)[shift.type].bg, 
                            borderWidth: 1, borderColor: (SHIFTS as any)[shift.type].border,
                            borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                            shadowColor: (SHIFTS as any)[shift.type].color, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2
                          }}>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: (SHIFTS as any)[shift.type].color }}>{(SHIFTS as any)[shift.type].label}</Text>
                          </Animated.View>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}
