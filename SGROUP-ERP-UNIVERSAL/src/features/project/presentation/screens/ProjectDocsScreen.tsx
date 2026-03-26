import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { FileText, Download } from 'lucide-react-native';
// Note: Assuming useGetDocs is created in the hooks
import { useGetProjects } from '../../application/hooks/useProjectQueries';
import { SGCard } from '../../../../shared/ui/components/SGCard';

export const ProjectDocsScreen = () => {
  return (
    <View style={styles.container}>
      <BlurView intensity={90} tint="light" style={styles.header}>
        <FileText size={28} color="#2563EB" />
        <Text variant="h2" weight="bold">TÃ i liá»‡u dá»± Ã¡n</Text>
      </BlurView>
      <ScrollView contentContainerStyle={styles.list}>
        <SGCard style={styles.docItem}>
           <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
             <View style={styles.iconBg}><FileText size={20} color="#2563EB" /></View>
             <View>
               <Text variant="body1" weight="bold">Báº£ng giÃ¡ T3/2026.pdf</Text>
               <Text variant="caption" color="#64748B">2.4 MB â€¢ PhÃ¡p lÃ½</Text>
             </View>
           </View>
           <Download size={20} color="#64748B" />
        </SGCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, paddingTop: 60, flexDirection: 'row', alignItems: 'center', gap: 12 },
  list: { padding: 16, gap: 12 },
  docItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  iconBg: { padding: 10, backgroundColor: '#DBEAFE', borderRadius: 12 }
});
