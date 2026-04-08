import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Calculator } from 'lucide-react-native';

export const AgencyCommissionScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BlurView intensity={30} tint="dark" style={styles.container}>
         <View style={styles.emptyState}>
            <Calculator size={48} color="#475569" />
            <Text variant="h3" color="#94A3B8" style={{marginTop: 16}}>Rebate Engine Standing By</Text>
            <Text variant="body2" color="#64748B" style={{marginTop: 8}}>Commissions will automatically calculate based on Deal volume.</Text>
         </View>
      </BlurView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { padding: 16, flex: 1 },
  container: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.5)' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
