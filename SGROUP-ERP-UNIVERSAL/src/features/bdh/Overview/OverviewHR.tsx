import React from 'react';
import { View, ScrollView, StyleSheet } , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Users } from 'lucide-react-native';
import { useGetDepartmentPulse } from '../../application/hooks/useBdhQueries';

export const OverviewHR = () => {
  const { data } = useGetDepartmentPulse('HR');

  return (
    <LinearGradient colors={['#1F2937', '#111827']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Users color="#3B82F6" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">HR Sector Pulse</Text>
            <Text variant="body2" color="#3B82F6">Workforce & Payroll Overview</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.centerBox}>
           <Text variant="h2" color="#94A3B8">Live Connection Established</Text>
           <Text variant="body2" color="#64748B" style={{marginTop: 8}}>HR data stream is operational: {data?.status}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(59, 130, 246, 0.2)' },
  content: { padding: 16, flex: 1, justifyContent: 'center' },
  centerBox: { alignItems: 'center', opacity: 0.5 }
});
