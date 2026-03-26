import React from 'react';
import { View, ScrollView, StyleSheet } , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase } from 'lucide-react-native';

export const OverviewProject = () => {
  return (
    <LinearGradient colors={['#1F2937', '#111827']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Briefcase color="#8B5CF6" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">Project Sector Pulse</Text>
            <Text variant="body2" color="#8B5CF6">Delivery & Operations Overview</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
         <View style={styles.centerBox}>
           <Text variant="h2" color="#94A3B8">Project Stream Initialized</Text>
           <Text variant="body2" color="#64748B" style={{marginTop: 8}}>Synchronizing aggregated milestones...</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(139, 92, 246, 0.2)' },
  content: { padding: 16, flex: 1, justifyContent: 'center' },
  centerBox: { alignItems: 'center', opacity: 0.5 }
});
