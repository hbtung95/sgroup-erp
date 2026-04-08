import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme, sgds, typography } from '@sgroup/ui/src/theme/theme';
import { Construction } from 'lucide-react-native';

interface Props {
  moduleKey?: string;
}

const LABELS: Record<string, string> = {
  OVERVIEW_SALES: 'Kinh doanh',
  OVERVIEW_MARKETING: 'Marketing',
  OVERVIEW_HR: 'Nhân sự',
  OVERVIEW_AGENCY: 'Đại lý',
  OVERVIEW_PROJECT: 'Dự án',
  OVERVIEW_OPS: 'Vận hành',
  OVERVIEW_FINANCE: 'Tài chính',
};

export function OverviewPlaceholder({ moduleKey }: Props) {
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
          Tổng quan {label}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8, textAlign: 'center' }]}>
          Trang này đang được phát triển.{'\n'}Dữ liệu sẽ được cập nhật khi tính năng hoàn thiện.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { alignItems: 'center', padding: 40, borderRadius: 20, borderWidth: 1, maxWidth: 400 },
});
