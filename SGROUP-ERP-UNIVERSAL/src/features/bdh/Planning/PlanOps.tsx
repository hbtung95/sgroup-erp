import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings } from 'lucide-react-native';

export const PlanOps = () => {
  return (
    <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Settings color="#94A3B8" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">Operations Matrix</Text>
            <Text variant="body2" color="#94A3B8">Capacity & Asset Planning</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.matrixContainer}>
          <Text variant="h3" color="#94A3B8" style={{fontFamily: 'monospace', marginBottom: 16}}>LOGISTICS_SYNCING</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(148, 163, 184, 0.2)' },
  content: { padding: 16, flex: 1 },
  matrixContainer: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.5)', padding: 24, alignItems: 'center', justifyContent: 'center' },
});
