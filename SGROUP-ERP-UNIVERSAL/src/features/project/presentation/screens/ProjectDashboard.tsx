import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Building, Users, FileText, CheckSquare, Target, Activity, CheckCircle2 } from 'lucide-react-native';
import { useGetProjects } from '../../application/hooks/useProjectQueries';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { SGCard, SGPlanningSectionTitle } from '../../../../shared/ui/components';

export const ProjectDashboard = () => {
  const { data: projects, isLoading } = useGetProjects();
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (!projects) return { totalProjects: 0, activeProjects: 0, totalUnits: 0, soldUnits: 0 };
    return projects.reduce((acc: any, p: any) => {
      acc.totalProjects++;
      if (p.status === 'ACTIVE') acc.activeProjects++;
      acc.totalUnits += (p.totalUnits || 0);
      acc.soldUnits += (p.soldUnits || 0);
      return acc;
    }, { totalProjects: 0, activeProjects: 0, totalUnits: 0, soldUnits: 0 });
  }, [projects]);

  const salesPct = kpis.totalUnits > 0 ? Math.round((kpis.soldUnits / kpis.totalUnits) * 100) : 0;

  const cardStyle = {
    backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.85)',
    borderRadius: 24, padding: 24, borderWidth: 1, 
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.04)' } : { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 }),
  } as any;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* HERO HEADER */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <LinearGradient 
            colors={isDark ? ['#059669', '#047857'] : ['#34d399', '#10b981']} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} 
            style={styles.heroIconBox}
          >
            <Building size={32} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -0.8 }}>
              TỔNG QUAN DỰ ÁN
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: cSub, marginTop: 4 }}>
              Trung tâm kiểm soát Master Data toàn hệ thống SGROUP
            </Text>
          </View>
        </View>

        {/* KPI CARDS */}
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#10b981" /><Text style={{ color: cSub, marginTop: 12, fontWeight: '600' }}>Đang tổng hợp dữ liệu...</Text></View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
            {[
              { label: 'TỔNG DỰ ÁN', value: kpis.totalProjects, unit: 'DA', color: '#3b82f6', grad: ['#60a5fa', '#2563eb'], icon: Target },
              { label: 'ĐANG MỞ BÁN', value: kpis.activeProjects, unit: 'DA', color: '#10b981', grad: ['#34d399', '#059669'], icon: Activity },
              { label: 'TỔNG SẢN PHẨM', value: kpis.totalUnits.toLocaleString('vi-VN'), unit: 'Căn', color: '#8b5cf6', grad: ['#a78bfa', '#7c3aed'], icon: Building },
              { label: 'ĐÃ TIÊU THỤ', value: kpis.soldUnits.toLocaleString('vi-VN'), unit: `Căn (${salesPct}%)`, color: '#f59e0b', grad: ['#fbbf24', '#d97706'], icon: CheckCircle2 },
            ].map((k, i) => (
              <View key={i} style={[cardStyle, { flex: 1, minWidth: 200, padding: 24 }]}>
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                  <LinearGradient colors={k.grad as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.kpiIconBox}>
                    <k.icon size={22} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                  <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>{k.value}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#94a3b8' }}>{k.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* MAIN SPLIT */}
        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          
          {/* QUICK ACCESS */}
          <View style={[cardStyle, { flex: 1, minWidth: 320 }]}>
            <SGPlanningSectionTitle 
              icon={Target} title="Công Cụ Quản Lý Nhanh" accent="#10b981" badgeText="QUICK ACCESS" style={{ marginBottom: 24 }}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              {[
                { label: 'Bảng Hàng', desc: 'Quản lý Inventory', icon: Building, color: '#10b981' },
                { label: 'Pháp Lý', desc: 'Hồ sơ 1/500, GPXD', icon: FileText, color: '#3b82f6' },
                { label: 'Chính Sách', desc: 'Chiết khấu & Thanh toán', icon: CheckSquare, color: '#8b5cf6' },
                { label: 'Phân Bổ', desc: 'Giao Target sàn', icon: Users, color: '#f59e0b' },
              ].map((item, i) => (
                <TouchableOpacity key={i} style={[styles.quickMenuItem, { 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' 
                }]}>
                  <View style={[styles.quickIconBg, { backgroundColor: item.color + '20' }]}>
                    <item.icon size={28} color={item.color} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{item.label}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: cSub, marginTop: 2 }}>{item.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* RECENT PROJECTS */}
          <View style={[cardStyle, { flex: 1.5, minWidth: 400 }]}>
            <SGPlanningSectionTitle 
              icon={Activity} title="Dự Án Mới Cập Nhật" accent="#3b82f6" badgeText="RECENT UPDATES" style={{ marginBottom: 24 }}
            />
            {projects?.slice(0, 5).map((p: any) => {
               const pPct = p.totalUnits ? Math.round(((p.soldUnits || 0) / p.totalUnits) * 100) : 0;
               return (
                 <View key={p.id} style={[styles.recentProjectRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]}>
                   <View style={{ flex: 1 }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{p.name}</Text>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: p.status === 'ACTIVE' ? '#10b98120' : '#f59e0b20' }}>
                          <Text style={{ fontSize: 10, fontWeight: '900', color: p.status === 'ACTIVE' ? '#10b981' : '#f59e0b', letterSpacing: 0.5 }}>{p.status}</Text>
                        </View>
                     </View>
                     <Text style={{ fontSize: 13, color: cSub, fontWeight: '600', marginTop: 6 }}>{p.location || 'Chưa cập nhật VT'} • CĐT: {p.developer || 'N/A'}</Text>
                   </View>
                   <View style={{ width: 140 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>Tiến độ giỏ hàng</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#3b82f6' }}>{pPct}%</Text>
                      </View>
                      <View style={{ height: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', borderRadius: 4 }}>
                        <View style={{ width: `${pPct}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 }} />
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', marginTop: 4, textAlign: 'right' }}>{p.soldUnits || 0} / {p.totalUnits || 0}</Text>
                   </View>
                 </View>
               );
            })}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroIconBox: { 
    width: 64, height: 64, borderRadius: 22, 
    alignItems: 'center', justifyContent: 'center', 
    shadowColor: '#10b981', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 
  },
  kpiIconBox: { 
    width: 48, height: 48, borderRadius: 16, 
    alignItems: 'center', justifyContent: 'center', 
    shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 
  },
  quickMenuItem: {
    width: '47%', flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 20, borderWidth: 1,
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s', cursor: 'pointer', ':hover': { transform: 'translateY(-2px)' } } as any : {})
  },
  quickIconBg: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  recentProjectRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1 },
});
