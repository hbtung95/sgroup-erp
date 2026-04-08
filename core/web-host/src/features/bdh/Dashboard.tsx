import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme, sgds, typography } from '@sgroup/ui/src/theme/theme';
import { BarChart3 } from 'lucide-react-native';

export function Dashboard() {
  const colors = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
    >
      <Text style={[typography.h2, { color: colors.text }]}>Dashboard</Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
        Tổng quan hoạt động Ban Điều Hành
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
});
