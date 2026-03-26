import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { Plus, Save, History, Calendar, PhoneCall, TrendingUp, Users, Presentation, Target, BarChart2, ArrowRight, Filter, Pencil, Trash2, X, Check } from 'lucide-react-native';
import { SGButton, SGPlanningSectionTitle, SGPlanningNumberField, SGTable, SGStatCard } from '../../../../shared/ui/components';
import { useSalesStore } from '../../store/useSalesStore';
import { useActivityFilter, ActivityPeriod } from '../../hooks/useActivityFilter';
import { ActivityChart } from '../../components/charts/ActivityChart';
import type { SalesRole } from '../../SalesSidebar';
import type { ActivityEntry } from '../../store/useSalesStore';

const PERIOD_TABS: { label: string, value: ActivityPeriod }[] = [
  { label: 'Ngày', value: 'DAY' },
  { label: 'Tuần', value: 'WEEK' },
  { label: 'Tháng', value: 'MONTH' },
  { label: 'Quý', value: 'QUARTER' },
  { label: 'Năm', value: 'YEAR' },
  { label: 'Tuỳ chọn', value: 'CUSTOM' },
];

// Helper to format date for display in the picker
function formatDateInput(d: Date | null): string {
  if (!d) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateInput(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function ActivityLog({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isWideScreen = Platform.OS === 'web' && windowWidth >= 900;
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const isDirector = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const isLeader = userRole === 'team_lead' || userRole === 'sales_manager';
  const isSales = !isDirector && !isLeader;
  const scopeLabel = isDirector ? 'TOÀN BỘ PHÒNG KINH DOANH' : isLeader ? 'NHẬT KÝ TEAM' : 'BÁO CÁO HOẠT ĐỘNG';

  const { addActivity, updateActivity, deleteActivity } = useSalesStore();
  const {
    period, setPeriod,
    customFrom, setCustomFrom, customTo, setCustomTo,
    totals, chartData, rawActivities,
  } = useActivityFilter();

  // Form states
  const [postsCount, setPostsCount] = useState(0);
  const [callsCount, setCallsCount] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [meetingsMade, setMeetingsMade] = useState(0);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPosts, setEditPosts] = useState(0);
  const [editCalls, setEditCalls] = useState(0);
  const [editLeads, setEditLeads] = useState(0);
  const [editMeetings, setEditMeetings] = useState(0);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSave = () => {
    if (postsCount === 0 && callsCount === 0 && newLeads === 0 && meetingsMade === 0) {
      alert('Vui lòng nhập ít nhất một hoạt động!');
      return;
    }
    addActivity({ postsCount, callsCount, newLeads, meetingsMade });
    setPostsCount(0);
    setCallsCount(0);
    setNewLeads(0);
    setMeetingsMade(0);
    alert('✅ Đã lưu nhật ký thành công!');
  };

  const startEdit = useCallback((activity: ActivityEntry) => {
    setEditingId(activity.id);
    setEditPosts(activity.postsCount);
    setEditCalls(activity.callsCount);
    setEditLeads(activity.newLeads);
    setEditMeetings(activity.meetingsMade);
    setDeletingId(null);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const confirmEdit = useCallback(() => {
    if (editingId) {
      updateActivity(editingId, {
        postsCount: editPosts,
        callsCount: editCalls,
        newLeads: editLeads,
        meetingsMade: editMeetings,
      });
      setEditingId(null);
    }
  }, [editingId, editPosts, editCalls, editLeads, editMeetings, updateActivity]);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
    setEditingId(null);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deletingId) {
      deleteActivity(deletingId);
      setDeletingId(null);
    }
  }, [deletingId, deleteActivity]);

  const cancelDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

  // Build columns dynamically to support inline editing
  const ACTIVITY_COLUMNS = [
    { key: 'date', title: 'THỜI GIAN', width: 180, render: (v: string) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Calendar size={14} color="#94a3b8" />
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b' }}>
          {new Date(v).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </Text>
      </View>
    )},
    { key: 'postsCount', title: 'BÀI ĐĂNG', width: 100, align: 'center' as const, render: (v: number, row: any) => (
      editingId === row.id ? (
        <EditableCell value={editPosts} onChange={setEditPosts} color="#3b82f6" bgColor="#eff6ff" />
      ) : (
        <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#3b82f6' }}>{v}</Text>
        </View>
      )
    )},
    { key: 'callsCount', title: 'CUỘC GỌI', width: 100, align: 'center' as const, render: (v: number, row: any) => (
      editingId === row.id ? (
        <EditableCell value={editCalls} onChange={setEditCalls} color="#a855f7" bgColor="#faf5ff" />
      ) : (
        <View style={{ backgroundColor: '#faf5ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#a855f7' }}>{v}</Text>
        </View>
      )
    )},
    { key: 'newLeads', title: 'KHQT', width: 100, align: 'center' as const, render: (v: number, row: any) => (
      editingId === row.id ? (
        <EditableCell value={editLeads} onChange={setEditLeads} color="#22c55e" bgColor="#f0fdf4" />
      ) : (
        <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#22c55e' }}>{v}</Text>
        </View>
      )
    )},
    { key: 'meetingsMade', title: 'HẸN GẶP', width: 100, align: 'center' as const, render: (v: number, row: any) => (
      editingId === row.id ? (
        <EditableCell value={editMeetings} onChange={setEditMeetings} color="#f59e0b" bgColor="#fffbeb" />
      ) : (
        <View style={{ backgroundColor: '#fffbeb', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#f59e0b' }}>{v}</Text>
        </View>
      )
    )},
    { key: 'id', title: '', width: 120, align: 'center' as const, render: (_v: string, row: any) => (
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        {editingId === row.id ? (
          <>
            <TouchableOpacity
              onPress={confirmEdit}
              activeOpacity={0.7}
              style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: '#f0fdf4',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Check size={16} color="#22c55e" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={cancelEdit}
              activeOpacity={0.7}
              style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          </>
        ) : deletingId === row.id ? (
          <>
            <TouchableOpacity
              onPress={confirmDelete}
              activeOpacity={0.7}
              style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: '#fef2f2',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Check size={16} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={cancelDelete}
              activeOpacity={0.7}
              style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => startEdit(row)}
              activeOpacity={0.7}
              style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: isDark ? 'rgba(168,85,247,0.1)' : '#faf5ff',
                alignItems: 'center', justifyContent: 'center',
                ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.15s ease' } : {}),
              }}
            >
              <Pencil size={15} color="#a855f7" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(row.id)}
              activeOpacity={0.7}
              style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                alignItems: 'center', justifyContent: 'center',
                ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.15s ease' } : {}),
              }}
            >
              <Trash2 size={15} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}
      </View>
    )},
  ];

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.6)' : 'rgba(255,255,255,0.85)',
    borderRadius: 28,
    padding: 32,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(40px)',
      boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.04)',
    } : {}),
  };

  const dateInputStyle: any = {
    fontSize: 14,
    fontWeight: '600',
    color: cText,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    minWidth: 140,
    textAlign: 'center',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  };

  const periodLabel = PERIOD_TABS.find(t => t.value === period)?.label || '';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: 120, gap: 20 }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 18,
              backgroundColor: isDark ? 'rgba(168,85,247,0.12)' : '#faf5ff',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={26} color="#a855f7" />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#a855f7', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                {scopeLabel}
              </Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>
                {isDirector ? 'Tổng Quan Hoạt Động' : isLeader ? 'Hoạt Động Team' : 'Nhật Ký Tác Nghiệp'}
              </Text>
            </View>
          </View>

          {/* ── Period Tabs ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <View style={{
              flexDirection: 'row',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
              borderRadius: 14, padding: 3,
            }}>
              {PERIOD_TABS.map(tab => {
                const active = period === tab.value;
                return (
                  <TouchableOpacity key={tab.value} onPress={() => setPeriod(tab.value)} activeOpacity={0.7} style={{
                    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 11,
                    backgroundColor: active ? (isDark ? '#a855f7' : '#fff') : 'transparent',
                    ...(Platform.OS === 'web' && active && !isDark ? { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } : {}),
                  }}>
                    <Text style={{
                      fontSize: 13, fontWeight: '700',
                      color: active ? (isDark ? '#fff' : '#0f172a') : '#94a3b8',
                    }}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Custom Date Range Row (visible only when CUSTOM) ── */}
        {period === 'CUSTOM' && (
          <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, flexWrap: 'wrap' }]}>
            <Filter size={18} color="#a855f7" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>Từ:</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={formatDateInput(customFrom)}
                onChange={(e: any) => setCustomFrom(parseDateInput(e.target.value))}
                style={{
                  fontSize: 14, fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b',
                  padding: '8px 14px', borderRadius: 12,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  outline: 'none', minWidth: 150,
                }}
              />
            ) : (
              <TextInput
                placeholder="YYYY-MM-DD"
                value={formatDateInput(customFrom)}
                onChangeText={t => setCustomFrom(parseDateInput(t))}
                style={dateInputStyle}
              />
            )}
            <ArrowRight size={16} color="#94a3b8" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>Đến:</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={formatDateInput(customTo)}
                onChange={(e: any) => setCustomTo(parseDateInput(e.target.value))}
                style={{
                  fontSize: 14, fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b',
                  padding: '8px 14px', borderRadius: 12,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  outline: 'none', minWidth: 150,
                }}
              />
            ) : (
              <TextInput
                placeholder="YYYY-MM-DD"
                value={formatDateInput(customTo)}
                onChangeText={t => setCustomTo(parseDateInput(t))}
                style={dateInputStyle}
              />
            )}
          </View>
        )}

        {/* ── KPI Summary Cards ── */}
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Bài Đăng', value: totals.postsCount, icon: <Target size={24} color="#3b82f6" strokeWidth={2} />, color: '#3b82f6' },
            { label: 'Tổng Cuộc Gọi', value: totals.callsCount, icon: <PhoneCall size={24} color="#a855f7" strokeWidth={2} />, color: '#a855f7' },
            { label: 'Khách Hàng Quan Tâm', value: totals.newLeads, icon: <Users size={24} color="#22c55e" strokeWidth={2} />, color: '#22c55e' },
            { label: 'Hẹn Gặp', value: totals.meetingsMade, icon: <Presentation size={24} color="#f59e0b" strokeWidth={2} />, color: '#f59e0b' },
          ].map((card, i) => (
            <View key={i} style={{ flex: 1, minWidth: 200 }}>
              <SGStatCard label={card.label} value={card.value} icon={card.icon} iconColor={card.color} />
            </View>
          ))}
        </View>

        {/* ── Chart ── */}
        <View style={[cardStyle, Platform.OS === 'web' ? { transition: 'box-shadow 0.3s ease', ':hover': { boxShadow: isDark ? '0 0 20px rgba(168,85,247,0.3)' : '0 12px 32px rgba(168,85,247,0.15)' } } as any : {}]}>
          <SGPlanningSectionTitle
            icon={BarChart2 as any}
            title={`Biểu Đồ Hoạt Động (${periodLabel})`}
            accent="#a855f7"
            badgeText="TRENDS"
          />
          <ActivityChart data={chartData} height={280} />
        </View>

        {/* ── Form + History Row ── */}
        <View style={{ flexDirection: isWideScreen ? 'row' : 'column', gap: 20 }}>

          {/* Input Form */}
          <View style={[cardStyle, { flex: 1 }]}>
            <SGPlanningSectionTitle
              icon={(editingId ? Pencil : Plus) as any}
              title={editingId ? 'Đang Chỉnh Sửa' : 'Thêm Nhật Ký Mới'}
              accent={editingId ? '#f59e0b' : '#a855f7'}
              style={{ marginBottom: 20 }}
            />
            <View style={{ gap: 16 }}>
              <SGPlanningNumberField value={postsCount} onChangeValue={setPostsCount} label="SỐ BÀI ĐĂNG" min={0} max={100} accent="#3b82f6" />
              <SGPlanningNumberField value={callsCount} onChangeValue={setCallsCount} label="SỐ CUỘC GỌI" min={0} max={500} accent="#a855f7" />
              <SGPlanningNumberField value={newLeads} onChangeValue={setNewLeads} label="SỐ KHÁCH HÀNG QUAN TÂM" min={0} max={100} accent="#22c55e" />
              <SGPlanningNumberField value={meetingsMade} onChangeValue={setMeetingsMade} label="SỐ HẸN GẶP" min={0} max={50} accent="#f59e0b" />
            </View>

            <View style={{ marginTop: 28 }}>
              <SGButton
                title="LƯU NHẬT KÝ"
                icon={Save as any}
                onPress={handleSave}
                variant="primary"
              />
            </View>
          </View>

          {/* History Table */}
          <View style={[cardStyle, { flex: 2 }]}>
            <SGPlanningSectionTitle icon={History as any} title="Lịch Sử Hoạt Động" accent="#8b5cf6" badgeText={`${rawActivities.length} MỤC`} style={{ marginBottom: 20 }} />

            {/* Delete confirmation banner */}
            {deletingId && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                borderRadius: 14, padding: 14, marginBottom: 16,
                borderWidth: 1, borderColor: isDark ? 'rgba(239,68,68,0.2)' : '#fecaca',
              }}>
                <Trash2 size={18} color="#ef4444" />
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#ef4444' }}>
                  Xác nhận xoá nhật ký này? Nhấn ✓ để xoá hoặc ✗ để huỷ.
                </Text>
              </View>
            )}

            {rawActivities.length > 0 ? (
              <SGTable
                columns={ACTIVITY_COLUMNS}
                data={rawActivities}
                onRowPress={() => {}}
                style={{ borderWidth: 0, backgroundColor: 'transparent' }}
              />
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <Calendar size={56} color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#94a3b8' }}>Chưa có hoạt động nào trong kỳ này</Text>
                <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Hãy thêm nhật ký mới ở khung bên trái</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Inline editable cell for the table ──
function EditableCell({ value, onChange, color, bgColor }: { value: number; onChange: (v: number) => void; color: string; bgColor: string }) {
  return (
    <View style={{ alignSelf: 'center' }}>
      {Platform.OS === 'web' ? (
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e: any) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          style={{
            width: 60, textAlign: 'center',
            fontSize: 14, fontWeight: 900, color,
            backgroundColor: bgColor,
            border: `2px solid ${color}`,
            borderRadius: 10, padding: '3px 6px',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: `0 0 0 2px ${color}33`,
          }}
          onFocus={(e: any) => e.target.style.boxShadow = `0 0 0 4px ${color}66`}
          onBlur={(e: any) => e.target.style.boxShadow = `0 0 0 2px ${color}33`}
        />
      ) : (
        <TextInput
          value={String(value)}
          onChangeText={t => onChange(Math.max(0, parseInt(t) || 0))}
          keyboardType="numeric"
          style={{
            width: 60, textAlign: 'center',
            fontSize: 14, fontWeight: '900', color,
            backgroundColor: bgColor,
            borderWidth: 2, borderColor: color,
            borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3,
          }}
        />
      )}
    </View>
  );
}
