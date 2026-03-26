/**
 * Appointments — Lịch hẹn khách hàng cho NVKD
 * Connected to useAppointments hook with real CRUD
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Modal, TextInput } from 'react-native';
import {
  Calendar, Clock, MapPin, Phone, CheckCircle2, XCircle, AlertCircle, Plus, X
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { SGPlanningSectionTitle } from '../../../../shared/ui/components';
import { useAppointments, AppointmentEntry, AppointmentStatus, AppointmentType } from '../../hooks/useAppointments';
import type { SalesRole } from '../../SalesSidebar';

const STATUS_CFG: Record<AppointmentStatus, { label: string; color: string; icon: any }> = {
  SCHEDULED:  { label: 'SẮP TỚI',    color: '#3b82f6', icon: Clock },
  CONFIRMED:  { label: 'ĐÃ XÁC NHẬN', color: '#22c55e', icon: CheckCircle2 },
  COMPLETED:  { label: 'HOÀN THÀNH',  color: '#16a34a', icon: CheckCircle2 },
  CANCELLED:  { label: 'ĐÃ HỦY',     color: '#ef4444', icon: XCircle },
  NO_SHOW:    { label: 'KHÔNG ĐẾN',   color: '#f59e0b', icon: AlertCircle },
};

const TYPE_CONFIG: Record<AppointmentType, { label: string; color: string }> = {
  MEETING:    { label: 'TƯ VẤN', color: '#3b82f6' },
  SITE_VISIT: { label: 'XEM NHÀ MẪU', color: '#8b5cf6' },
  FOLLOW_UP:  { label: 'FOLLOW UP', color: '#f59e0b' },
  SIGNING:    { label: 'KÝ CỌC', color: '#22c55e' },
};

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function Appointments({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const today = new Date();

  const isDirector = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const isLeader = userRole === 'team_lead' || userRole === 'sales_manager';
  const scopeLabel = isDirector ? 'LỊCH HẸN TOÀN BỘ' : isLeader ? 'LỊCH HẸN TEAM' : 'LỊCH HẸN CỦA TÔI';

  const { appointments, createAppointment, updateAppointment, cancelAppointment } = useAppointments();

  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newApt, setNewApt] = useState({
    customerName: '', customerPhone: '', projectName: '', type: 'MEETING' as AppointmentType,
    scheduledAt: '', duration: '60', location: '', note: '',
  });

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i + 1);
    return d;
  });

  const todayAppointments = appointments
    .filter(a => {
      const d = new Date(a.scheduledAt);
      return d.getDate() === selectedDay && d.getMonth() === today.getMonth();
    })
    .filter(a => a.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const scheduledCount = appointments.filter(a => a.status === 'SCHEDULED').length;

  const handleCreate = async () => {
    if (!newApt.customerName || !newApt.scheduledAt) return;
    await createAppointment({
      staffId: 'me',
      staffName: 'Tôi',
      customerName: newApt.customerName,
      customerPhone: newApt.customerPhone,
      projectName: newApt.projectName,
      type: newApt.type,
      scheduledAt: newApt.scheduledAt,
      duration: parseInt(newApt.duration) || 60,
      location: newApt.location,
      note: newApt.note,
      status: 'SCHEDULED',
    });
    setNewApt({ customerName: '', customerPhone: '', projectName: '', type: 'MEETING', scheduledAt: '', duration: '60', location: '', note: '' });
    setShowCreateModal(false);
  };

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.6)' : 'rgba(255,255,255,0.85)', borderRadius: 28,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.04)' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 4 }}>{scopeLabel}</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>
              Hôm Nay, {today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} style={{
            flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 24,
            borderRadius: 16, backgroundColor: '#8b5cf6',
            ...(Platform.OS === 'web' ? { boxShadow: '0 4px 14px rgba(139,92,246,0.3)' } : {}),
          } as any}>
            <Plus size={18} color="#fff" strokeWidth={3} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Tạo Hẹn</Text>
          </TouchableOpacity>
        </View>

        {/* Week Calendar Row */}
        <View style={[cardStyle, { flexDirection: 'row', padding: 8, borderRadius: 20 }]}>
          {weekDates.map((date, i) => {
            const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
            const isSelected = date.getDate() === selectedDay;
            return (
              <TouchableOpacity key={i} onPress={() => setSelectedDay(date.getDate())}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16, overflow: 'hidden',
                }}>
                {isSelected && (
                   <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                     <LinearGradient colors={['#a78bfa', '#8b5cf6']} style={{ flex: 1 }} />
                   </View>
                )}
                <Text style={{ fontSize: 12, fontWeight: '800', color: isSelected ? '#ede9fe' : '#94a3b8', marginBottom: 6, zIndex: 1 }}>
                  {DAYS[(i + 1) % 7]}
                </Text>
                <Text style={{ fontSize: 22, fontWeight: '900', color: isSelected ? '#fff' : (isToday ? '#8b5cf6' : cText), zIndex: 1 }}>
                  {date.getDate()}
                </Text>
                {isToday && !isSelected && (
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#8b5cf6', marginTop: 6 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary Stats */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[
            { label: 'Tổng hẹn', value: appointments.filter(a => a.status !== 'CANCELLED').length, color: '#3b82f6' },
            { label: 'Đã xác nhận', value: confirmedCount, color: '#22c55e' },
            { label: 'Sắp tới', value: scheduledCount, color: '#f59e0b' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: s.color }}>{s.value}</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: cSub, marginTop: 4 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={[cardStyle, { padding: 28 }]}>
          <SGPlanningSectionTitle icon={Calendar} title="Lịch Trình" accent="#8b5cf6" badgeText="SCHEDULE" style={{ marginBottom: 24 }} />

          <View style={{ gap: 0 }}>
            {todayAppointments.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: cSub }}>Không có lịch hẹn ngày này</Text>
              </View>
            )}
            {todayAppointments.map((apt, index) => {
              const cfg = STATUS_CFG[apt.status] || STATUS_CFG.SCHEDULED;
              const StatusIcon = cfg.icon;
              const typeCfg = TYPE_CONFIG[apt.type] || TYPE_CONFIG.MEETING;
              const isLast = index === todayAppointments.length - 1;
              const time = new Date(apt.scheduledAt);
              const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

              return (
                <View key={apt.id} style={{ flexDirection: 'row', gap: 16, minHeight: 80 }}>
                  <View style={{ width: 70, paddingTop: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{timeStr}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>{apt.duration} phút</Text>
                  </View>

                  <View style={{ alignItems: 'center', width: 28, position: 'relative' }}>
                    <View style={{
                      width: 18, height: 18, borderRadius: 9, top: 4,
                      backgroundColor: cfg.color, borderWidth: 4, borderColor: isDark ? '#1e293b' : '#fff',
                      ...(Platform.OS === 'web' ? { boxShadow: `0 0 12px ${cfg.color}80, 0 0 0 4px ${cfg.color}20` } : {}),
                    } as any} />
                    {!isLast && (
                      <LinearGradient colors={[`${cfg.color}80`, 'transparent', isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1']} style={{ flex: 1, width: 2, minHeight: 60, marginVertical: 6 }} />
                    )}
                  </View>

                  <View style={{
                    flex: 1, marginBottom: 20, padding: 22, borderRadius: 20,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
                    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                    borderLeftWidth: 6, borderLeftColor: typeCfg.color,
                    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease', cursor: 'pointer', ':hover': { transform: 'translateX(4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' } } as any : {})
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{apt.customerName}</Text>
                          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: `${typeCfg.color}15` }}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: typeCfg.color }}>{typeCfg.label}</Text>
                          </View>
                          {(isDirector || isLeader) && apt.staffName && (
                            <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: cSub }}>{apt.staffName}</Text>
                            </View>
                          )}
                          <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: `${typeCfg.color}15` }}>
                            <Text style={{ fontSize: 10, fontWeight: '800', color: typeCfg.color }}>{typeCfg.label}</Text>
                          </View>
                        </View>
                        {apt.projectName && <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6' }}>{apt.projectName}</Text>}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: isDark ? `${cfg.color}20` : `${cfg.color}10` }}>
                        <StatusIcon size={12} color={cfg.color} />
                        <Text style={{ fontSize: 10, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      {apt.location && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <MapPin size={13} color={cSub} />
                          <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>{apt.location}</Text>
                        </View>
                      )}
                      {apt.customerPhone && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <Phone size={13} color={cSub} />
                          <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>{apt.customerPhone}</Text>
                        </View>
                      )}
                    </View>

                    {apt.note && (
                      <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#fbbf24' : '#d97706', marginTop: 10, fontStyle: 'italic' }}>
                        📝 {apt.note}
                      </Text>
                    )}

                    {/* Action Buttons */}
                    {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                        {apt.status === 'SCHEDULED' && (
                          <TouchableOpacity onPress={() => updateAppointment(apt.id, { status: 'CONFIRMED' })} style={{
                            flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6,
                            borderRadius: 10, backgroundColor: '#22c55e15', borderWidth: 1, borderColor: '#22c55e30',
                          }}>
                            <CheckCircle2 size={12} color="#22c55e" />
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#22c55e' }}>Xác Nhận</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => updateAppointment(apt.id, { status: 'COMPLETED' })} style={{
                          flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6,
                          borderRadius: 10, backgroundColor: '#3b82f615', borderWidth: 1, borderColor: '#3b82f630',
                        }}>
                          <CheckCircle2 size={12} color="#3b82f6" />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#3b82f6' }}>Hoàn Thành</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => cancelAppointment(apt.id)} style={{
                          flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6,
                          borderRadius: 10, backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef444430',
                        }}>
                          <XCircle size={12} color="#ef4444" />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#ef4444' }}>Hủy</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <Modal transparent animationType="fade" visible onRequestClose={() => setShowCreateModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' } as any}>
            <View style={[cardStyle, { width: '90%', maxWidth: 520, padding: 32, borderRadius: 28 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <Text style={{ fontSize: 22, fontWeight: '900', color: cText }}>Tạo Lịch Hẹn</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} color={cSub} />
                </TouchableOpacity>
              </View>

              {/* Type Selector */}
              <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Loại Hẹn</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {(Object.keys(TYPE_CONFIG) as AppointmentType[]).map(type => {
                  const tc = TYPE_CONFIG[type];
                  const isActive = newApt.type === type;
                  return (
                    <TouchableOpacity key={type} onPress={() => setNewApt(p => ({ ...p, type }))} style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                      backgroundColor: isActive ? tc.color : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                      borderWidth: 1, borderColor: isActive ? tc.color : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                    }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: isActive ? '#fff' : cSub }}>{tc.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {[
                { key: 'customerName', label: 'Khách Hàng *', placeholder: 'Nguyễn Văn A' },
                { key: 'customerPhone', label: 'SĐT', placeholder: '0901 234 567' },
                { key: 'projectName', label: 'Dự Án', placeholder: 'Vinhomes Ocean Park' },
                { key: 'scheduledAt', label: 'Ngày Giờ (ISO) *', placeholder: '2026-03-12T10:00:00' },
                { key: 'duration', label: 'Thời Lượng (phút)', placeholder: '60' },
                { key: 'location', label: 'Địa Điểm', placeholder: 'Văn phòng SGroup' },
                { key: 'note', label: 'Ghi Chú', placeholder: 'Thông tin thêm...' },
              ].map(f => (
                <View key={f.key} style={{ marginBottom: 14 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{f.label}</Text>
                  <TextInput
                    value={(newApt as any)[f.key]?.toString() || ''}
                    onChangeText={v => setNewApt(prev => ({ ...prev, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor="#94a3b8"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                      borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
                      fontSize: 14, fontWeight: '600', color: cText,
                      borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                      outlineStyle: 'none',
                    } as any}
                  />
                </View>
              ))}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <TouchableOpacity onPress={() => setShowCreateModal(false)} style={{
                  flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cSub }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreate} style={{
                  flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8b5cf6',
                }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Tạo Hẹn</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
