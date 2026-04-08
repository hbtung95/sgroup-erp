import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme, typography } from '@sgroup/ui/src/theme/theme';
import { Construction } from 'lucide-react-native';

interface Props {
  moduleKey?: string;
}

const LABELS: Record<string, string> = {
  PLAN_HR: 'Nhân sự',
  PLAN_AGENCY: 'Đại lý',
  PLAN_PROJECT: 'Dự án',
  PLAN_OPS: 'Vận hành',
  PLAN_FINANCE: 'Tài chính',
};

export function PlanPlaceholder({ moduleKey }: Props) {
  const colors = useTheme();
  const label = (moduleKey && LABELS[moduleKey]) || 'Module';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <Construction size={48} color={colors.accent} />
        <Text style={[typography.h3, { color: colors.text, marginTop: 16 }]}>
          Kế hoạch {label}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8, textAlign: 'center' }]}>
          Trang kế hoạch này đang được phát triển.{'\n'}Vui lòng quay lại sau.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { alignItems: 'center', padding: 40, borderRadius: 20, borderWidth: 1, maxWidth: 400 },
});
