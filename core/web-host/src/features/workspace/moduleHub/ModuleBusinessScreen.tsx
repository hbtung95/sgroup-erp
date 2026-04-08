import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { sgds, typography } from '@sgroup/ui/src/theme/theme';
import { useResponsive } from '@sgroup/ui/src/hooks/useResponsive';
import {
  SGBadge,
  SGButton,
  SGDataGrid,
  SGPageContainer,
  SGPageHeader,
  SGSection,
  SGStatCard,
  SGTable,
  SGTag,
  SGTabs,
  SGTimeline,
  TableColumn,
} from '@sgroup/ui/src/ui';
import { ErpModuleId } from '../../../core/config/modules';
import { DEFAULT_MODULE_WORKSPACE_CONFIG, MODULE_WORKSPACE_CONFIGS } from './moduleConfigs';
import { ModuleFlowId, ModuleTableRow, ModuleTone } from './types';

interface ModuleBusinessScreenProps {
  moduleId: ErpModuleId;
  rightContent?: React.ReactNode;
}

export function ModuleBusinessScreen({ moduleId, rightContent }: ModuleBusinessScreenProps) {
  const navigation = useNavigation<any>();
  const { theme, colors, isDark } = useAppTheme();
  const { isDesktop, isMobile } = useResponsive();
  const config = MODULE_WORKSPACE_CONFIGS[moduleId] || DEFAULT_MODULE_WORKSPACE_CONFIG;
  const [activeFlowId, setActiveFlowId] = useState<ModuleFlowId>(config.defaultFlowId || 'overview');

  useEffect(() => {
    setActiveFlowId(config.defaultFlowId || 'overview');
  }, [config.defaultFlowId, config.moduleId]);

  const activeFlow = config.flows.find((flow) => flow.id === activeFlowId) || config.flows[0];

  const toneToColor = (tone: ModuleTone) => {
    if (tone === 'brand') return config.accentColor;
    if (tone === 'success') return colors.success;
    if (tone === 'warning') return colors.warning;
    if (tone === 'danger') return colors.danger;
    if (tone === 'info') return colors.info;
    return colors.textTertiary;
  };

  const toneToBadge = (tone: ModuleTone): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    if (tone === 'success') return 'success';
    if (tone === 'warning') return 'warning';
    if (tone === 'danger') return 'danger';
    if (tone === 'info') return 'info';
    return 'default';
  };

  const tableColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'item',
        title: 'HANG MUC',
        flex: 2.2,
        render: (value: string) => <Text style={[typography.smallBold, { color: colors.text }]}>{value}</Text>,
      },
      {
        key: 'owner',
        title: 'PHU TRACH',
        flex: 1.2,
        render: (value: string) => <Text style={[typography.small, { color: colors.textSecondary }]}>{value}</Text>,
      },
      {
        key: 'due',
        title: 'HAN',
        flex: 0.9,
        render: (value: string) => <Text style={[typography.small, { color: colors.textSecondary }]}>{value}</Text>,
      },
      {
        key: 'output',
        title: 'OUTPUT',
        flex: 1.2,
        render: (value: string) => <Text style={[typography.smallBold, { color: colors.text }]}>{value}</Text>,
      },
      {
        key: 'status',
        title: 'TRANG THAI',
        flex: 1.1,
        render: (value: ModuleTableRow['status']) => <SGBadge label={value.label} variant={toneToBadge(value.tone)} size="sm" />,
      },
    ],
    [colors.text, colors.textSecondary]
  );

  return (
    <View style={[styles.root, { backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }]}>
      <View
        style={[
          styles.topBar,
          {
            borderBottomColor: colors.border,
            backgroundColor: isDark ? 'rgba(12,18,29,0.86)' : 'rgba(255,255,255,0.88)',
          },
          Platform.OS === 'web' ? ({ ...sgds.glass } as any) : null,
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
            Platform.OS === 'web' ? (sgds.cursor as any) : null,
          ]}
        >
          <ArrowLeft size={16} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.topBarTitleWrap}>
          <Text style={[typography.h4, { color: colors.text }]}>{config.moduleName}</Text>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>{config.moduleSubtitle}</Text>
        </View>

        <SGButton title={activeFlow.primaryAction} size={isMobile ? 'sm' : 'md'} onPress={() => {}} />
        {rightContent}
      </View>

      <SGPageContainer padding={isMobile ? 16 : 24} maxWidth={1380}>
        <View style={{ gap: isMobile ? 14 : 18 }}>
          <SGPageHeader
            icon={<config.icon size={22} color={config.accentColor} />}
            iconColor={config.accentColor}
            title={activeFlow.label}
            subtitle={activeFlow.description}
            rightContent={<SGBadge label="BUSINESS FLOW" variant="info" />}
          />

          <SGDataGrid gap={14} minItemWidth={isMobile ? 150 : 220}>
            {config.kpis.map((kpi) => (
              <SGStatCard
                key={kpi.id}
                icon={<kpi.icon size={16} color={toneToColor(kpi.tone)} />}
                iconColor={toneToColor(kpi.tone)}
                label={kpi.label}
                value={kpi.value}
                unit={kpi.unit}
                trend={kpi.trend}
                compact={isMobile}
                gradient={kpi.tone === 'brand'}
              />
            ))}
          </SGDataGrid>

          <SGSection title="Business Flow" titleIcon={<Sparkles size={18} color={config.accentColor} />} titleColor={config.accentColor} noPadding>
            <View style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}>
              <SGTabs
                variant="pill"
                scrollable
                tabs={config.flows.map((flow) => ({ key: flow.id, label: flow.label }))}
                activeKey={activeFlowId}
                onChange={(key) => setActiveFlowId(key as ModuleFlowId)}
              />
              <View style={styles.tagWrap}>
                {activeFlow.quickTags.map((tag) => (
                  <SGTag key={tag} size="sm" label={tag} color={config.accentColor} variant="soft" />
                ))}
              </View>
            </View>
          </SGSection>

          <SGDataGrid gap={14} minItemWidth={isMobile ? 160 : 210}>
            {activeFlow.summaryCards.map((card) => (
              <SGStatCard
                key={card.id}
                icon={<card.icon size={16} color={toneToColor(card.tone)} />}
                iconColor={toneToColor(card.tone)}
                label={card.label}
                value={card.value}
                unit={card.unit}
                trend={card.trend}
                compact
                gradient={card.tone === 'brand'}
              />
            ))}
          </SGDataGrid>

          <View style={[styles.contentRow, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            <View style={{ flex: isDesktop ? 1.65 : 1 }}>
              <SGSection title={activeFlow.tableTitle} titleColor={config.accentColor} noPadding>
                <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                  <SGTable columns={tableColumns} data={activeFlow.tableRows} />
                </View>
              </SGSection>
            </View>

            <View style={{ flex: 1, gap: 14 }}>
              <SGSection title={activeFlow.focusTitle} titleColor={config.accentColor}>
                {activeFlow.focusCards.map((card, index) => (
                  <View
                    key={card.id}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: index === activeFlow.focusCards.length - 1 ? 0 : 1,
                      borderBottomColor: colors.borderLight,
                    }}
                  >
                    <View style={styles.focusRow}>
                      <View style={[styles.focusIcon, { backgroundColor: `${toneToColor(card.tone)}20` }]}>
                        <card.icon size={14} color={toneToColor(card.tone)} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.smallBold, { color: colors.text }]}>{card.title}</Text>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>{card.hint}</Text>
                      </View>
                      <SGTag label={card.value} color={toneToColor(card.tone)} variant="soft" />
                    </View>
                  </View>
                ))}
              </SGSection>

              <SGSection title="Activity Stream" titleColor={colors.info}>
                <SGTimeline
                  items={activeFlow.activities.map((activity) => ({
                    title: activity.title,
                    description: activity.detail,
                    time: activity.time,
                    color: toneToColor(activity.tone),
                  }))}
                />
              </SGSection>
            </View>
          </View>
        </View>
      </SGPageContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitleWrap: { flex: 1, gap: 2 },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contentRow: {
    gap: 14,
  },
  focusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  focusIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
