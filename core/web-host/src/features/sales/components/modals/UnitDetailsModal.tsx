import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { X, Building2, MapPin, Maximize, DollarSign, BedDouble, Compass, Activity } from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { SGButton } from '@sgroup/ui/src/ui/components';
import type { PropertyUnit } from '../../store/useSalesStore';

type UnitDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  unit: PropertyUnit | null;
  onSelectUnit?: (unit: PropertyUnit) => void;
};

export function UnitDetailsModal({ visible, onClose, unit, onSelectUnit }: UnitDetailsModalProps) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  if (!unit) return null;

  const getStatusColor = (status: PropertyUnit['status']) => {
    switch (status) {
      case 'AVAILABLE': return '#10b981'; // Green
      case 'LOCKED': return '#f59e0b'; // Orange
      case 'SOLD': return '#ef4444'; // Red
      default: return '#94a3b8'; // Gray
    }
  };

  const getStatusLabel = (status: PropertyUnit['status']) => {
    switch (status) {
      case 'AVAILABLE': return 'TRỐNG';
      case 'LOCKED': return 'GIỮ CHỖ';
      case 'SOLD': return 'ĐÃ BÁN';
      default: return status;
    }
  };

  const statusColor = getStatusColor(unit.status);

  const InfoRow = ({ icon: Icon, label, value, valueColor }: { icon: any, label: string, value: string | number, valueColor?: string }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={isDark ? '#cbd5e1' : '#64748b'} />
        </View>
        <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: '800', color: valueColor || cText, letterSpacing: -0.2 }}>{value}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ 
          width: '100%', maxWidth: 440,
          backgroundColor: isDark ? theme.colors.background : '#fff',
          borderRadius: 24, padding: 28,
          ...(Platform.OS === 'web' ? {
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          } : {
            shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10
          })
        } as any}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor }} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: statusColor, letterSpacing: 0.5 }}>{getStatusLabel(unit.status)}</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>{unit.code}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 4 }}>Dự án: {unit.project}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderRadius: 20 }}>
              <X size={20} color={cText} />
            </TouchableOpacity>
          </View>

          {/* Details */}
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: 16, padding: 16 }}>
              <InfoRow icon={Building2} label="Phân khu / Block" value={`${unit.block} - Tầng ${unit.floor}`} />
              <InfoRow icon={Maximize} label="Diện tích" value={`${unit.area} m²`} />
              <InfoRow icon={BedDouble} label="Phòng ngủ" value={unit.bedrooms || '-'} />
              <InfoRow icon={Compass} label="Hướng" value={unit.direction || '-'} />
              <InfoRow icon={DollarSign} label="Giá trị" value={`${unit.price} Tỷ VNĐ`} valueColor="#10b981" />
            </View>
          </ScrollView>

          {/* Action */}
          {onSelectUnit && unit.status === 'AVAILABLE' && (
            <View style={{ marginTop: 24, flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <SGButton 
                  title="Chọn Căn Mở Cọc" 
                  onPress={() => {
                    onSelectUnit(unit);
                    onClose();
                  }} 
                  style={{ backgroundColor: '#10b981', borderRadius: 16, height: 50 }} 
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
