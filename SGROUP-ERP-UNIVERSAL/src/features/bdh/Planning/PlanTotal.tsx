import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Network, Save } from 'lucide-react-native';
import { useGetExecPlan, useUpsertExecPlan } from '../../application/hooks/useBdhQueries';

export const PlanTotal = () => {
  const [year, setYear] = useState(2026);
  const { data, isLoading } = useGetExecPlan(year, 'BASE', 'TOTAL');
  const upsertPlan = useUpsertExecPlan();

  const handleSave = () => {
    upsertPlan.mutate({
      year,
      scenario: 'BASE',
      tab: 'TOTAL',
      data: { targetRevenue: 50000000000, targetProfit: 15000000000, updated: new Date() }
    });
  };

  return (
    <LinearGradient colors={['#312E81', '#1E1B4B']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <Network color="#818CF8" size={28} />
            <View>
              <Text variant="h1" color="#F8FAFC" weight="bold">Unified Business Plan {year}</Text>
              <Text variant="body2" color="#818CF8">Enterprise Goal Matrix</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.btn} onPress={handleSave}>
             <Save size={16} color="#F8FAFC" />
             <Text variant="body2" color="#F8FAFC" weight="bold">Commit Plan</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.matrixContainer}>
          <Text variant="h3" color="#94A3B8" style={{fontFamily: 'monospace', marginBottom: 16}}>[MATRIX_EMPTY]</Text>
          <Text variant="body2" color="#64748B">
            Last Commited: {data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Never'}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(129, 140, 248, 0.2)' },
  content: { padding: 16, flex: 1 },
  matrixContainer: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, alignItems: 'center', justifyContent: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#4F46E5' }
});
