import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { typography, useTheme } from '@sgroup/ui/src/theme/theme';
import { useThemeStore } from '@sgroup/ui/src/theme/themeStore';
import { SGCard } from '@sgroup/ui/src/ui/components';
import { legalApi } from '../api/legalApi';

export function LegalDashboard({ userRole }: { userRole: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const colors = useTheme();
  const { isDark } = useThemeStore();

  useEffect(() => {
    legalApi.getDashboardStats()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#10B981" style={{ margin: 40 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={[typography.h3, { color: colors.text, marginBottom: 16 }]}>Tổng quan Số liệu</Text>
      
      <View style={styles.grid}>
        <SGCard style={styles.card}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Hồ sơ dự án (Hiệu lực)</Text>
          <Text style={[typography.h2, { color: '#10B981', marginTop: 8 }]}>{data?.totalProjectDocs || 0}</Text>
        </SGCard>
        
        <SGCard style={styles.card}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Hồ sơ sắp hết hạn (30 ngày)</Text>
          <Text style={[typography.h2, { color: '#F59E0B', marginTop: 8 }]}>{data?.expiringDocs || 0}</Text>
        </SGCard>
        
        <SGCard style={styles.card}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Hồ sơ giao dịch</Text>
          <Text style={[typography.h2, { color: '#3B82F6', marginTop: 8 }]}>{data?.totalTransactionDocs || 0}</Text>
        </SGCard>
        
        <SGCard style={styles.card}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Dự án đang mở</Text>
          <Text style={[typography.h2, { color: '#8B5CF6', marginTop: 8 }]}>{data?.activeProjects || 0}</Text>
        </SGCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { width: 240, padding: 16 },
});
