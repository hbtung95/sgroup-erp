import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Users, Briefcase } from 'lucide-react-native';
import { SGCard } from '../../../../shared/ui/components/SGCard';

export const ProjectAssignmentScreen = () => {
  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.header}>
        <Users size={28} color="#F59E0B" />
        <Text variant="h2" weight="bold">Báº£ng PhÃ¢n Quyá»n Agent</Text>
      </BlurView>
      <ScrollView contentContainerStyle={styles.list}>
        <SGCard style={styles.card}>
           <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
             <View style={styles.iconBg}><Briefcase size={20} color="#F59E0B" /></View>
             <View>
               <Text variant="body1" weight="bold">Äáº¡i lÃ½ PhÃ¢n phá»‘i A</Text>
               <Text variant="caption" color="#64748B">Quyá»n bÃ¡n: Äá»™c quyá»n â€¢ Quota: 50 cÄƒn</Text>
             </View>
           </View>
        </SGCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12 },
  list: { padding: 16, gap: 12 },
  card: { padding: 16 },
  iconBg: { padding: 10, backgroundColor: '#FEF3C7', borderRadius: 12 }
});
