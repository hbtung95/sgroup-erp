import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Info, Building2 } from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import type { PropertyUnit } from '../../store/useSalesStore';

type UnitMatrixProps = {
  units: PropertyUnit[];
  onSelectUnit: (unit: PropertyUnit) => void;
  onViewDetails: (unit: PropertyUnit) => void;
  selectedProjectName: string;
};

export function UnitMatrix({ units, onSelectUnit, onViewDetails, selectedProjectName }: UnitMatrixProps) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  // Group by block, then by floor
  const matrixData = useMemo(() => {
    const data: Record<string, Record<string, PropertyUnit[]>> = {};
    
    units.forEach(unit => {
      const b = unit.block || 'Khác';
      const f = unit.floor?.toString() || 'Khác';
      
      if (!data[b]) data[b] = {};
      if (!data[b][f]) data[b][f] = [];
      
      data[b][f].push(unit);
    });

    // Sort blocks and floors
    const sortedData: { block: string, floors: { floor: string, units: PropertyUnit[] }[] }[] = [];
    Object.keys(data).sort().forEach(block => {
      const floorsObj = data[block];
      const sortedFloors = Object.keys(floorsObj)
        .sort((a, b) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          if (!isNaN(numA) && !isNaN(numB)) return numB - numA; // Descending floors
          return b.localeCompare(a);
        })
        .map(floor => ({
          floor,
          units: floorsObj[floor].sort((u1, u2) => u1.code.localeCompare(u2.code))
        }));
      sortedData.push({ block, floors: sortedFloors });
    });

    return sortedData;
  }, [units]);

  const getStatusColor = (status: PropertyUnit['status']) => {
    switch (status) {
      case 'AVAILABLE': return { bg: isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5', border: '#10b981', text: '#059669' };
      case 'LOCKED': return { bg: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb', border: '#f59e0b', text: '#d97706' };
      case 'SOLD': return { bg: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2', border: '#ef4444', text: '#dc2626' };
      default: return { bg: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', border: '#cbd5e1', text: '#64748b' };
    }
  };

  if (units.length === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
        <Building2 size={56} color={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#94a3b8' }}>Không có dữ liệu giỏ hàng cho dự án này</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Legend */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20, padding: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderRadius: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: cText, marginRight: 8 }}>CHÚ THÍCH TRẠNG THÁI:</Text>
        {[
          { label: 'TRỐNG', color: '#10b981' },
          { label: 'GIỮ CHỖ', color: '#f59e0b' },
          { label: 'ĐẶT CỌC', color: '#3b82f6' },
          { label: 'ĐÃ BÁN', color: '#ef4444' }
        ].map(item => (
          <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: item.color }} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: 800 }}>
          {matrixData.map((blockData) => (
            <View key={blockData.block} style={{ marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', paddingBottom: 8 }}>
                <Building2 size={20} color="#ea580c" />
                <Text style={{ fontSize: 18, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Block: {blockData.block}</Text>
              </View>

              <View style={{ gap: 12 }}>
                {blockData.floors.map((floorData) => (
                  <View key={floorData.floor} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    {/* Floor Label */}
                    <View style={{ width: 60, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 12 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: cSub, textTransform: 'uppercase' }}>TẦNG</Text>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: cText }}>{floorData.floor}</Text>
                    </View>

                    {/* Units Row */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                      {floorData.units.map(unit => {
                        const colors = getStatusColor(unit.status);
                        
                        return (
                          <View key={unit.id} style={{
                            width: 100, height: 80,
                            backgroundColor: colors.bg,
                            borderWidth: 2, borderColor: colors.border,
                            borderRadius: 12,
                            overflow: 'hidden',
                            ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' } : {})
                          }}>
                            {/* Tap target for whole cell (if available) */}
                            <TouchableOpacity 
                              disabled={unit.status !== 'AVAILABLE'}
                              onPress={() => onSelectUnit(unit)}
                              style={{ flex: 1, padding: 8, justifyContent: 'center', alignItems: 'center' }}
                            >
                              <Text style={{ fontSize: 14, fontWeight: '900', color: colors.text, textAlign: 'center', marginBottom: 4 }} numberOfLines={1}>{unit.code}</Text>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text, opacity: 0.8 }}>{unit.price} Tỷ</Text>
                            </TouchableOpacity>
                            
                            {/* Info Button Top Right */}
                            <TouchableOpacity 
                              onPress={() => onViewDetails(unit)}
                              style={{ position: 'absolute', top: 4, right: 4, padding: 4, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 12 }}
                            >
                              <Info size={14} color="#475569" />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
