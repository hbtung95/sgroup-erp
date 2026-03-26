import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Search, Filter, Layers, Clock, CheckCircle, Tag, X, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../../shared/theme/theme';
import { SGButton, SGPlanningSectionTitle } from '../../../../../shared/ui/components';
import { useInventoryData, type PropertyUnit, type UnitStatus } from '../../../hooks/useInventoryData';
import { SGDepositModal } from '../../../components/forms/SGDepositModal';

const STATUS_COLORS: Record<UnitStatus, { bg: string, text: string, border: string, label: string }> = {
  AVAILABLE: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0', label: 'CÒN TRỐNG' },
  LOCKED: { bg: '#fef9c3', text: '#ca8a04', border: '#fef08a', label: 'ĐANG GIỮ CHỖ' },
  BOOKED: { bg: '#fef08a', text: '#b45309', border: '#fde047', label: 'ĐÃ GIỮ CHỖ' },
  PENDING_DEPOSIT: { bg: '#fef9c3', text: '#ca8a04', border: '#fef08a', label: 'CHỜ PHÊ DUYỆT' },
  DEPOSIT: { bg: '#ffedd5', text: '#ea580c', border: '#fed7aa', label: 'ĐÃ ĐẶT CỌC' },
  SOLD: { bg: '#fee2e2', text: '#dc2626', border: '#fecaca', label: 'ĐÃ BÁN (HĐMB)' },
  WAITING_CONTRACT: { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd', label: 'CHỜ HĐMB' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', border: '#bbf7d0', label: 'HOÀN TẤT' }
};

export function InventoryScreen() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const { units, selectedProject, stats, lockUnit, requestDeposit, isLoading } = useInventoryData();

  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Group units by block and floor for grid rendering
  const inventoryGrid = useMemo(() => {
    const grid: Record<string, Record<number, PropertyUnit[]>> = {};
    units.forEach(u => {
      if (!grid[u.block]) grid[u.block] = {};
      if (!grid[u.block][u.floor]) grid[u.block][u.floor] = [];
      grid[u.block][u.floor].push(u);
    });
    // Sort logic can be applied here
    return grid;
  }, [units]);

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt, flexDirection: 'row' }}>
      {/* ── Main Inventory Area ── */}
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 4 }}>Quản lý Giỏ Hàng</Text>
              <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>{selectedProject}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff', padding: 4, borderRadius: 12, borderWidth: 1, borderColor: isDark ? 'transparent' : '#e2e8f0' }}>
                <View style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: isDark ? '#3b82f6' : '#eff6ff', borderRadius: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#fff' : '#2563eb' }}>Căn Hộ</Text>
                </View>
                <View style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8' }}>Biệt Thự</Text>
                </View>
              </View>
              <SGButton icon={Filter as any} title="Lọc Căn" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderRadius: 12, paddingHorizontal: 16 }} />
            </View>
          </View>

          {/* Stats Bar */}
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
            {[
              { id: 'av', label: 'CÒN TRỐNG', value: stats.available, color: '#16a34a', bg: '#dcfce7' },
              { id: 'bk', label: 'ĐANG GIỮ CHỖ', value: stats.booked, color: '#ca8a04', bg: '#fef9c3' },
              { id: 'dp', label: 'ĐÃ ĐẶT CỌC', value: stats.deposit, color: '#ea580c', bg: '#ffedd5' },
              { id: 'sd', label: 'ĐÃ BÁN', value: stats.sold, color: '#dc2626', bg: '#fee2e2' },
            ].map(s => (
              <View key={s.id} style={{ flex: 1, minWidth: 160, flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : s.bg, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : `${s.color}20` }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: s.color, marginRight: 12 }} />
                <View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: isDark ? cText : s.color }}>{s.value}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#94a3b8' : `${s.color}90`, marginTop: 2 }}>{s.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Grid Render */}
          {Object.keys(inventoryGrid).map(block => (
            <View key={block} style={[cardStyle, { gap: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Layers size={24} color="#3b82f6" />
                <Text style={{ fontSize: 20, fontWeight: '800', color: cText }}>TÒA {block}</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                <View style={{ gap: 8 }}>
                  {Object.keys(inventoryGrid[block]).sort((a, b) => Number(b) - Number(a)).map(floor => (
                    <View key={floor} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#94a3b8' }}>T{floor}</Text>
                      </View>
                      
                      {inventoryGrid[block][Number(floor)].sort((a,b) => a.code.localeCompare(b.code)).map(unit => {
                        const st = STATUS_COLORS[unit.status];
                        const isSelected = selectedUnit?.id === unit.id;
                        return (
                          <TouchableOpacity 
                            key={unit.id} 
                            onPress={() => setSelectedUnit(unit)}
                            style={{ 
                              width: 80, height: 56, borderRadius: 10, 
                              backgroundColor: isDark ? `${st.bg}15` : st.bg,
                              borderColor: isSelected ? (isDark ? '#fff' : '#000') : (isDark ? `${st.text}30` : st.border),
                              borderWidth: isSelected ? 2 : 1,
                              alignItems: 'center', justifyContent: 'center',
                              ...(isSelected && Platform.OS === 'web' ? { boxShadow: `0 0 0 4px ${st.text}20` } : {})
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '800', color: isDark ? `${st.text}EE` : st.text }}>{unit.code.split('-')[1]}</Text>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: isDark ? `${st.text}90` : `${st.text}90`, marginTop: 2 }}>
                              {unit.area}m<Text style={{ fontSize: 8 }}>2</Text>
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── Slide Panel (Right Side) ── */}
      {selectedUnit && (
        <View style={{ 
          width: 380, backgroundColor: isDark ? 'rgba(20,24,35,0.95)' : '#fff',
          borderLeftWidth: 1, borderLeftColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
          padding: 32,
          ...(Platform.OS === 'web' ? { boxShadow: '-10px 0 40px rgba(0,0,0,0.05)', zIndex: 10 } : {})
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>Chi tiết Căn</Text>
            <TouchableOpacity onPress={() => setSelectedUnit(null)} style={{ padding: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderRadius: 20 }}>
              <X size={20} color={cText} />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 32 }}>
             <View style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: STATUS_COLORS[selectedUnit.status].bg, borderWidth: 1, borderColor: STATUS_COLORS[selectedUnit.status].border, marginBottom: 16 }}>
               <Text style={{ fontSize: 12, fontWeight: '800', color: STATUS_COLORS[selectedUnit.status].text }}>{STATUS_COLORS[selectedUnit.status].label}</Text>
             </View>
             <Text style={{ fontSize: 42, fontWeight: '900', color: cText, letterSpacing: -1 }}>{selectedUnit.code}</Text>
             <Text style={{ fontSize: 16, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Tầng {selectedUnit.floor} • Tòa {selectedUnit.block}</Text>
          </View>

          <View style={{ gap: 16, marginBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
               <Text style={{ fontSize: 15, fontWeight: '600', color: cSub }}>Diện tích thông thủy</Text>
               <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{selectedUnit.area} m²</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
               <Text style={{ fontSize: 15, fontWeight: '600', color: cSub }}>Cấu trúc</Text>
               <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{selectedUnit.bedrooms} Phòng ngủ</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
               <Text style={{ fontSize: 15, fontWeight: '600', color: cSub }}>Hướng ban công</Text>
               <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{selectedUnit.direction}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8 }}>
               <Text style={{ fontSize: 16, fontWeight: '700', color: cSub }}>Giá bán dự kiến</Text>
               <Text style={{ fontSize: 24, fontWeight: '900', color: '#10b981' }}>{selectedUnit.price} <Text style={{ fontSize: 16, fontWeight: '700' }}>Tỷ</Text></Text>
            </View>
          </View>

          {selectedUnit.status === 'AVAILABLE' && (
            <View style={{ gap: 12 }}>
              <SGButton 
                title="Đăng Ký Đặt Cọc" 
                icon={CheckCircle as any} 
                onPress={() => setShowDepositModal(true)} 
                style={{ backgroundColor: '#ea580c', borderRadius: 16, height: 56 }} 
              />
              <SGButton 
                title="Khóa Căn & Giữ Chỗ" 
                icon={Lock as any} 
                onPress={() => {
                  lockUnit(selectedUnit.id, "Sale SGROUP");
                  setSelectedUnit(null);
                }} 
                style={{ backgroundColor: '#3b82f6', borderRadius: 16, height: 56 }} 
              />
            </View>
          )}

          {selectedUnit.status === 'BOOKED' && selectedUnit.lockedUntil && (
            <View style={{ backgroundColor: '#fef9c3', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fef08a' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                 <Clock size={16} color="#b45309" />
                 <Text style={{ fontSize: 14, fontWeight: '800', color: '#b45309' }}>Đang giữ chỗ</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#ca8a04', marginBottom: 4 }}>Bởi: {selectedUnit.bookedBy}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#ca8a04' }}>Hết hạn: {selectedUnit.lockedUntil.toLocaleTimeString('vi-VN')}</Text>
            </View>
          )}

        </View>
      )}

      {/* ── Modals ── */}
      {showDepositModal && (
        <SGDepositModal 
          visible={showDepositModal} 
          unit={selectedUnit} 
          onClose={() => setShowDepositModal(false)}
          onSubmit={(name: string, phone: string) => {
            if (selectedUnit) {
              requestDeposit(selectedUnit.id, name, phone);
              setSelectedUnit(null);
              setShowDepositModal(false);
            }
          }}
        />
      )}
    </View>
  );
}
