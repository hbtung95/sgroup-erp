import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { CheckCircle2, LayoutGrid, HardHat } from 'lucide-react-native';

import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGPlanningNumberField, SGPlanningSectionTitle } from '../../../shared/ui/components';
import { SGActionBar } from '../../../shared/ui/components/SGScenarioBar';
import { useGetLatestPlan, useSavePlanMutation } from '../hooks/useExecPlanning';

type ScenarioKey = 'BASE' | 'OPTIMISTIC' | 'PESSIMISTIC';

type ProjectItem = {
  name: string; units: number; price: number; targetSold: number; cost: number;
  risk: 'Thấp' | 'Trung bình' | 'Cao';
};

const DEFAULT_PROJECTS: ProjectItem[] = [];

const SCENARIOS: Array<{ key: ScenarioKey; label: string; color: string }> = [
  { key: 'BASE', label: 'Thực tế', color: '#0EA5E9' },
  { key: 'OPTIMISTIC', label: 'Lạc quan', color: '#22C55E' },
  { key: 'PESSIMISTIC', label: 'Thận trọng', color: '#F59E0B' },
];

const RISK_COLORS: Record<ProjectItem['risk'], string> = {
  Thấp: '#22C55E', 'Trung bình': '#F59E0B', Cao: '#EF4444',
};

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function PlanProject() {
  const { theme, isDark } = useAppTheme();
  const [scenario, setScenario] = useState<ScenarioKey>('BASE');
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);

  const { data: serverPlan, isLoading: isLoadingPlan } = useGetLatestPlan({
    year: 2026, scenario, tab: 'PLAN_PROJECT',
  });

  const saveMutation = useSavePlanMutation();

  useEffect(() => {
    if (serverPlan?.data) setProjects(serverPlan.data.projects || serverPlan.data || DEFAULT_PROJECTS);
    else if (serverPlan) setProjects(serverPlan.projects || serverPlan || DEFAULT_PROJECTS);
  }, [serverPlan]);

  const totals = useMemo(() => {
    const totalUnits = projects.reduce((sum, item) => sum + item.units, 0);
    const totalGMV = projects.reduce((sum, item) => sum + item.units * item.price * (item.targetSold / 100), 0);
    const totalCost = projects.reduce((sum, item) => sum + item.cost, 0);
    return { totalUnits, totalGMV: Math.round(totalGMV), totalCost };
  }, [projects]);

  const updateItem = (index: number, key: keyof ProjectItem, value: any) => {
    setProjects(p => {
      const next = [...p];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cBorder = theme.colors.borderSubtle;

  const card: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 28, padding: 32,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px) saturate(180%)', WebkitBackdropFilter: 'blur(32px) saturate(180%)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: cBorder, flexWrap: 'wrap', gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <HardHat size={20} color={theme.colors.accentBlue} />
          <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase' }}>KẾ HOẠCH DỰ ÁN 2026</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SCENARIOS.map((sc) => (
            <Pressable key={sc.key} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: scenario === sc.key ? sc.color + '22' : 'transparent' }} onPress={() => setScenario(sc.key)}>
              <Text style={{ fontSize: 12, fontWeight: scenario === sc.key ? '800' : '600', color: scenario === sc.key ? sc.color : theme.colors.textTertiary }}>{sc.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {[
            { label: 'TỔNG SẢN PHẨM', value: fmt(totals.totalUnits), unit: 'SP', color: '#A855F7' },
            { label: 'GMV DỰ KIẾN', value: fmt(totals.totalGMV), unit: 'Tỷ', color: '#6366F1' },
            { label: 'CHI PHÍ DỰ ÁN', value: fmt(totals.totalCost), unit: 'Tỷ', color: '#F59E0B' },
            { label: 'SỐ DỰ ÁN', value: projects.length, unit: 'DA', color: '#0EA5E9' },
          ].map((item) => (
            <View key={item.label} style={{ flex: 1, minWidth: 200, padding: 24, borderRadius: 24, backgroundColor: isDark ? `${item.color}10` : `${item.color}05`, borderWidth: 1, borderColor: isDark ? `${item.color}20` : `${item.color}10`, alignItems: 'center' }}>
              <Text style={{ ...sgds.typo.label, color: item.color, marginBottom: 8, fontWeight: '900' }}>{item.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 28, fontWeight: '900', color: cText }}>{item.value}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>{item.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={card}>
          <SGPlanningSectionTitle icon={LayoutGrid} title="1. DANH MỤC DỰ ÁN" accent="#a855f7" />
          {projects.map((item, index) => (
            <View key={item.name} style={{ borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8f9fa' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: cText }}>{item.name}</Text>
                <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, backgroundColor: `${RISK_COLORS[item.risk]}15` }}>
                  <Text style={{ fontSize: 10, fontWeight: '900', color: RISK_COLORS[item.risk] }}>RỦI RO: {item.risk.toUpperCase()}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {[
                  { label: 'Sản phẩm', key: 'units' as const, unit: 'SP' },
                  { label: 'Giá TB', key: 'price' as const, unit: 'Tỷ' },
                  { label: 'Bán (%)', key: 'targetSold' as const, unit: '%' },
                  { label: 'Chi phí', key: 'cost' as const, unit: 'Tỷ' },
                ].map((f) => (
                  <View key={f.key} style={{ flex: 1, minWidth: 140 }}>
                    <SGPlanningNumberField
                      label={f.label}
                      value={item[f.key]}
                      onChangeValue={(v) => updateItem(index, f.key, v)}
                      unit={f.unit}
                      compact
                      hideBorder
                    />
                  </View>
                ))}
              </View>

              <View style={{ marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: isDark ? '#6366F110' : '#eef2ff', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: isDark ? '#6366F120' : '#6366f115' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#6366F1' }}>
                  GMV DỰ KIẾN: <Text style={{ fontSize: 15, fontWeight: '900' }}>{fmt(Math.round(item.units * item.price * (item.targetSold / 100)))}</Text> Tỷ
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <SGActionBar
          onSave={() => {}}
          onPublish={() => saveMutation.mutate({ year: 2026, scenario: scenario, tab: 'PLAN_PROJECT', data: { projects }, userId: 'admin' })}
          saveLabel="XUẤT BÁO CÁO"
          publishLabel={saveMutation.isPending ? "ĐANG LƯU..." : "LƯU KẾ HOẠCH"}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
            {saveMutation.isPending || isLoadingPlan ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <CheckCircle2 size={16} color="#10B981" />
            )}
            <View>
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#10B981', letterSpacing: 1 }}>STATUS</Text>
              <Text style={{ fontSize: 10, color: cSub, fontWeight: '600' }}>
                {isLoadingPlan ? 'LOADING API...' : saveMutation.isPending ? 'DATA SYNCING...' : 'LIVE CONNECTED'}
              </Text>
            </View>
          </View>
        </SGActionBar>
      </View>
    </View>
  );
}

