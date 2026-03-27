const fs = require('fs');
const path = require('path');

const overviewScreens = [
  { name: 'Agency', key: 'AGENCY', icon: 'Briefcase', title: 'Agency Network Pulse', subtitle: 'Partnerships & Channels', color: 'colors.purple' },
  { name: 'Finance', key: 'FINANCE', icon: 'DollarSign', title: 'Financial Command', subtitle: 'Treasury & Cashflow', color: 'colors.success' },
  { name: 'HR', key: 'HR', icon: 'Users', title: 'Human Capital Pulse', subtitle: 'Workforce & Operations', color: 'colors.brand' },
  { name: 'Marketing', key: 'MK', icon: 'Target', title: 'Marketing Pulse', subtitle: 'Lead Gen & Campaigns', color: 'colors.accentCyan' },
  { name: 'Ops', key: 'OPS', icon: 'Cog', title: 'Operations Control', subtitle: 'Logistics & Execution', color: 'colors.text' },
  { name: 'Project', key: 'PROJECT', icon: 'Building', title: 'Project Tracking Pulse', subtitle: 'Development & Construction', color: 'colors.warning' },
  { name: 'SHomes', key: 'SHOMES', icon: 'Building2', title: 'S-Homes Management', subtitle: 'Property & Facilities', color: 'colors.accent' },
];

const planScreens = [
  { name: 'Agency', key: 'AGENCY', icon: 'Briefcase', title: 'Agency Plan', subtitle: 'Expansion Goals', color: 'colors.purple' },
  { name: 'Finance', key: 'FINANCE', icon: 'Calculator', title: 'Financial Planning', subtitle: 'Budget & Forecast', color: 'colors.success' },
  { name: 'HR', key: 'HR', icon: 'UserCog', title: 'HR Strategy', subtitle: 'Headcount & Payroll', color: 'colors.brand' },
  { name: 'Marketing', key: 'MK', icon: 'PieChart', title: 'Marketing Budget', subtitle: 'Spend & ROI targets', color: 'colors.accentCyan' },
  { name: 'Ops', key: 'OPS', icon: 'Settings', title: 'Operations Plan', subtitle: 'Capacity & Efficiency', color: 'colors.text' },
  { name: 'Project', key: 'PROJECT', icon: 'Building', title: 'Project Timeline', subtitle: 'Milestones & Cash Out', color: 'colors.warning' },
  { name: 'SHomes', key: 'SHOMES', icon: 'Building2', title: 'S-Homes Roadmap', subtitle: 'Growth Targets', color: 'colors.accent' },
  { name: 'Sales', key: 'SALES', icon: 'TrendingUp', title: 'Sales Strategy', subtitle: 'Revenue & Quotas', color: 'colors.brand' },
];

const baseDir = path.join(__dirname, '../src/features/bdh');

const generateOverview = ({ name, key, icon, title, subtitle, color }) => `
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ${icon}, Activity } from 'lucide-react-native';
import { useGetDepartmentPulse } from '../application/hooks/useBdhQueries';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../shared/theme/theme';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGEmptyState } from '../../../shared/ui/components/SGEmptyState';

export const Overview${name} = () => {
  const { data } = useGetDepartmentPulse('${key}');
  const { colors, theme, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <${icon} color={${color}} size={32} strokeWidth={1.5} />
          </View>
          <View>
            <Text style={[typography.hero, { color: colors.text }]}>${title}</Text>
            <Text style={[typography.body, { color: ${color} }]}>${subtitle}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <SGSection style={styles.pulseCard}>
          <SGEmptyState
            icon={<Activity size={48} color={${color}} strokeWidth={1} />}
            title="Live Connection Established"
            description={\`${name} data stream is operational: \${data?.status || 'Active'}\\nWaiting for real-time telemetry from engine.\`}
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
`.trim();


const generatePlan = ({ name, key, icon, title, subtitle, color }) => `
import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ${icon}, Save, LayoutGrid } from 'lucide-react-native';
import { useGetExecPlan, useUpsertExecPlan } from '../application/hooks/useBdhQueries';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../shared/theme/theme';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGButton } from '../../../shared/ui/components/SGButton';
import { SGEmptyState } from '../../../shared/ui/components/SGEmptyState';
import { SGLoadingOverlay } from '../../../shared/ui/components/SGLoadingOverlay';

export const Plan${name} = () => {
  const [year, setYear] = useState(2026);
  const { data, isLoading } = useGetExecPlan(year, 'BASE', '${key}');
  const upsertPlan = useUpsertExecPlan();
  const { colors, isDark } = useAppTheme();

  const handleSave = () => {
    upsertPlan.mutate({
      year, scenario: 'BASE', tab: '${key}',
      data: { updated: new Date() }
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <${icon} color={${color}} size={32} strokeWidth={1.5} />
            </View>
            <View>
              <Text style={[typography.hero, { color: colors.text }]}>${title} {year}</Text>
              <Text style={[typography.body, { color: ${color} }]}>${subtitle}</Text>
            </View>
          </View>
          
          <SGButton
            label="Commit Plan"
            leftIcon={<Save size={18} color="#FFFFFF" />}
            onPress={handleSave}
            loading={upsertPlan.isPending}
          />
        </View>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <SGLoadingOverlay visible message="Loading Strategic Matrix..." inline />
        ) : (
          <SGSection style={styles.matrixContainer}>
            <SGEmptyState
              icon={<LayoutGrid size={48} color={colors.textTertiary} strokeWidth={1} />}
              title="Strategic Matrix Empty"
              description={\`The tactical grid for \${year} is awaiting input.\\nLast Commited: \${data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Never'}\`}
              action={{ label: "Initialize Matrix", onPress: () => {} }}
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
`.trim();

overviewScreens.forEach(screen => {
  const filePath = path.join(baseDir, 'Overview', \`Overview\${screen.name}.tsx\`);
  fs.writeFileSync(filePath, generateOverview(screen), 'utf8');
  console.log('Updated', filePath);
});

planScreens.forEach(screen => {
  const filePath = path.join(baseDir, 'Planning', \`Plan\${screen.name}.tsx\`);
  fs.writeFileSync(filePath, generatePlan(screen), 'utf8');
  console.log('Updated', filePath);
});

console.log('Successfully updated all BDH screens.');
