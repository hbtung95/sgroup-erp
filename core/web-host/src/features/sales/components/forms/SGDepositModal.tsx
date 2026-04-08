import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Modal, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { sgds } from '@sgroup/ui/src/theme/theme';
import { SGButton } from '@sgroup/ui/src/ui/components';
import { PropertyUnit } from '../../store/useSalesStore';

type SGDepositModalProps = {
  visible: boolean;
  onClose: () => void;
  unit: PropertyUnit | null;
  onSubmit: (customerName: string, customerPhone: string) => void;
};

export function SGDepositModal({ visible, onClose, unit, onSubmit }: SGDepositModalProps) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setCustomerName('');
      setCustomerPhone('');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin Khách Hàng');
      return;
    }
    onSubmit(customerName, customerPhone);
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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ 
          width: Platform.OS === 'web' ? 480 : '90%', 
          backgroundColor: isDark ? theme.colors.background : '#fff',
          borderRadius: 32,
          padding: 32,
          boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)'
        } as any}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: cText }}>Đăng Ký Đặt Cọc</Text>
              {unit && <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginTop: 4 }}>
                Căn hộ {unit.code} • {unit.project}
              </Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderRadius: 20 }}>
              <X size={20} color={cText} />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Thông tin khách hàng</Text>
            <TextInput 
              style={inputStyle} 
              placeholder="Tên khách hàng (VD: Nguyễn Văn A)" 
              placeholderTextColor="#94a3b8" 
              value={customerName} 
              onChangeText={setCustomerName} 
            />
            <TextInput 
              style={inputStyle} 
              placeholder="Số điện thoại" 
              placeholderTextColor="#94a3b8" 
              keyboardType="phone-pad" 
              value={customerPhone} 
              onChangeText={setCustomerPhone} 
            />
          </ScrollView>

          {/* Action */}
          <View style={{ marginTop: 12 }}>
            <SGButton 
              title="GỬI YÊU CẦU PHÊ DUYỆT" 
              icon={Send as any} 
              onPress={handleSubmit} 
              style={{ backgroundColor: '#ea580c', borderRadius: 16, height: 56 }} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
