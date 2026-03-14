import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { SGButton } from '../../../shared/ui/components';
import { SGAPIClient } from '../../../shared/ui/components/SGAPIClient';

import { calcPlanTotalMetrics, revenueRateToSalesRate } from './plan-total/calculations';
import { DEFAULT_BY_SCENARIO, SCENARIOS } from './plan-total/constants';
import type { CostRowKey, Plan, PlanTotalPalette, ScenarioKey } from './plan-total/types';
import {
  BottomSummaryBar,
  BreakEvenSection,
  FunnelSection,
  OpexSection,
  ProfitSection,
  RevenueCostSection,
} from './plan-total/sections';

// ─── Component ───────────────────────────────────────────────────────────────

export function PlanTotal() {
  const { isDark, colors: c } = useAppTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;

  // ── State ──────────────────────────────────────────────────────────────────
  const [scenario, setScenario] = useState<ScenarioKey>('BASE');
  const [plan, setPlan] = useState<Plan>(DEFAULT_BY_SCENARIO['BASE']);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Theme palette ──────────────────────────────────────────────────────────
  const palette: PlanTotalPalette = useMemo(() => ({
    isDark,
    surface: isDark ? '#1E293B' : '#FFFFFF',
    soft:    isDark ? '#162032' : '#F8FAFC',
    border:  isDark ? 'rgba(255,255,255,0.07)' : '#E2E8F0',
    text:    isDark ? '#F8FAFC' : '#0F172A',
    text2:   isDark ? '#94A3B8' : '#475569',
    text3:   isDark ? '#64748B' : '#94A3B8',
  }), [isDark]);

  // ── Derived metrics ────────────────────────────────────────────────────────
  const metrics = useMemo(() => calcPlanTotalMetrics(plan), [plan]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const setField = useCallback((key: keyof Plan, value: number) => {
    setPlan(p => ({ ...p, [key]: value }));
  }, []);

  const onRevenueRateChange = useCallback((key: CostRowKey, revenueRate: number) => {
    const salesRate = revenueRateToSalesRate(revenueRate, plan.avgFee);
    setPlan(p => ({ ...p, [key]: salesRate }));
  }, [plan.avgFee]);

  const handleScenarioChange = useCallback((k: ScenarioKey) => {
    setScenario(k);
    setPlan(DEFAULT_BY_SCENARIO[k]);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (typeof (window as any).google !== 'undefined') {
        await SGAPIClient.call('processSavePlan', { plan, metrics, scenario });
        alert('Đã lưu kế hoạch thành công!');
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
        alert('Đã lưu dữ liệu giả lập!');
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [plan, metrics, scenario]);

  // ── Shared card style passed to sections ───────────────────────────────────
  const cardStyle: ViewStyle = useMemo(() => ({
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: isMobile ? 16 : 28,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: palette.border,
  }), [palette, isMobile]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: isMobile ? 16 : 30,
          paddingBottom: 120,
          maxWidth: 1400,
          alignSelf: 'center',
          width: '100%',
        }}
      >
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 16,
            marginBottom: 30,
          }}
        >
          <View>
            <Text style={{ fontSize: isMobile ? 22 : 32, fontWeight: '900', color: palette.text }}>
              Lập Kế Hoạch Kinh Doanh
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.text3, letterSpacing: 1.2 }}>
              SGroup ERP — Planning CEO
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Scenario switcher */}
            <View style={{ flexDirection: 'row', padding: 5, borderRadius: 12, backgroundColor: palette.soft, borderWidth: 1, borderColor: palette.border }}>
              {(Object.keys(SCENARIOS) as ScenarioKey[]).map(k => (
                <Pressable
                  key={k}
                  onPress={() => handleScenarioChange(k)}
                  style={[
                    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
                    scenario === k && { backgroundColor: SCENARIOS[k].color },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: scenario === k ? '#fff' : palette.text3 }}>
                    {SCENARIOS[k].label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <SGButton variant="secondary" icon="History" title="LỊCH SỬ" style={{ borderRadius: 10 }} />
            <SGButton
              variant="primary"
              icon="Save"
              title="LƯU"
              loading={isSaving}
              onPress={handleSave}
              style={{ borderRadius: 10, minWidth: 90 }}
            />
          </View>
        </View>

        {/* ── Sections ── */}
        <RevenueCostSection
          plan={plan}
          metrics={metrics}
          palette={palette}
          cardStyle={cardStyle}
          isMobile={isMobile}
          isTablet={isTablet}
          setField={setField}
          onRevenueRateChange={onRevenueRateChange}
        />

        <OpexSection
          plan={plan}
          metrics={metrics}
          palette={palette}
          cardStyle={cardStyle}
          isMobile={isMobile}
          setField={setField}
        />

        {/* P&L + Break-even side by side on desktop */}
        <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 24, marginBottom: 24 }}>
          <ProfitSection
            plan={plan}
            metrics={metrics}
            palette={palette}
            isMobile={isMobile}
            setField={setField}
          />
          <BreakEvenSection
            metrics={metrics}
            palette={palette}
            cardStyle={cardStyle}
            isMobile={isMobile}
          />
        </View>

        <FunnelSection
          plan={plan}
          metrics={metrics}
          palette={palette}
          cardStyle={cardStyle}
          isMobile={isMobile}
          isTablet={isTablet}
          setField={setField}
        />
      </ScrollView>

      {/* ── Sticky Footer ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          padding: isMobile ? 12 : 18,
          borderTopWidth: 1,
          borderTopColor: palette.border,
          backgroundColor: palette.surface,
          zIndex: 100,
          elevation: 10,
        }}
      >
        <View style={{ maxWidth: 1400, alignSelf: 'center', width: '100%' }}>
          <BottomSummaryBar
            plan={plan}
            metrics={metrics}
            palette={palette}
            isLoadingPlan={isLoadingPlan}
            isSaving={isSaving}
          />
        </View>
      </View>
    </View>
  );
}
