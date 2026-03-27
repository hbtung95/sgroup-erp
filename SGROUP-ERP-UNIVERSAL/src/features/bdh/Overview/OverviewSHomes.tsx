import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Building2, Activity } from 'lucide-react-native';
import { useGetDepartmentPulse } from '../application/hooks/useBdhQueries';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../shared/theme/theme';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGEmptyState } from '../../../shared/ui/components/SGEmptyState';

export const OverviewSHomes = () => {
  const { data } = useGetDepartmentPulse('SHOMES');
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.1)' }]}>
            <Building2 color={colors.accent} size={32} strokeWidth={1.5} />
          </View>
          <View>
            <Text style={[typography.hero, { color: colors.text }]}>S-Homes Management</Text>
            <Text style={[typography.body, { color: colors.accent }]}>Property & Facilities</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <SGSection style={styles.pulseCard}>
          <SGEmptyState
            icon={<Activity size={48} color={colors.accent} strokeWidth={1} />}
            title="Live Connection Established"
            subtitle={`S-Homes data stream is operational: ${data?.status || 'Active'}\nWaiting for real-time telemetry from engine.`}
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
