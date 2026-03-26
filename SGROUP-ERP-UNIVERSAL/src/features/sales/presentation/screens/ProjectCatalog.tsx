/**
 * ProjectCatalog — Quản lý Dự án BĐS
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Building, Plus, MapPin, Home } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGCard } from '../../../../shared/ui/components';
import type { SalesRole } from '../../SalesSidebar';
import { useGetProjects } from '../../hooks/useSalesOps';

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function ProjectCatalog({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const canEdit = userRole === 'sales_director' || userRole === 'sales_admin';

  const { data: rawProjects, isLoading } = useGetProjects({ status: 'ACTIVE' });
  const projects = (rawProjects || []).map((p: any) => ({
    id: p.id, code: p.projectCode || '', name: p.name || '', developer: p.developer || '',
    location: p.location || '', type: p.type || '', feeRate: p.feeRate ?? 0,
    avgPrice: p.avgPrice ?? 0, totalUnits: p.totalUnits ?? 0, soldUnits: p.soldUnits ?? 0,
    status: p.status || 'ACTIVE',
  }));
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#22c55e20', alignItems: 'center', justifyContent: 'center' }}>
              <Building size={22} color="#22c55e" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Dự Án BĐS</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>{projects.length} dự án đang bán</Text>
            </View>
          </View>
          {canEdit && <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}>
            <Plus size={16} color="#fff" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>THÊM DỰ ÁN</Text>
          </Pressable>}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center', width: '100%' }}><ActivityIndicator size="large" color="#22c55e" /></View>
          ) : projects.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center', width: '100%' }}><Text style={{ fontSize: 40, marginBottom: 12 }}>🏢</Text><Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có dự án nào</Text></View>
          ) : null}
          {projects.map((p: any) => {
            const soldPct = p.totalUnits > 0 ? Math.round((p.soldUnits / p.totalUnits) * 100) : 0;
            const remaining = p.totalUnits - p.soldUnits;
            return (
              <SGCard variant="glass" key={p.id} style={{ flex: 1, minWidth: 340, padding: 28 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>{p.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <MapPin size={12} color={cSub} />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>{p.location} · {p.developer}</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: '#3b82f620', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#3b82f6' }}>{p.type}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: cSub }}>PHÍ MG</Text>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#8b5cf6', marginTop: 4 }}>{p.feeRate}%</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: cSub }}>GIÁ TB</Text>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: cText, marginTop: 4 }}>{p.avgPrice} Tỷ</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: cSub }}>CÒN LẠI</Text>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#f59e0b', marginTop: 4 }}>{fmt(remaining)}</Text>
                  </View>
                </View>

                {/* Inventory Progress */}
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: cSub }}>Tiến độ bán hàng</Text>
                    <Text style={{ fontSize: 12, fontWeight: '900', color: '#22c55e' }}>{soldPct}%</Text>
                  </View>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', overflow: 'hidden' }}>
                    <View style={{ width: `${soldPct}%`, height: '100%', borderRadius: 4, backgroundColor: soldPct > 80 ? '#22c55e' : soldPct > 50 ? '#3b82f6' : '#f59e0b' }} />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: cSub, marginTop: 6 }}>
                    {fmt(p.soldUnits)} / {fmt(p.totalUnits)} căn đã bán
                  </Text>
                </View>
              </SGCard>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
