/**
 * LoginCalendar — GitHub-style contribution heatmap (365 days)
 * Shows daily login activity as colored squares
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Calendar } from 'lucide-react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { typography, spacing } from '@sgroup/ui/src/theme/theme';
import { SGSection } from '@sgroup/ui/src/ui/components/SGSection';
import { SGSkeleton } from '@sgroup/ui/src/ui/components/SGSkeleton';
import { useLoginCalendar } from '../hooks/useAdmin';

const CELL_SIZE = 12;
const CELL_GAP = 2;

function getIntensity(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount <= 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function LoginCalendar() {
  const { colors } = useAppTheme();
  const { data, isLoading } = useLoginCalendar();

  if (isLoading) return <SGSkeleton width="100%" height={160} borderRadius={16} />;
  if (!data) return null;

  const INTENSITY_COLORS = [
    `${colors.border}80`,        // 0: no activity
    '#9be9a8',                    // 1: low
    '#40c463',                    // 2: medium
    '#30a14e',                    // 3: high
    '#216e39',                    // 4: very high
  ];

  // Organize into weeks (columns) with 7 days each (rows)
  const calendarData = data.data ?? [];
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  // Pad the start to align with day of week
  if (calendarData.length > 0) {
    const firstDate = new Date(calendarData[0]?.date);
    const startDow = firstDate.getDay(); // 0=Sun
    for (let i = 0; i < startDow; i++) {
      currentWeek.push({ date: '', count: -1 }); // empty placeholder
    }
  }

  calendarData.forEach((item: any) => {
    currentWeek.push(item);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const DAY_LABELS = ['', 'T2', '', 'T4', '', 'T6', ''];

  return (
    <SGSection noPadding>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.success}12` }]}>
              <Calendar size={16} color={colors.success} />
            </View>
            <View>
              <Text style={[typography.bodyBold, { color: colors.text }]}>Login Activity</Text>
              <Text style={[typography.micro, { color: colors.textTertiary }]}>
                {(data.totalLogins ?? 0).toLocaleString()} logins trong 365 ngày
              </Text>
            </View>
          </View>
        </View>

        {/* Calendar Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollArea}>
          <View>
            {/* Day labels */}
            <View style={styles.gridContainer}>
              <View style={styles.dayLabels}>
                {DAY_LABELS.map((label, i) => (
                  <Text key={i} style={[styles.dayLabel, { color: colors.textDisabled }]}>{label}</Text>
                ))}
              </View>

              <View style={styles.grid}>
                {weeks.map((week, wi) => (
                  <Animated.View key={wi} entering={FadeIn.delay(wi * 5).duration(100)} style={styles.column}>
                    {week.map((day, di) => (
                      <View
                        key={di}
                        style={[
                          styles.cell,
                          {
                            backgroundColor: day.count < 0
                              ? 'transparent'
                              : INTENSITY_COLORS[getIntensity(day.count, data.maxCount ?? 0)],
                            borderRadius: 2,
                          },
                        ]}
                      />
                    ))}
                  </Animated.View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Legend */}
        <View style={[styles.legend, { borderTopColor: colors.border }]}>
          <Text style={[typography.micro, { color: colors.textDisabled }]}>Ít</Text>
          {INTENSITY_COLORS.map((c, i) => (
            <View key={i} style={[styles.legendCell, { backgroundColor: c }]} />
          ))}
          <Text style={[typography.micro, { color: colors.textDisabled }]}>Nhiều</Text>
        </View>
      </View>
    </SGSection>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0 },
  header: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  scrollArea: { paddingHorizontal: 16, paddingBottom: 8 },
  gridContainer: { flexDirection: 'row' },
  dayLabels: { marginRight: 4, justifyContent: 'space-between' },
  dayLabel: { fontSize: 9, height: CELL_SIZE + CELL_GAP, lineHeight: CELL_SIZE + CELL_GAP },
  grid: { flexDirection: 'row', gap: CELL_GAP },
  column: { gap: CELL_GAP },
  cell: { width: CELL_SIZE, height: CELL_SIZE },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 12, borderTopWidth: 1, justifyContent: 'flex-end' },
  legendCell: { width: 10, height: 10, borderRadius: 2 },
});
