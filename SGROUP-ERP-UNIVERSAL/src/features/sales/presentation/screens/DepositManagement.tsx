/**
 * SGROUP ERP — Deposit Management (Quản Lý Đặt Cọc)
 * Data entry + KPI reporting page
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import {
  Plus, Send, History, Calendar, Landmark, Users, CheckCircle, Clock,
  BarChart2, ArrowRight, Filter, Trash2, X,
  Building2, Phone, User, Hash, AlertTriangle, Search, DollarSign,
  Grid, Edit2
} from 'lucide-react-native';
import { SGButton, SGPlanningSectionTitle, SGPlanningNumberField, SGTable, SGStatCard } from '../../../../shared/ui/components';
import { useSalesStore } from '../../store/useSalesStore';
import { useCreateDeposit, useConfirmDeposit, useCancelDeposit } from '../../hooks/useDeposits';
import { useGetProjects } from '../../hooks/useSalesOps';
import { useDepositFilter } from '../../hooks/useDepositFilter';
import { projectApi } from '../../../project/infrastructure/api/projectApi';
import { useQuery } from '@tanstack/react-query';
import { DepositChart } from '../../components/charts/DepositChart';
import { UnitMatrix } from '../../components/inventory/UnitMatrix';
import { UnitDetailsModal } from '../../components/modals/UnitDetailsModal';
import { useToast } from '../../components/ToastProvider';
import type { SalesRole } from '../../SalesSidebar';
import type { PropertyUnit } from '../../store/useSalesStore';
import type { BookingPeriod } from '../../hooks/useBookingFilter';

const PERIOD_TABS: { label: string; value: BookingPeriod }[] = [
  { label: 'Ngày', value: 'DAY' },
  { label: 'Tuần', value: 'WEEK' },
  { label: 'Tháng', value: 'MONTH' },
  { label: 'Quý', value: 'QUARTER' },
  { label: 'Năm', value: 'YEAR' },
  { label: 'Tuỳ chọn', value: 'CUSTOM' },
];

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
    PENDING_DEPOSIT: { bg: '#fef3c7', text: '#d97706', label: 'CHỜ DUYỆT' },
    DEPOSIT: { bg: '#dcfce7', text: '#16a34a', label: 'ĐÃ DUYỆT' },
    REJECTED: { bg: '#fee2e2', text: '#ef4444', label: 'TỪ CHỐI' },
    CANCELED: { bg: '#f1f5f9', text: '#64748b', label: 'ĐÃ HUỶ' },
  };
  const normalizedStatus =
    status === 'PENDING_DEPOSIT' ? 'PENDING'
      : status === 'DEPOSIT' ? 'CONFIRMED'
      : status;
  const normalizedConfig: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: '#fef3c7', text: '#d97706', label: 'CHO DUYET' },
    CONFIRMED: { bg: '#dcfce7', text: '#16a34a', label: 'DA DUYET' },
    CANCELLED: { bg: '#f1f5f9', text: '#64748b', label: 'DA HUY' },
    REFUNDED: { bg: '#dbeafe', text: '#2563eb', label: 'HOAN TIEN' },
  };
  const c = normalizedConfig[normalizedStatus] || config[status] || { bg: '#f1f5f9', text: '#64748b', label: status };
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, alignSelf: 'center' }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: c.text, letterSpacing: 0.3 }}>{c.label}</Text>
    </View>
  );
}

export function DepositManagement({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const isWideScreen = Platform.OS === 'web' && windowWidth >= 900;
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const { showToast } = useToast();

  const { addTransaction } = useSalesStore();
  const createDepositMut = useCreateDeposit();
  const confirmDepositMut = useConfirmDeposit();
  const cancelDepositMut = useCancelDeposit();
  const availableProjectsRaw = useSalesStore(s => s.availableProjects);
  const { data: rawApiProjects } = useGetProjects();
  const apiProjects = Array.isArray(rawApiProjects) ? rawApiProjects : (Array.isArray((rawApiProjects as any)?.data) ? (rawApiProjects as any).data : []);
  const availableProjects: { name: string; status: string }[] = apiProjects.length > 0
    ? apiProjects.map((p: any) => ({ name: p.name || p.projectName, status: p.status === 'ACTIVE' ? 'OPEN' : (p.status || 'OPEN') }))
    : availableProjectsRaw;
  
  const {
    period, setPeriod,
    customFrom, setCustomFrom, customTo, setCustomTo,
    statusFilter, setStatusFilter,
    isLoading,
    error,
    totals, chartData, rawDeposits,
  } = useDepositFilter();

  // Project search/filter
  const [projectSearch, setProjectSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const openProjects = useMemo(() =>
    availableProjects
      .filter(p => p.status === 'OPEN')
      .filter(p => !projectSearch || p.name.toLowerCase().includes(projectSearch.toLowerCase())),
    [availableProjects, projectSearch]
  );

  // Layout tabs
  const [activeTab, setActiveTab] = useState<'input' | 'matrix'>('input');
  
  // Matrix states
  const [matrixProjectSearch, setMatrixProjectSearch] = useState('');
  const openMatrixProjects = useMemo(() =>
    availableProjects
      .filter(p => p.status === 'OPEN')
      .filter(p => !matrixProjectSearch || p.name.toLowerCase().includes(matrixProjectSearch.toLowerCase())),
    [availableProjects, matrixProjectSearch]
  );
  
  const [matrixSelectedProject, setMatrixSelectedProject] = useState<{id: string; name: string} | null>(null);
  const [selectedUnitDetails, setSelectedUnitDetails] = useState<PropertyUnit | null>(null);

  // Fetch real products from project API for the selected project
  const { data: rawApiProducts } = useQuery({
    queryKey: ['projects', matrixSelectedProject?.id, 'products'],
    queryFn: () => projectApi.getProducts(matrixSelectedProject!.id),
    enabled: !!matrixSelectedProject?.id,
    staleTime: 15_000,
  });

  const unitsForSelectedProject: PropertyUnit[] = useMemo(() => {
    if (!matrixSelectedProject) return [];
    const apiProducts = Array.isArray(rawApiProducts) ? rawApiProducts : [];
    return apiProducts.map((p: any) => ({
      id: p.id,
      code: p.code || '',
      block: p.block || 'Khác',
      floor: p.floor ?? 0,
      area: p.area ?? 0,
      bedrooms: p.bedrooms ?? 0,
      direction: p.direction || '',
      price: p.price ?? 0,
      status: (p.status || 'AVAILABLE') as any,
      bookedBy: p.bookedBy,
      lockedUntil: p.lockedUntil ? new Date(p.lockedUntil) : undefined,
      project: matrixSelectedProject.name,
      projectId: p.projectId,
    }));
  }, [rawApiProducts, matrixSelectedProject]);

  // Form states
  const [selectedProject, setSelectedProject] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [transactionValue, setTransactionValue] = useState(0); // Tỷ VNĐ
  const [notes, setNotes] = useState('');

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUnitCode, setEditUnitCode] = useState('');
  const [editCustomer, setEditCustomer] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editValue, setEditValue] = useState(0);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin =
    userRole === 'sales_admin' ||
    userRole === 'sales_manager' ||
    userRole === 'sales_director' ||
    userRole === 'ceo';

  const handleSubmit = useCallback(async () => {
    if (!selectedProject) {
      showToast('Vui long chon du an.', 'warning');
      return;
    }
    if (!unitCode.trim()) {
      showToast('Vui long nhap ma can.', 'warning');
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
    if (transactionValue <= 0) {
      showToast('Gia tri dat coc phai lon hon 0.', 'warning');
      return;
    }

    try {
      await createDepositMut.mutateAsync({
        project: selectedProject,
        unitCode: unitCode.trim(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        depositAmount: transactionValue,
        notes: notes.trim() || undefined,
      });
      setSelectedProject('');
      setUnitCode('');
      setCustomerName('');
      setCustomerPhone('');
      setTransactionValue(0);
      setNotes('');
      showToast('Da gui yeu cau dat coc va cho phe duyet.', 'success');
    } catch (submitError) {
      showToast(getErrorMessage(submitError, 'Khong the tao yeu cau dat coc.'), 'error');
    }
  }, [selectedProject, unitCode, customerName, customerPhone, transactionValue, notes, createDepositMut, showToast]);

  const legacyHandleSubmit = () => {
    if (!selectedProject) { alert('Vui lòng chọn dự án!'); return; }
    if (!unitCode.trim()) { alert('Vui lòng nhập mã căn!'); return; }
    if (!customerName.trim()) { alert('Vui lòng nhập tên khách hàng!'); return; }
    if (!customerPhone.trim()) { alert('Vui lòng nhập số điện thoại!'); return; }
    
    // Local Zustand fallback
    addTransaction({
      project: selectedProject,
      unitCode: unitCode.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      transactionValue,
      status: 'PENDING_DEPOSIT',
      notes,
    });

    // Send to backend API
    createDepositMut.mutate({
      project: selectedProject,
      unitCode: unitCode.trim(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      depositAmount: transactionValue,
    });
    
    setSelectedProject('');
    setUnitCode('');
    setCustomerName('');
    setCustomerPhone('');
    setTransactionValue(0);
    setNotes('');
    alert('✅ Đã gửi yêu cầu đặt cọc! Chờ Admin phê duyệt.');
  };

  const handleSelectUnitFromMatrix = useCallback((unit: PropertyUnit) => {
    setSelectedProject(unit.project);
    setUnitCode(unit.code);
    setTransactionValue(unit.price);
    setActiveTab('input');
  }, []);

  const handleConfirmDeposit = useCallback(async (id: string) => {
    try {
      await confirmDepositMut.mutateAsync(id);
      showToast('Da phe duyet dat coc.', 'success');
    } catch (confirmError) {
      showToast(getErrorMessage(confirmError, 'Khong the phe duyet dat coc.'), 'error');
    }
  }, [confirmDepositMut, showToast]);

  const handleCancelDeposit = useCallback(async (id: string) => {
    try {
      await cancelDepositMut.mutateAsync(id);
      showToast('Da huy giao dich dat coc.', 'success');
    } catch (cancelError) {
      showToast(getErrorMessage(cancelError, 'Khong the huy giao dich dat coc.'), 'error');
    }
  }, [cancelDepositMut, showToast]);

  const normalizeDepositStatusValue = useCallback((value: string) => {
    if (value === 'PENDING_DEPOSIT') return 'PENDING';
    if (value === 'DEPOSIT') return 'CONFIRMED';
    if (value === 'REJECTED') return 'CANCELLED';
    return value;
  }, []);

  // Table columns
  const DEPOSIT_COLUMNS = [
    { key: 'date', title: 'THỜI GIAN', width: 140, render: (v: string) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Calendar size={14} color="#94a3b8" />
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>
          {new Date(v).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </Text>
      </View>
    )},
    { key: 'project', title: 'DỰ ÁN', width: 160, render: (v: string) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Building2 size={14} color="#3b82f6" />
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }} numberOfLines={1}>{v}</Text>
      </View>
    )},
    { key: 'unitCode', title: 'MÃ CĂN', width: 120, render: (v: string) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Hash size={14} color="#ea580c" />
        <Text style={{ fontSize: 13, fontWeight: '800', color: '#ea580c' }} numberOfLines={1}>{v}</Text>
      </View>
    )},
    { key: 'customerName', title: 'KHÁCH HÀNG', width: 140, render: (v: string) => (
      v ? (
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }} numberOfLines={1}>{v}</Text>
      ) : (
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#94a3b8', fontStyle: 'italic' }}>Chưa cập nhật</Text>
      )
    )},
    { key: 'customerPhone', title: 'SĐT', width: 120, render: (v: string) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Phone size={14} color="#22c55e" />
        {v ? (
          <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>{v}</Text>
        ) : (
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#94a3b8', fontStyle: 'italic' }}>Chưa cập nhật</Text>
        )}
      </View>
    )},
    { key: 'transactionValue', title: 'GIÁ TRỊ (VNĐ)', width: 140, align: 'right' as const, render: (v: number) => (
      <Text style={{ fontSize: 13, fontWeight: '900', color: '#10b981' }}>{new Intl.NumberFormat('vi-VN').format(Math.round(v * 1000000000))}</Text>
    )},
    { key: 'status', title: 'TRẠNG THÁI', width: 120, align: 'center' as const, render: (v: string) => (
      <StatusBadge status={v} />
    )},
    { key: 'id', title: '', width: 110, align: 'center' as const, render: (_v: string, row: any) => (
      <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        {isAdmin && row.status === 'PENDING' && (
          <ActionButton icon={CheckCircle} color="#22c55e" bg="#f0fdf4" onPress={() => { void handleConfirmDeposit(row.id); }} />
        )}
        {isAdmin && ['PENDING', 'CONFIRMED'].includes(row.status) && (
          <ActionButton icon={X} color="#ef4444" bg="#fef2f2" onPress={() => { void handleCancelDeposit(row.id); }} />
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
  const isFormValid = selectedProject && unitCode.trim() && customerName.trim() && customerPhone.trim() && transactionValue > 0;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: 120, gap: 20 }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 18,
              backgroundColor: isDark ? 'rgba(234,88,12,0.12)' : '#fff7ed',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Landmark size={26} color="#ea580c" />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#ea580c', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
                QUẢN LÝ GIAO DỊCH
              </Text>
              <Text style={{ fontSize: 26, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>
                Đặt Cọc & Phê Duyệt
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
                    backgroundColor: active ? (isDark ? '#ea580c' : '#fff') : 'transparent',
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
            <Filter size={18} color="#ea580c" />
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

        {/* ── View Mode Tabs ── */}
        <View style={{ flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 20, padding: 6 }}>
          {[
            { id: 'input', label: 'NHẬP LIỆU & LỊCH SỬ', icon: Edit2 },
            { id: 'matrix', label: 'BẢNG HÀNG DỰ ÁN', icon: Grid },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id as any)}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: active ? (isDark ? '#3b82f6' : '#fff') : 'transparent', shadowOpacity: active && !isDark ? 0.05 : 0 }}
              >
                <Icon size={18} color={active ? (isDark ? '#fff' : '#0f172a') : '#64748b'} />
                <Text style={{ fontSize: 13, fontWeight: '800', color: active ? (isDark ? '#fff' : '#0f172a') : '#64748b' }}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'input' ? (
          <>
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
              {getErrorMessage(error, 'Khong the tai du lieu dat coc.')}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Tổng Số Cọc', value: totals.totalDeposits, icon: <Landmark size={24} color="#3b82f6" strokeWidth={2} />, color: '#3b82f6' },
            { label: 'Doanh Thu (Tỷ VNĐ)', value: totals.confirmedValue.toFixed(2), icon: <DollarSign size={24} color="#8b5cf6" strokeWidth={2} />, color: '#8b5cf6' },
            { label: 'Cọc Chờ Duyệt', value: totals.pendingCount, icon: <Clock size={24} color="#f59e0b" strokeWidth={2} />, color: '#f59e0b' },
            { label: 'Cọc Đã Nhận', value: totals.confirmedCount, icon: <CheckCircle size={24} color="#10b981" strokeWidth={2} />, color: '#10b981' },
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
            title={`Biểu Đồ Doanh Thu Giữ Chỗ & Đặt Cọc (${periodLabel})`}
            accent="#ea580c"
            badgeText="TRENDS"
          />
          <DepositChart data={chartData} height={280} />
        </View>

        {/* ── Form + History Row ── */}
        <View style={{ flexDirection: isWideScreen ? 'row' : 'column', gap: 20 }}>

          {/* Input Form */}
          <View style={[cardStyle, { flex: 1 }]}>
            <SGPlanningSectionTitle
              icon={Plus as any}
              title="Tạo Yêu Cầu Đặt Cọc Mới"
              accent="#ea580c"
              style={{ marginBottom: 20 }}
            />
            <View style={{ gap: 16 }}>
              {/* Project Selector */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  DỰ ÁN
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
                        backgroundColor: selectedProject === p.name ? '#ea580c' : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                        borderWidth: 1,
                        borderColor: selectedProject === p.name ? '#ea580c' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
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

              {/* Unit Code */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  MÃ CĂN HỘ / SẢN PHẨM
                </Text>
                <TouchableOpacity 
                  onPress={() => setActiveTab('matrix')}
                  style={[inputStyle, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f1f5f9', borderColor: '#cbd5e1' }]}
                >
                  <Text style={{ color: unitCode ? cText : '#94a3b8', fontSize: 15, fontWeight: '700' }}>
                    {unitCode || "Chọn từ Bảng Hàng Dự Án..."}
                  </Text>
                </TouchableOpacity>
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

              {/* Transaction Value */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                   GIÁ TRỊ CĂN (VNĐ)
                </Text>
                <View style={[inputStyle, { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f1f5f9', borderColor: '#cbd5e1' }]}>
                  <Text style={{ color: transactionValue > 0 ? '#10b981' : '#94a3b8', fontSize: 16, fontWeight: '900' }}>
                    {transactionValue > 0 ? new Intl.NumberFormat('vi-VN').format(Math.round(transactionValue * 1000000000)) : "Tự động điền theo mã căn"}
                  </Text>
                </View>
              </View>

              {/* Notes */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  GHI CHÚ (NẾU CÓ)
                </Text>
                <TextInput
                  style={[inputStyle, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Ví dụ: Đã nhận chuyển khoản cọc 50tr..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </View>

            <View style={{ marginTop: 24 }}>
              <SGButton
                title="GỬI PHÊ DUYỆT"
                icon={Send as any}
                onPress={handleSubmit}
                disabled={!isFormValid}
                style={{ backgroundColor: isFormValid ? '#ea580c' : '#cbd5e1', borderRadius: 16, height: 56 }}
              />
            </View>
          </View>

          {/* History Table */}
          <View style={[cardStyle, { flex: 1.8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
              <SGPlanningSectionTitle
                icon={History as any}
                title="Danh Sách Giao Dịch"
                accent="#ea580c"
                badgeText={`${rawDeposits.length} MỤC`}
                style={{ marginBottom: 0 }}
              />
              
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                width: 240,
              }}>
                <Search size={16} color="#94a3b8" />
                <TextInput
                  style={{
                    flex: 1, fontSize: 13, fontWeight: '600', color: cText,
                    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                  } as any}
                  placeholder="Tìm kiếm nhanh..."
                  placeholderTextColor="#94a3b8"
                  value={historySearch}
                  onChangeText={setHistorySearch}
                />
                {historySearch !== '' && (
                  <TouchableOpacity onPress={() => setHistorySearch('')}>
                    <X size={14} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Status Filter Tabs */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Tất cả', value: 'ALL' },
                { label: 'Chờ duyệt', value: 'PENDING_DEPOSIT' },
                { label: 'Đã duyệt', value: 'DEPOSIT' },
                { label: 'Từ chối', value: 'REJECTED' },
              ].map(tab => {
                const normalizedValue = normalizeDepositStatusValue(tab.value as string);
                const active = statusFilter === normalizedValue;
                return (
                  <TouchableOpacity
                    key={tab.value}
                    onPress={() => setStatusFilter(normalizedValue as any)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: active ? (isDark ? 'rgba(234,88,12,0.15)' : '#fff7ed') : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                      borderWidth: 1,
                      borderColor: active ? '#ea580c' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                      ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 150ms ease' } : {}),
                    } as any}
                  >
                    <Text style={{
                      fontSize: 13, fontWeight: '700',
                      color: active ? '#ea580c' : cSub,
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
                  Xác nhận xoá giao dịch này? Nhấn ✓ để xoá hoặc ✗ để huỷ.
                </Text>
              </View>
            )}

            {(() => {
              const filteredList = rawDeposits
                .filter(d =>
                  !historySearch ||
                  d.customerPhone?.includes(historySearch) ||
                  d.customerName?.toLowerCase().includes(historySearch.toLowerCase()) ||
                  d.unitCode?.toLowerCase().includes(historySearch.toLowerCase()) ||
                  d.project?.toLowerCase().includes(historySearch.toLowerCase())
                )
                .map(d => ({
                  ...d,
                  transactionValue: d.depositAmount,
                }));
              
              if (isLoading && filteredList.length === 0) {
                return (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                    <Landmark size={56} color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} style={{ marginBottom: 12 }} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#94a3b8' }}>Dang tai du lieu dat coc...</Text>
                  </View>
                );
              }

              if (filteredList.length > 0) {
                return (
                  <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === 'web'} style={{ width: '100%' }}>
                    <View style={{ minWidth: 1050, paddingBottom: 8 }}>
                      <SGTable
                        columns={DEPOSIT_COLUMNS}
                        data={filteredList}
                        onRowPress={() => {}}
                        style={{ borderWidth: 0, backgroundColor: 'transparent' }}
                      />
                    </View>
                  </ScrollView>
                );
              } else {
                return (
                  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                    <Landmark size={56} color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} style={{ marginBottom: 12 }} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#94a3b8' }}>Chưa có giao dịch nào phù hợp</Text>
                  </View>
                );
              }
            })()}
          </View>
        </View>
          </>
        ) : (
          <View style={[cardStyle, { paddingHorizontal: 20 }]}>
            <SGPlanningSectionTitle
              icon={Grid as any}
              title="Bảng Hàng Khả Dụng"
              accent="#ea580c"
              style={{ marginBottom: 20 }}
            />
            {/* Project Selector for Matrix */}
            <View style={{ marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
               <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  CHỌN DỰ ÁN ĐỂ XEM BẢNG HÀNG
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', marginBottom: 10, maxWidth: 400 }}>
                  <Search size={16} color="#94a3b8" />
                  <TextInput
                    style={{ flex: 1, fontSize: 13, fontWeight: '600', color: cText, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as any}
                    placeholder="Tìm dự án..."
                    placeholderTextColor="#94a3b8"
                    value={matrixProjectSearch}
                    onChangeText={setMatrixProjectSearch}
                  />
                  {matrixProjectSearch !== '' && (
                    <TouchableOpacity onPress={() => setMatrixProjectSearch('')}>
                      <X size={14} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {/* Use API projects with IDs for matrix */}
                  {(apiProjects.length > 0 ? apiProjects : openMatrixProjects).map((p: any) => {
                    const pId = p.id || '';
                    const pName = p.name || p.projectName || '';
                    const isSelected = matrixSelectedProject?.id === pId || (!pId && matrixSelectedProject?.name === pName);
                    return (
                    <TouchableOpacity
                      key={pId || pName}
                      onPress={() => setMatrixSelectedProject({ id: pId, name: pName })}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                        backgroundColor: isSelected ? '#ea580c' : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                        borderWidth: 1,
                        borderColor: isSelected ? '#ea580c' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                        ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 150ms ease' } : {}),
                      } as any}
                    >
                      <Text style={{
                        fontSize: 13, fontWeight: '700',
                        color: isSelected ? '#fff' : cSub,
                      }}>{pName}</Text>
                    </TouchableOpacity>
                    );
                  })}
                  {openMatrixProjects.length === 0 && apiProjects.length === 0 && (
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', fontStyle: 'italic' }}>
                      Không tìm thấy dự án phù hợp
                    </Text>
                  )}
                </View>
            </View>

            {matrixSelectedProject ? (
              <UnitMatrix 
                units={unitsForSelectedProject} 
                selectedProjectName={matrixSelectedProject.name} 
                onSelectUnit={handleSelectUnitFromMatrix}
                onViewDetails={setSelectedUnitDetails}
              />
            ) : (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
                <Building2 size={56} color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#94a3b8' }}>Vui lòng chọn một dự án để xem bảng hàng</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      <UnitDetailsModal 
        visible={!!selectedUnitDetails} 
        onClose={() => setSelectedUnitDetails(null)} 
        unit={selectedUnitDetails} 
        onSelectUnit={handleSelectUnitFromMatrix} 
      />
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
function EditableCell({ value, onChange, color, bgColor, isFloat = false }: { value: number; onChange: (v: number) => void; color: string; bgColor: string; isFloat?: boolean }) {
  return (
    <View style={{ alignSelf: 'center' }}>
      {Platform.OS === 'web' ? (
        <input
          type="number"
          min={0}
          step={isFloat ? "0.1" : "1"}
          value={value}
          onChange={(e: any) => onChange(Math.max(0, isFloat ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0))}
          style={{
            width: 60, textAlign: 'center',
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
          onChangeText={t => onChange(Math.max(0, isFloat ? parseFloat(t) || 0 : parseInt(t) || 0))}
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
