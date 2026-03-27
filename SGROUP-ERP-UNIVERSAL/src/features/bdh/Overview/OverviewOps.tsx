import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Cog, Activity } from 'lucide-react-native';
import { useGetDepartmentPulse } from '../application/hooks/useBdhQueries';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../shared/theme/theme';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGEmptyState } from '../../../shared/ui/components/SGEmptyState';

export const OverviewOps = () => {
  const { data } = useGetDepartmentPulse('OPS');
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <Cog color={colors.text} size={32} strokeWidth={1.5} />
          </View>
          <View>
            <Text style={[typography.hero, { color: colors.text }]}>Operations Control</Text>
            <Text style={[typography.body, { color: colors.textSecondary }]}>Logistics & Execution</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <SGSection style={styles.pulseCard}>
          <SGEmptyState
            icon={<Activity size={48} color={colors.textSecondary} strokeWidth={1} />}
            title="Live Connection Established"
            subtitle={`Operations data stream is operational: ${data?.status || 'Active'}\nWaiting for real-time telemetry from engine.`}
          />
        </SGSection>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 32, paddingTop: 40, borderBottomWidth: 1 },
  content: { padding: 32, flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pulseCard: { width: '100%', maxWidth: 600, paddingVertical: 60 }
});
