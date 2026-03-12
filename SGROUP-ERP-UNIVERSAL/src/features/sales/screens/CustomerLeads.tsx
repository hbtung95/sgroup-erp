/**
 * CustomerLeads — Quản lý Khách hàng & Leads cho NVKD
 * Pipeline CRM: CRUD khách hàng, filter theo status, search, thêm lead mới
 * Connected to API via useCustomers hook
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, TextInput, Modal } from 'react-native';
import {
  Users2, Phone, MessageCircle, Calendar, Search, Plus,
  Star, Clock, X, Check, ChevronDown
} from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useCustomers, Customer, LeadStatus } from '../hooks/useCustomers';
import type { SalesRole } from '../SalesSidebar';

const STATUS_CFG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  NEW:         { label: 'MỚI',        color: '#6366f1', bg: '#eef2ff' },
  CONTACTED:   { label: 'ĐÃ LIÊN HỆ', color: '#3b82f6', bg: '#eff6ff' },
  INTERESTED:  { label: 'QUAN TÂM',   color: '#f59e0b', bg: '#fffbeb' },
  MEETING:     { label: 'HẸN GẶP',    color: '#8b5cf6', bg: '#f5f3ff' },
  NEGOTIATION: { label: 'ĐÀM PHÁN',   color: '#ec4899', bg: '#fdf2f8' },
  WON:         { label: 'CHỐT',       color: '#22c55e', bg: '#f0fdf4' },
  LOST:        { label: 'MẤT',        color: '#94a3b8', bg: '#f8fafc' },
};

const STATUS_ORDER: LeadStatus[] = ['NEW', 'CONTACTED', 'INTERESTED', 'MEETING', 'NEGOTIATION', 'WON', 'LOST'];

export function CustomerLeads({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const isDirector = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const isLeader = userRole === 'team_lead' || userRole === 'sales_manager';
  const scopeLabel = isDirector ? 'TOÀN BỘ KHÁCH HÀNG' : isLeader ? 'KHÁCH HÀNG TEAM' : 'KHÁCH HÀNG CỦA TÔI';
  const [activeFilter, setActiveFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({ fullName: '', phone: '', source: '', projectInterest: '', budget: '', note: '' });

  const { customers, loading, createCustomer, updateCustomer, removeCustomer } = useCustomers();

  const filtered = customers
    .filter(l => activeFilter === 'ALL' || l.status === activeFilter)
    .filter(l => !searchText || l.fullName.toLowerCase().includes(searchText.toLowerCase()) || (l.phone || '').includes(searchText));

  const statusCounts = STATUS_ORDER.map(s => ({
    status: s,
    count: customers.filter(l => l.status === s).length,
    ...STATUS_CFG[s],
  }));

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } : {}),
  };

  const handleAddLead = async () => {
    if (!newLead.fullName.trim()) return;
    await createCustomer({
      fullName: newLead.fullName,
      phone: newLead.phone,
      source: newLead.source || 'MANUAL',
      projectInterest: newLead.projectInterest,
      budget: newLead.budget,
      note: newLead.note,
      status: 'NEW',
    });
    setNewLead({ fullName: '', phone: '', source: '', projectInterest: '', budget: '', note: '' });
    setShowAddModal(false);
  };

  const handleStatusChange = async (lead: Customer, newStatus: LeadStatus) => {
    await updateCustomer(lead.id, { status: newStatus, lastContactAt: new Date() as any });
  };

  const nextStatusMap: Partial<Record<LeadStatus, LeadStatus>> = {
    NEW: 'CONTACTED',
    CONTACTED: 'INTERESTED',
    INTERESTED: 'MEETING',
    MEETING: 'NEGOTIATION',
    NEGOTIATION: 'WON',
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#6366f1', textTransform: 'uppercase', marginBottom: 4 }}>{scopeLabel}</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Khách Hàng & Leads</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 4 }}>
              {customers.length} khách hàng • {customers.filter(c => c.status === 'NEW').length} lead mới
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={{
            flexDirection: 'row', alignItems: 'center', gap: 8, height: 48, paddingHorizontal: 24,
            borderRadius: 16, backgroundColor: '#3b82f6',
            ...(Platform.OS === 'web' ? { boxShadow: '0 4px 14px rgba(59,130,246,0.3)' } : { shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 }),
          } as any}>
            <Plus size={18} color="#fff" strokeWidth={3} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Thêm Lead</Text>
          </TouchableOpacity>
        </View>

        {/* Pipeline Summary */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          <TouchableOpacity onPress={() => setActiveFilter('ALL')} style={{
            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
            backgroundColor: activeFilter === 'ALL' ? '#1e293b' : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
            borderWidth: 1, borderColor: activeFilter === 'ALL' ? '#1e293b' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: activeFilter === 'ALL' ? '#fff' : cSub }}>
              Tất Cả ({customers.length})
            </Text>
          </TouchableOpacity>
          {statusCounts.map(s => (
            <TouchableOpacity key={s.status} onPress={() => setActiveFilter(s.status)} style={{
              paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: activeFilter === s.status ? s.color : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
              borderWidth: 1, borderColor: activeFilter === s.status ? s.color : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
            }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: activeFilter === s.status ? '#fff' : s.color }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: activeFilter === s.status ? '#fff' : cSub }}>
                {s.label} ({s.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search */}
        <View style={[cardStyle, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 0, borderRadius: 16 }]}>
          <Search size={18} color={cSub} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tìm khách hàng theo tên hoặc SĐT..."
            placeholderTextColor={cSub}
            style={{
              flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 14, fontWeight: '600',
              color: cText, outlineStyle: 'none',
            } as any}
          />
        </View>

        {/* Lead Cards */}
        <View style={{ gap: 12 }}>
          {filtered.map(lead => {
            const cfg = STATUS_CFG[lead.status];
            const nextStatus = nextStatusMap[lead.status];
            return (
              <View key={lead.id} style={[cardStyle, { padding: 20, flexDirection: 'row', alignItems: 'center' }]}>
                {/* Avatar */}
                <View style={{
                  width: 52, height: 52, borderRadius: 16, marginRight: 16,
                  backgroundColor: isDark ? `${cfg.color}20` : cfg.bg,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: cfg.color }}>
                    {lead.fullName.charAt(0)}
                  </Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{lead.fullName}</Text>
                    {lead.isVip && (
                      <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Star size={10} color="#f59e0b" />
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#f59e0b' }}>VIP</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>{lead.phone}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8' }}>•</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#3b82f6' }}>{lead.projectInterest}</Text>
                    {lead.budget && <>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8' }}>•</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>{lead.budget}</Text>
                    </>}
                  </View>
                  {lead.note && (
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#fbbf24' : '#d97706', marginTop: 6, fontStyle: 'italic' }}>
                      📝 {lead.note}
                    </Text>
                  )}
                </View>

                {/* Status + Actions */}
                <View style={{ alignItems: 'flex-end', gap: 10 }}>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, backgroundColor: isDark ? `${cfg.color}20` : cfg.bg, borderWidth: 1, borderColor: `${cfg.color}30` }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={14} color="#22c55e" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageCircle size={14} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : '#f5f3ff', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={14} color="#8b5cf6" />
                    </TouchableOpacity>
                  </View>
                  {nextStatus && (
                    <TouchableOpacity onPress={() => handleStatusChange(lead, nextStatus)} style={{
                      flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5,
                      borderRadius: 8, backgroundColor: isDark ? 'rgba(34,197,94,0.1)' : '#f0fdf4',
                      borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
                    }}>
                      <Check size={12} color="#22c55e" />
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#22c55e' }}>→ {STATUS_CFG[nextStatus].label}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: cSub }}>Không tìm thấy khách hàng phù hợp</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Lead Modal */}
      {showAddModal && (
        <Modal transparent animationType="fade" visible={showAddModal} onRequestClose={() => setShowAddModal(false)}>
          <View style={{
            flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
            ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } : {}),
          } as any}>
            <View style={[cardStyle, { width: '90%', maxWidth: 520, padding: 32, borderRadius: 28 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <Text style={{ fontSize: 22, fontWeight: '900', color: cText }}>Thêm Lead Mới</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} color={cSub} />
                </TouchableOpacity>
              </View>

              {[
                { key: 'fullName', label: 'Họ và Tên *', placeholder: 'Nguyễn Văn A' },
                { key: 'phone', label: 'Số Điện Thoại', placeholder: '0901 234 567' },
                { key: 'source', label: 'Nguồn', placeholder: 'Facebook Ads, Hotline, Walk-in...' },
                { key: 'projectInterest', label: 'Dự Án Quan Tâm', placeholder: 'Vinhomes Ocean Park' },
                { key: 'budget', label: 'Ngân Sách', placeholder: '3 – 5 Tỷ' },
                { key: 'note', label: 'Ghi Chú', placeholder: 'Thông tin thêm...' },
              ].map(f => (
                <View key={f.key} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{f.label}</Text>
                  <TextInput
                    value={(newLead as any)[f.key]}
                    onChangeText={v => setNewLead(prev => ({ ...prev, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor="#94a3b8"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                      borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
                      fontSize: 14, fontWeight: '600', color: cText,
                      borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                      outlineStyle: 'none',
                    } as any}
                  />
                </View>
              ))}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <TouchableOpacity onPress={() => setShowAddModal(false)} style={{
                  flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cSub }}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddLead} style={{
                  flex: 1, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#3b82f6',
                }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Tạo Lead</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
