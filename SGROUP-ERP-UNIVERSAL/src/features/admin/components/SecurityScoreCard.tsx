/**
 * SecurityScoreCard — Dashboard widget showing security health
 * Overall grade (A-F) + category scores with progress bars
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Shield, Heart, Lock, AlertTriangle, Wifi } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../shared/theme/theme';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGSkeleton } from '../../../shared/ui/components/SGSkeleton';
import { useSecurityScore } from '../hooks/useAdmin';

const GRADE_COLORS: Record<string, string> = {
  A: '#10b981', B: '#22c55e', C: '#f59e0b', D: '#f97316', F: '#ef4444',
};

const DETAIL_ICONS: Record<string, any> = {
  password_health: Heart,
  lockout_status: Lock,
  failed_logins: AlertTriangle,
  session_health: Wifi,
};

export function SecurityScoreCard() {
  const { colors } = useAppTheme();
  const { data, isLoading } = useSecurityScore();

  if (isLoading) return <SGSkeleton width="100%" height={220} borderRadius={16} />;
  if (!data) return null;

  const gradeColor = GRADE_COLORS[data.grade] || GRADE_COLORS.C;

  return (
    <SGSection noPadding>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.gradeCircle, { borderColor: gradeColor, backgroundColor: `${gradeColor}10` }]}>
            <Text style={[styles.grade, { color: gradeColor }]}>{data.grade}</Text>
            <Text style={[typography.micro, { color: gradeColor }]}>{data.overallScore}%</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Shield size={16} color={gradeColor} />
              <Text style={[typography.bodyBold, { color: colors.text }]}>Security Score</Text>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Điểm bảo mật tổng thể: {data.overallScore}/100
            </Text>
          </View>
        </View>

        {/* Category Scores */}
        <View style={[styles.details, { borderTopColor: colors.border }]}>
          {(data.details ?? []).map((item: any, i: number) => {
            const color = GRADE_COLORS[item.grade] || GRADE_COLORS.C;
            const IconComp = DETAIL_ICONS[item.key] || Shield;
            return (
              <Animated.View key={item.key} entering={FadeInDown.delay(100 + i * 60).duration(300)}>
                <View style={styles.detailRow}>
                  <View style={[styles.detailIcon, { backgroundColor: `${color}10` }]}>
                    <IconComp size={12} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.detailHeader}>
                      <Text style={[typography.smallBold, { color: colors.text }]}>{item.label}</Text>
                      <Text style={[typography.smallBold, { color }]}>{item.score}%</Text>
                    </View>
                    {/* Progress bar */}
                    <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { width: `${item.score}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={[typography.micro, { color: colors.textDisabled, marginTop: 2 }]}>{item.detail}</Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </SGSection>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0 },
  header: { flexDirection: 'row', gap: 14, padding: 16, alignItems: 'center' },
  gradeCircle: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  grade: { fontSize: 24, fontWeight: '900' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  details: { borderTopWidth: 1, padding: 16, gap: 12 },
  detailRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  detailIcon: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
});
