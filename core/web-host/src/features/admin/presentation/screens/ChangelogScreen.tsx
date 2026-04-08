import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { History, GitCommit } from 'lucide-react-native';

export const ChangelogScreen = () => {
  const versions = [
    { v: '2.5.0', date: 'Mar 26, 2026', type: 'MAJOR', title: 'System Core Reborn', notes: ['Eradicated 61KB Admin Monolith', 'Implemented 6 Clean Architecture Pillars for Admin', 'Deployed Cyber-Security CTO Dashboards'] },
    { v: '2.4.0', date: 'Mar 25, 2026', type: 'FEATURE', title: 'Marketing Growth Engine X', notes: ['Auto Sales Handoff (MarketingToSalesSyncService)', 'Heavy ROAS & CPL Analytics Dashboard'] },
    { v: '2.3.0', date: 'Mar 24, 2026', type: 'FEATURE', title: 'Finance Double-Entry Engine', notes: ['General Ledger Atomic Validation', 'CFO Glassmorphism Financial Matrices'] },
    { v: '2.2.0', date: 'Mar 20, 2026', type: 'FEATURE', title: 'Sales CRM Migration', notes: ['Kanban Pipelines via WebSocket Live syncing', 'Sales Customer Lifecycle Repo extraction'] },
    { v: '2.1.0', date: 'Mar 18, 2026', type: 'MAJOR', title: 'HR & Project Clean Architecture', notes: ['Split Payroll / Attendance Repositories', 'FSD UI Frontend Upgrades'] }
  ];

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <History color="#10B981" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">System Changelogs</Text>
            <Text variant="body2" color="#10B981">Immutable SGROUP ERP History</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.timelineLine} />
        {versions.map((ver, idx) => (
          <View style={styles.timelineItem} key={idx}>
             <View style={styles.timelineDot}>
               <GitCommit size={16} color="#10B981" />
             </View>
             
             <BlurView intensity={40} tint="dark" style={styles.card}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                    <Text variant="h3" color="#F8FAFC" weight="bold">v{ver.v}</Text>
                    <View style={[styles.badge, { backgroundColor: ver.type === 'MAJOR' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)' }]}>
                      <Text variant="caption" color={ver.type === 'MAJOR' ? '#FCA5A5' : '#BAE6FD'} weight="bold">{ver.type}</Text>
                    </View>
                  </View>
                  <Text variant="caption" color="#64748B" style={{fontFamily: 'monospace'}}>{ver.date}</Text>
                </View>

                <Text variant="body1" color="#E2E8F0" weight="bold" style={{marginBottom: 8}}>{ver.title}</Text>
                
                {ver.notes.map((note, i) => (
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4}} key={i}>
                    <View style={{width: 4, height: 4, borderRadius: 2, backgroundColor: '#94A3B8'}} />
                    <Text variant="body2" color="#94A3B8">{note}</Text>
                  </View>
                ))}
             </BlurView>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(16, 185, 129, 0.2)' },
  content: { padding: 16, position: 'relative' },
  timelineLine: { position: 'absolute', left: 31, top: 16, bottom: 0, width: 2, backgroundColor: 'rgba(255,255,255,0.05)' },
  timelineItem: { flexDirection: 'row', marginBottom: 24 },
  timelineDot: { width: 32, alignItems: 'center', paddingTop: 16, marginRight: 12 },
  card: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }
});
