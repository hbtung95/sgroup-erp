import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Platform, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { X, Activity, Bookmark, Tag, Save } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGButton, SGPlanningNumberField } from '../../../../shared/ui/components';
import type { useSalesData } from '../../hooks/useSalesData';

type SalesQuickFormsProps = {
  visible: boolean;
  onClose: () => void;
  dataHook: ReturnType<typeof useSalesData>;
};

export function SalesQuickForms({ visible, onClose, dataHook }: SalesQuickFormsProps) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const [activeTab, setActiveTab] = useState<'activity' | 'booking' | 'transaction'>('activity');

  // Form States
  const [postsCount, setPostsCount] = useState(0);
  const [callsCount, setCallsCount] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [meetingsMade, setMeetingsMade] = useState(0);

  const [bookingProject, setBookingProject] = useState('');
  const [bookingCustomer, setBookingCustomer] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingAmount, setBookingAmount] = useState('');
  const [bookingCount, setBookingCount] = useState(1);

  const [transProject, setTransProject] = useState('');
  const [transUnit, setTransUnit] = useState('');
  const [transCustomer, setTransCustomer] = useState('');
  const [transPhone, setTransPhone] = useState('');
  const [transValue, setTransValue] = useState('');

  const handleSave = () => {
    if (activeTab === 'activity') {
      dataHook.addActivity({ postsCount, callsCount, newLeads, meetingsMade });
      setPostsCount(0); setCallsCount(0); setNewLeads(0); setMeetingsMade(0);
    } else if (activeTab === 'booking') {
      const amountStr = bookingAmount.replace(/\\D/g, '');
      dataHook.addBooking({ project: bookingProject, customerName: bookingCustomer, customerPhone: bookingPhone, bookingAmount: Number(amountStr) || 0, bookingCount });
      setBookingProject(''); setBookingCustomer(''); setBookingPhone(''); setBookingAmount(''); setBookingCount(1);
    } else if (activeTab === 'transaction') {
      dataHook.addTransaction({
        project: transProject, unitCode: transUnit, customerName: transCustomer, customerPhone: transPhone, transactionValue: Number(transValue) || 0, status: 'PENDING_DEPOSIT'
      });
      setTransProject(''); setTransUnit(''); setTransCustomer(''); setTransPhone(''); setTransValue('');
    }
    onClose();
  };

  const inputStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderRadius: 12, padding: 14, fontSize: 16, color: cText,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    marginBottom: 16
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: Platform.OS === 'web' ? 'flex-end' : 'center' }}>
        <View style={{ 
          width: Platform.OS === 'web' ? 480 : '100%', 
          height: Platform.OS === 'web' ? '100%' : '80%', 
          backgroundColor: isDark ? theme.colors.background : '#fff',
          borderTopLeftRadius: 32, borderTopRightRadius: Platform.OS === 'web' ? 0 : 32,
          padding: 32,
          boxShadow: '-10px 0 40px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: '900', color: cText }}>Nhập Báo Cáo Nhanh</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderRadius: 20 }}>
              <X size={20} color={cText} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 20, padding: 6, marginBottom: 24 }}>
            {[
              { id: 'activity', label: 'Hoạt Động', icon: Activity },
              { id: 'booking', label: 'Booking', icon: Bookmark },
              { id: 'transaction', label: 'Giao Dịch', icon: Tag }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id as any)} 
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 16, backgroundColor: activeTab === tab.id ? (isDark ? '#3b82f6' : '#fff') : 'transparent', shadowOpacity: activeTab === tab.id && !isDark ? 0.05 : 0 }}
                >
                  <Icon size={16} color={activeTab === tab.id ? (isDark ? '#fff' : '#0f172a') : '#64748b'} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === tab.id ? (isDark ? '#fff' : '#0f172a') : '#64748b' }}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Form Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {activeTab === 'activity' && (
              <View style={{ gap: 20 }}>
                <SGPlanningNumberField value={postsCount} onChangeValue={setPostsCount} label="SỐ BÀI ĐĂNG (Social/Ads)" max={100} />
                <SGPlanningNumberField value={callsCount} onChangeValue={setCallsCount} label="SỐ CUỘC GỌI" max={500} />
                <SGPlanningNumberField value={newLeads} onChangeValue={setNewLeads} label="SỐ KHÁCH MỚI QUAN TÂM (Leads)" max={100} />
                <SGPlanningNumberField value={meetingsMade} onChangeValue={setMeetingsMade} label="SỐ LỊCH HẸN TRONG NGÀY" max={50} />
              </View>
            )}

            {activeTab === 'booking' && (
              <View>
                <TextInput style={inputStyle} placeholder="Dự án (VD: Vinhomes Ocean Park...)" placeholderTextColor="#94a3b8" value={bookingProject} onChangeText={setBookingProject} />
                <TextInput style={inputStyle} placeholder="Tên khách hàng" placeholderTextColor="#94a3b8" value={bookingCustomer} onChangeText={setBookingCustomer} />
                <TextInput style={inputStyle} placeholder="Số điện thoại" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={bookingPhone} onChangeText={setBookingPhone} />
                <TextInput 
                  style={inputStyle} 
                  placeholder="Số tiền giữ chỗ (VD: 50.000.000)" 
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
                <View style={{ marginTop: 8 }}>
                  <SGPlanningNumberField value={bookingCount} onChangeValue={setBookingCount} label="SỐ LƯỢNG GIỮ CHỖ" max={10} min={1} />
                </View>
              </View>
            )}

            {activeTab === 'transaction' && (
              <View>
                <TextInput style={inputStyle} placeholder="Dự án..." placeholderTextColor="#94a3b8" value={transProject} onChangeText={setTransProject} />
                <TextInput style={inputStyle} placeholder="Mã Căn (1 mã duy nhất) VD: S4.02-1205" placeholderTextColor="#94a3b8" value={transUnit} onChangeText={setTransUnit} />
                <TextInput style={inputStyle} placeholder="Tên khách hàng" placeholderTextColor="#94a3b8" value={transCustomer} onChangeText={setTransCustomer} />
                <TextInput style={inputStyle} placeholder="Số điện thoại" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={transPhone} onChangeText={setTransPhone} />
                <TextInput style={inputStyle} placeholder="Giá trị giao dịch (Tỷ VND). VD: 4.5" placeholderTextColor="#94a3b8" keyboardType="numeric" value={transValue} onChangeText={setTransValue} />
              </View>
            )}
          </ScrollView>

          {/* Action */}
          <View style={{ position: 'absolute', bottom: 32, left: 32, right: 32 }}>
            <SGButton 
              title="LƯU BÁO CÁO" 
              icon={Save as any} 
              onPress={handleSave} 
              style={{ backgroundColor: '#3b82f6', borderRadius: 16, height: 56 }} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
