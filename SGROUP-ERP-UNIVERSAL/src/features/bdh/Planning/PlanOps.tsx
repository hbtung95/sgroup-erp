import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Settings, Save, LayoutGrid } from 'lucide-react-native';
import { useGetExecPlan, useUpsertExecPlan } from '../application/hooks/useBdhQueries';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../shared/theme/theme';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGButton } from '../../../shared/ui/components/SGButton';
import { SGEmptyState } from '../../../shared/ui/components/SGEmptyState';
import { SGLoadingOverlay } from '../../../shared/ui/components/SGLoadingOverlay';

export const PlanOps = () => {
  const [year, setYear] = useState(2026);
  const { data, isLoading } = useGetExecPlan(year, 'BASE', 'OPS');
  const upsertPlan = useUpsertExecPlan();
  const { colors, isDark } = useAppTheme();

  const handleSave = () => {
    upsertPlan.mutate({
      year, scenario: 'BASE', tab: 'OPS',
      data: { updated: new Date() }
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Settings color={colors.text} size={32} strokeWidth={1.5} />
            </View>
            <View>
              <Text style={[typography.hero, { color: colors.text }]}>Operations Plan {year}</Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Capacity & Efficiency</Text>
            </View>
          </View>
          
          <SGButton
            title="Commit Plan"
            icon={<Save size={18} color="#FFFFFF" />}
            onPress={handleSave}
            loading={upsertPlan.isPending}
          />
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <SGLoadingOverlay visible message="Loading Strategic Matrix..." />
        ) : (
          <SGSection style={styles.matrixContainer}>
            <SGEmptyState
              icon={<LayoutGrid size={48} color={colors.textTertiary} strokeWidth={1} />}
              title="Strategic Matrix Empty"
              subtitle={`The tactical grid for ${year} is awaiting input.\nLast Commited: ${data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Never'}`}
              actionLabel="Initialize Matrix"
              onAction={() => {}}
            />
          </SGSection>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 32, paddingTop: 40, borderBottomWidth: 1 },
  content: { padding: 32, flex: 1 },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  matrixContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }
});
