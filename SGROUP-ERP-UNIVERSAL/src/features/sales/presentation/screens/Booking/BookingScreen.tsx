/**
 * SGROUP ERP — Booking Screen (Giữ Chỗ)
 * Data entry + KPI reporting page — similar pattern to ActivityLog
 * Workflow: Sales enters project + customer + booking count → "Gửi Phê Duyệt" → Admin approves
 * KPI rule: 1 customer with N bookings = 1 unique KPI booking (by phone)
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';
import { useAppTheme } from '../../../../../shared/theme/useAppTheme';
import {
  Plus, Send, History, Calendar, Ticket, Users, CheckCircle, Clock,
  BarChart2, ArrowRight, Filter, Pencil, Trash2, X, Check, XCircle,
  Building2, Phone, User, Hash, AlertTriangle, Search,
} from 'lucide-react-native';
import { SGButton, SGPlanningSectionTitle, SGPlanningNumberField, SGTable, SGStatCard } from '../../../../../shared/ui/components';
import { useSalesStore } from '../../../store/useSalesStore';
import {
  useApproveBooking,
  useCreateBooking,
  useDeleteBooking,
  useRejectBooking,
  useUpdateBooking,
  type BookingEntry,
} from '../../../hooks/useBookings';
import { useGetProjects } from '../../../hooks/useSalesOps';
import { useBookingFilter, BookingPeriod } from '../../../hooks/useBookingFilter';
import { BookingChart } from '../../../components/charts/BookingChart';
import { useToast } from '../../../components/ToastProvider';
import type { SalesRole } from '../../SalesSidebar';

const PERIOD_TABS: { label: string; value: BookingPeriod }[] = [
  { label: 'Ngày', value: 'DAY' },
  { label: 'Tuần', value: 'WEEK' },
  { label: 'Tháng', value: 'MONTH' },
  { label: 'Quý', value: 'QUARTER' },
  { label: 'Năm', value: 'YEAR' },
  { label: 'Tuỳ chọn', value: 'CUSTOM' },
];

// Projects are loaded from admin-configured store

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

function getErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
  const message = response?.data?.message;

  if (Array.isArray(message) && message.length > 0) {
    return message.join(', ');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }

  return fallback;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: '#fef3c7', text: '#d97706', label: 'CHỜ DUYỆT' },
    APPROVED: { bg: '#dcfce7', text: '#16a34a', label: 'ĐÃ DUYỆT' },
    REJECTED: { bg: '#fee2e2', text: '#dc2626', label: 'TỪ CHỐI' },
    CANCELED: { bg: '#f1f5f9', text: '#64748b', label: 'ĐÃ HUỶ' },
  };
  const c = config[status] || { bg: '#f1f5f9', text: '#64748b', label: status };
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'center' }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: c.text, letterSpacing: 0.3 }}>{c.label}</Text>
    </View>
  );
}

export function BookingScreen({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isWideScreen = Platform.OS === 'web' && windowWidth >= 900;
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const { showToast } = useToast();
  const { addBooking, updateBooking, deleteBooking, approveBooking, rejectBooking } = useSalesStore();

  const createBookingMut = useCreateBooking();
  const updateBookingMut = useUpdateBooking();
  const deleteBookingMut = useDeleteBooking();
  const approveBookingMut = useApproveBooking();
  const rejectBookingMut = useRejectBooking();
  const availableProjectsRaw = useSalesStore(s => s.availableProjects);
  const { data: rawApiProjects } = useGetProjects();
  const apiProjects = Array.isArray(rawApiProjects) ? rawApiProjects : (Array.isArray((rawApiProjects as any)?.data) ? (rawApiProjects as any).data : []);
  const availableProjects: { name: string; status: string }[] = apiProjects.map((p: any) => ({ 
    name: p.name || p.projectName, 
    status: p.status === 'ACTIVE' ? 'OPEN' : (p.status || 'OPEN') 
  }));
  const {
    period, setPeriod,
    customFrom, setCustomFrom, customTo, setCustomTo,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    isLoading,
    error,
    totals, chartData, rawBookings,
  } = useBookingFilter();

  // Project search/filter
  const [projectSearch, setProjectSearch] = useState('');
  const openProjects = useMemo(() =>
    availableProjects
      .filter(p => p.status === 'OPEN')
      .filter(p => !projectSearch || p.name.toLowerCase().includes(projectSearch.toLowerCase())),
    [availableProjects, projectSearch]
  );

  // Form states
  const [selectedProject, setSelectedProject] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingAmount, setBookingAmount] = useState('');
  const [bookingCount, setBookingCount] = useState(1);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProject, setEditProject] = useState('');
  const [editCustomer, setEditCustomer] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCount, setEditCount] = useState(1);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!selectedProject) {
      showToast('Vui long chon du an.', 'warning');
      return;
    }
    if (!customerName.trim()) {
      showToast('Vui long nhap ten khach hang.', 'warning');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Vui long nhap so dien thoai.', 'warning');
      return;
    }

    const amountStr = bookingAmount.replace(/\D/g, '');
    const amountVal = Number(amountStr);
    if (Number.isNaN(amountVal) || amountVal <= 0) {
      showToast('Vui long nhap so tien giu cho hop le.', 'warning');
      return;
    }

    try {
      await createBookingMut.mutateAsync({
        project: selectedProject,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        bookingAmount: amountVal,
        bookingCount,
      });
      setSelectedProject('');
      setCustomerName('');
      setCustomerPhone('');
      setBookingAmount('');
      setBookingCount(1);
      showToast('Da gui yeu cau giu cho va cho phe duyet.', 'success');
    } catch (submitError) {
      showToast(getErrorMessage(submitError, 'Khong the tao yeu cau giu cho.'), 'error');
    }
  }, [selectedProject, customerName, customerPhone, bookingAmount, bookingCount, createBookingMut, showToast]);

  const legacyHandleSubmit = useCallback(async () => {
    if (!selectedProject) { alert('Vui lòng chọn dự án!'); return; }
    if (!customerName.trim()) { alert('Vui lòng nhập tên khách hàng!'); return; }
    if (!customerPhone.trim()) { alert('Vui lòng nhập số điện thoại!'); return; }
    const amountStr = bookingAmount.replace(/\\D/g, '');
    const amountVal = parseFloat(amountStr);
    if (isNaN(amountVal) || amountVal <= 0) { alert('Vui lòng nhập số tiền giữ chỗ hợp lệ!'); return; }
    addBooking({ project: selectedProject, customerName: customerName.trim(), customerPhone: customerPhone.trim(), bookingAmount: amountVal, bookingCount });
    // Also send to API (fire-and-forget, Zustand is fallback)
    createBookingMut.mutate({ project: selectedProject, customerName: customerName.trim(), customerPhone: customerPhone.trim(), bookingAmount: amountVal, bookingCount });
    setSelectedProject('');
    setCustomerName('');
    setCustomerPhone('');
    setBookingAmount('');
    setBookingCount(1);
    alert('✅ Đã gửi yêu cầu giữ chỗ! Chờ Admin phê duyệt.');
  }, [selectedProject, customerName, customerPhone, bookingAmount, bookingCount, addBooking, createBookingMut]);

  const startEdit = useCallback((b: BookingEntry) => {
    setEditingId(b.id);
    setEditProject(b.project);
    setEditCustomer(b.customerName);
    setEditPhone(b.customerPhone);
    setEditAmount(b.bookingAmount?.toString() || '');
    setEditCount(b.bookingCount);
    setDeletingId(null);
  }, []);

  const cancelEdit = useCallback(() => { setEditingId(null); }, []);

  const confirmEdit = useCallback(async () => {
    if (!editingId) {
      return;
    }

    const amountVal = Number(editAmount);
    if (Number.isNaN(amountVal) || amountVal <= 0) {
      showToast('Vui long nhap so tien giu cho hop le.', 'warning');
      return;
    }

    try {
      await updateBookingMut.mutateAsync({
        id: editingId,
        data: {
          project: editProject,
          customerName: editCustomer,
          customerPhone: editPhone,
          bookingAmount: amountVal,
          bookingCount: editCount,
        },
      });
      setEditingId(null);
      showToast('Da cap nhat giu cho.', 'success');
    } catch (updateError) {
      showToast(getErrorMessage(updateError, 'Khong the cap nhat giu cho.'), 'error');
    }
  }, [editingId, editAmount, editCount, editCustomer, editPhone, editProject, showToast, updateBookingMut]);

  const legacyConfirmEdit = useCallback(() => {
    if (editingId) {
      const amountVal = parseFloat(editAmount) || 0;
      updateBooking(editingId, { project: editProject, customerName: editCustomer, customerPhone: editPhone, bookingAmount: amountVal, bookingCount: editCount });
      updateBookingMut.mutate({ id: editingId, data: { project: editProject, customerName: editCustomer, customerPhone: editPhone, bookingAmount: amountVal, bookingCount: editCount } });
      setEditingId(null);
    }
  }, [editingId, editProject, editCustomer, editPhone, editAmount, editCount, updateBooking]);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
    setEditingId(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingId) {
      return;
    }

    try {
      await deleteBookingMut.mutateAsync(deletingId);
      setDeletingId(null);
      showToast('Da huy giu cho.', 'success');
    } catch (deleteError) {
      showToast(getErrorMessage(deleteError, 'Khong the huy giu cho.'), 'error');
    }
  }, [deleteBookingMut, deletingId, showToast]);

  const legacyConfirmDelete = useCallback(() => {
    if (deletingId) { deleteBooking(deletingId); deleteBookingMut.mutate(deletingId); setDeletingId(null); }
  }, [deletingId, deleteBooking]);

  const cancelDelete = useCallback(() => { setDeletingId(null); }, []);

  const isAdmin = userRole === 'sales_admin' || userRole === 'sales_manager' || userRole === 'sales_director' || userRole === 'ceo';

  const handleApprove = useCallback(async (id: string) => {
    try {
      await approveBookingMut.mutateAsync(id);
      showToast('Da phe duyet giu cho.', 'success');
    } catch (approveError) {
      showToast(getErrorMessage(approveError, 'Khong the phe duyet giu cho.'), 'error');
    }
  }, [approveBookingMut, showToast]);

  const handleReject = useCallback(async (id: string) => {
    try {
      await rejectBookingMut.mutateAsync(id);
      showToast('Da tu choi giu cho.', 'success');
    } catch (rejectError) {
      showToast(getErrorMessage(rejectError, 'Khong the tu choi giu cho.'), 'error');
    }
  }, [rejectBookingMut, showToast]);

  // Table columns
  const BOOKING_COLUMNS = [
    { key: 'date', title: 'THỜI GIAN', width: 160, render: (v: string) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Calendar size={14} color="#94a3b8" />
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b' }}>
          {new Date(v).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </Text>
      </View>
    )},
    { key: 'project', title: 'DỰ ÁN', width: 180, render: (v: string, row: any) => (
      editingId === row.id ? (
        <TextInput
          value={editProject}
          onChangeText={setEditProject}
          style={{
            fontSize: 13, fontWeight: '700', color: cText,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
            borderWidth: 2, borderColor: '#8b5cf6', borderRadius: 8,
            paddingHorizontal: 8, paddingVertical: 4, minWidth: 140,
          }}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Building2 size={14} color="#8b5cf6" />
          <Text style={{ fontSize: 13, fontWeight: '700', color: cText }} numberOfLines={1}>{v}</Text>
        </View>
      )
    )},
    { key: 'customerName', title: 'KHÁCH HÀNG', width: 160, render: (v: string, row: any) => (
      editingId === row.id ? (
        <TextInput
          value={editCustomer}
          onChangeText={setEditCustomer}
          style={{
            fontSize: 13, fontWeight: '700', color: cText,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
            borderWidth: 2, borderColor: '#0ea5e9', borderRadius: 8,
            paddingHorizontal: 8, paddingVertical: 4, minWidth: 120,
          }}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <User size={14} color="#0ea5e9" />
          {v ? (
            <Text style={{ fontSize: 13, fontWeight: '700', color: cText }} numberOfLines={1}>{v}</Text>
          ) : (
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#94a3b8', fontStyle: 'italic' }}>Chưa cập nhật</Text>
          )}
        </View>
      )
    )},
    { key: 'customerPhone', title: 'SĐT', width: 130, align: 'center' as const, render: (v: string, row: any) => (
      editingId === row.id ? (
        <TextInput
          value={editPhone}
          onChangeText={setEditPhone}
          style={{
            fontSize: 13, fontWeight: '700', color: cText,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
            borderWidth: 2, borderColor: '#22c55e', borderRadius: 8,
            paddingHorizontal: 8, paddingVertical: 4, minWidth: 100, textAlign: 'center',
          }}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Phone size={14} color="#22c55e" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>{v}</Text>
        </View>
      )
    )},
    { key: 'bookingAmount', title: 'SỐ TIỀN (VNĐ)', width: 140, align: 'center' as const, render: (v: number, row: any) => (
      editingId === row.id ? (
        <TextInput
          value={editAmount}
          onChangeText={setEditAmount}
          keyboardType="numeric"
          style={{
            fontSize: 13, fontWeight: '700', color: cText,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
            borderWidth: 2, borderColor: '#f59e0b', borderRadius: 8,
            paddingHorizontal: 8, paddingVertical: 4, minWidth: 100, textAlign: 'center',
          }}
        />
      ) : (
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#f59e0b', textAlign: 'center' }}>
          {new Intl.NumberFormat('vi-VN').format(v || 0)}
        </Text>
      )
    )},
    { key: 'bookingCount', title: 'SỐ GIỮ CHỖ', width: 110, align: 'center' as const, render: (v: number, row: any) => (
      editingId === row.id ? (
        <EditableCell value={editCount} onChange={setEditCount} color="#8b5cf6" bgColor="#f5f3ff" />
      ) : (
        <View style={{ backgroundColor: '#f5f3ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#8b5cf6' }}>{v}</Text>
        </View>
      )
    )},
    { key: 'status', title: 'TRẠNG THÁI', width: 120, align: 'center' as const, render: (v: string) => (
      <StatusBadge status={v} />
    )},
    { key: 'id', title: '', width: 160, align: 'center' as const, render: (_v: string, row: any) => (
      <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        {editingId === row.id ? (
          <>
            <ActionButton icon={Check} color="#22c55e" bg="#f0fdf4" onPress={confirmEdit} />
            <ActionButton icon={X} color="#94a3b8" bg={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} onPress={cancelEdit} />
          </>
        ) : deletingId === row.id ? (
          <>
            <ActionButton icon={Check} color="#ef4444" bg="#fef2f2" onPress={confirmDelete} />
            <ActionButton icon={X} color="#94a3b8" bg={isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'} onPress={cancelDelete} />
          </>
        ) : (
          <>
            {/* Admin approve/reject */}
            {isAdmin && row.status === 'PENDING' && (
              <>
                <ActionButton icon={CheckCircle} color="#22c55e" bg="#f0fdf4" onPress={() => { void handleApprove(row.id); }} />
                <ActionButton icon={XCircle} color="#ef4444" bg="#fef2f2" onPress={() => { void handleReject(row.id); }} />
              </>
            )}
            {/* Edit/Delete for own entries */}
            {row.status === 'PENDING' && (
              <>
                <ActionButton icon={Pencil} color="#a855f7" bg={isDark ? 'rgba(168,85,247,0.1)' : '#faf5ff'} onPress={() => startEdit(row)} />
                <ActionButton icon={Trash2} color="#ef4444" bg={isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2'} onPress={() => handleDelete(row.id)} />
              </>
            )}
          </>
        )}
      </View>
    )},
  ];

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.55)' : '#fff',
    borderRadius: 20, padding: 28,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(24px)',
      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.04)',
    } : {}),
  };

  const inputStyle: any = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderRadius: 14, padding: 14, fontSize: 15, color: cText, fontWeight: '600',
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  };

  const dateInputStyle: any = {
    fontSize: 14, fontWeight: '600', color: cText,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    minWidth: 140, textAlign: 'center',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  };

  const periodLabel = PERIOD_TABS.find(t => t.value === period)?.label || '';
  const isFormValid = selectedProject && customerName.trim() && customerPhone.trim() && bookingAmount;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: 120, gap: 20 }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 18,
              backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : '#f5f3ff',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ticket size={26} color="#8b5cf6" />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                QUẢN LÝ GIỮ CHỖ
              </Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>
                Giữ Chỗ & Phê Duyệt
              </Text>
            </View>
          </View>

          {/* Period Tabs */}
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
                    backgroundColor: active ? (isDark ? '#8b5cf6' : '#fff') : 'transparent',
                    ...(Platform.OS === 'web' && active && !isDark ? { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } : {}),
                  } as any}>
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

        {/* Custom date range */}
        {period === 'CUSTOM' && (
          <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, flexWrap: 'wrap' }]}>
            <Filter size={18} color="#8b5cf6" />
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
              <TextInput placeholder="YYYY-MM-DD" value={formatDateInput(customFrom)} onChangeText={t => setCustomFrom(parseDateInput(t))} style={dateInputStyle} />
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
              <TextInput placeholder="YYYY-MM-DD" value={formatDateInput(customTo)} onChangeText={t => setCustomTo(parseDateInput(t))} style={dateInputStyle} />
            )}
          </View>
        )}

        {/* ── KPI Summary Cards ── */}
        {error && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            borderRadius: 14,
            backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(239,68,68,0.2)' : '#fecaca',
          }}>
            <AlertTriangle size={16} color="#ef4444" />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#ef4444' }}>
              {getErrorMessage(error, 'Khong the tai du lieu giu cho.')}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Tổng Giữ Chỗ', value: totals.totalBookingCount, icon: <Ticket size={24} color="#8b5cf6" strokeWidth={2} />, color: '#8b5cf6' },
            { label: 'Khách Hàng (KPI)', value: totals.uniqueCustomers, icon: <Users size={24} color="#0ea5e9" strokeWidth={2} />, color: '#0ea5e9' },
            { label: 'Chờ Duyệt', value: totals.pendingCount, icon: <Clock size={24} color="#d97706" strokeWidth={2} />, color: '#d97706' },
            { label: 'Đã Duyệt', value: totals.approvedCount, icon: <CheckCircle size={24} color="#22c55e" strokeWidth={2} />, color: '#22c55e' },
          ].map((card, i) => (
            <View key={i} style={{ flex: 1, minWidth: 200 }}>
              <SGStatCard label={card.label} value={card.value} icon={card.icon} iconColor={card.color} />
            </View>
          ))}
        </View>

        {/* ── Chart ── */}
        <View style={cardStyle}>
          <SGPlanningSectionTitle
            icon={BarChart2 as any}
            title={`Biểu Đồ Giữ Chỗ (${periodLabel})`}
            accent="#8b5cf6"
            badgeText="TRENDS"
          />
          <BookingChart data={chartData} height={280} />
        </View>

        {/* ── Form + History Row ── */}
        <View style={{ flexDirection: isWideScreen ? 'row' : 'column', gap: 20 }}>

          {/* Input Form */}
          <View style={[cardStyle, { flex: 1 }]}>
            <SGPlanningSectionTitle
              icon={Plus as any}
              title="Tạo Giữ Chỗ Mới"
              accent="#8b5cf6"
              style={{ marginBottom: 20 }}
            />
            <View style={{ gap: 16 }}>
              {/* Project Selector */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  DỰ ÁN ĐANG NHẬN GIỮ CHỖ
                </Text>
                {/* Search filter */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                  borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  marginBottom: 10,
                }}>
                  <Search size={16} color="#94a3b8" />
                  <TextInput
                    style={{
                      flex: 1, fontSize: 13, fontWeight: '600', color: cText,
                      ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                    } as any}
                    placeholder="Tìm dự án..."
                    placeholderTextColor="#94a3b8"
                    value={projectSearch}
                    onChangeText={setProjectSearch}
                  />
                  {projectSearch !== '' && (
                    <TouchableOpacity onPress={() => setProjectSearch('')}>
                      <X size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {openProjects.map(p => (
                    <TouchableOpacity
                      key={p.name}
                      onPress={() => setSelectedProject(p.name)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                        backgroundColor: selectedProject === p.name ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                        borderWidth: 1,
                        borderColor: selectedProject === p.name ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                        ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 150ms ease' } : {}),
                      } as any}
                    >
                      <Text style={{
                        fontSize: 13, fontWeight: '700',
                        color: selectedProject === p.name ? '#fff' : cSub,
                      }}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {openProjects.length === 0 && (
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', fontStyle: 'italic' }}>
                      Không tìm thấy dự án phù hợp
                    </Text>
                  )}
                </View>
              </View>

              {/* Customer Name */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  TÊN KHÁCH HÀNG
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Nhập tên khách hàng..."
                  placeholderTextColor="#94a3b8"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
              </View>

              {/* Phone */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  SỐ ĐIỆN THOẠI
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Nhập số điện thoại..."
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                />
              </View>

              {/* Booking Amount */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  SỐ TIỀN GIỮ CHỖ (VNĐ)
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Ví dụ: 50.000.000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={bookingAmount}
                  onChangeText={(t) => {
                    const digits = t.replace(/\\D/g, '');
                    if (!digits) {
                      setBookingAmount('');
                      return;
                    }
                    const num = Number(digits);
                    if (isNaN(num)) {
                      setBookingAmount('');
                      return;
                    }
                    setBookingAmount(new Intl.NumberFormat('vi-VN').format(num));
                  }}
                />
              </View>

              {/* Booking Count */}
              <SGPlanningNumberField
                value={bookingCount}
                onChangeValue={setBookingCount}
                label="SỐ LƯỢNG GIỮ CHỖ"
                min={1}
                max={20}
                accent="#8b5cf6"
              />
            </View>

            {/* KPI hint */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              marginTop: 16, padding: 12, borderRadius: 12,
              backgroundColor: isDark ? 'rgba(14,165,233,0.08)' : '#f0f9ff',
              borderWidth: 1, borderColor: isDark ? 'rgba(14,165,233,0.15)' : '#bae6fd',
            }}>
              <AlertTriangle size={16} color="#0ea5e9" />
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#0ea5e9', flex: 1 }}>
                KPI: 1 khách hàng dù có nhiều giữ chỗ vẫn tính là 1 giữ chỗ
              </Text>
            </View>

            <View style={{ marginTop: 24 }}>
              <SGButton
                title="GỬI PHÊ DUYỆT"
                icon={Send as any}
                onPress={handleSubmit}
                disabled={!isFormValid}
                style={{ backgroundColor: isFormValid ? '#8b5cf6' : '#cbd5e1', borderRadius: 16, height: 56 }}
              />
            </View>
          </View>

          {/* History Table */}
          <View style={[cardStyle, { flex: 2 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <SGPlanningSectionTitle
                icon={History as any}
                title="Lịch Sử Giữ Chỗ"
                accent="#8b5cf6"
                badgeText={`${rawBookings.length} MỤC`}
                style={{ marginBottom: 0 }}
              />
              
              {/* History Search Filter */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                width: isWideScreen ? 300 : '100%',
              }}>
                <Search size={16} color="#94a3b8" />
                <TextInput
                  style={{
                    flex: 1, fontSize: 13, fontWeight: '600', color: cText,
                    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                  } as any}
                  placeholder="Tìm dự án, khách hàng, SĐT..."
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={14} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Status Filter Tabs */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Tất cả', value: 'ALL' },
                { label: 'Chờ duyệt', value: 'PENDING' },
                { label: 'Đã duyệt', value: 'APPROVED' },
                { label: 'Từ chối', value: 'REJECTED' },
              ].map(tab => {
                const active = statusFilter === tab.value;
                return (
                  <TouchableOpacity
                    key={tab.value}
                    onPress={() => setStatusFilter(tab.value as any)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: active ? (isDark ? 'rgba(139,92,246,0.15)' : '#f5f3ff') : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                      borderWidth: 1,
                      borderColor: active ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                      ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 150ms ease' } : {}),
                    } as any}
                  >
                    <Text style={{
                      fontSize: 13, fontWeight: '700',
                      color: active ? '#8b5cf6' : cSub,
                    }}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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
                  Xác nhận xoá giữ chỗ này? Nhấn ✓ để xoá hoặc ✗ để huỷ.
                </Text>
              </View>
            )}

            {isLoading && rawBookings.length === 0 ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <Ticket size={56} color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#94a3b8' }}>Dang tai du lieu giu cho...</Text>
              </View>
            ) : rawBookings.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'} style={{ width: '100%' }}>
                <View style={{ minWidth: 1050, paddingBottom: 8 }}>
                  <SGTable
                    columns={BOOKING_COLUMNS}
                    data={rawBookings}
                    onRowPress={() => {}}
                    style={{ borderWidth: 0, backgroundColor: 'transparent' }}
                  />
                </View>
              </ScrollView>
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <Ticket size={56} color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#94a3b8' }}>Chưa có giữ chỗ nào trong kỳ này</Text>
                <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Hãy tạo giữ chỗ mới ở khung bên trái</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Action button helper ──
function ActionButton({ icon: Icon, color, bg, onPress }: { icon: any; color: string; bg: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: bg,
        alignItems: 'center', justifyContent: 'center',
        ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.15s ease' } : {}),
      } as any}
    >
      <Icon size={14} color={color} />
    </TouchableOpacity>
  );
}

// ── Inline editable cell ──
function EditableCell({ value, onChange, color, bgColor }: { value: number; onChange: (v: number) => void; color: string; bgColor: string }) {
  return (
    <View style={{ alignSelf: 'center' }}>
      {Platform.OS === 'web' ? (
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e: any) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            width: 50, textAlign: 'center',
            fontSize: 14, fontWeight: 900, color,
            backgroundColor: bgColor,
            border: `2px solid ${color}`,
            borderRadius: 10, padding: '3px 6px',
            outline: 'none',
          }}
        />
      ) : (
        <TextInput
          value={String(value)}
          onChangeText={t => onChange(Math.max(1, parseInt(t) || 1))}
          keyboardType="numeric"
          style={{
            width: 50, textAlign: 'center',
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
