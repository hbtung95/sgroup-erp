import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Users, CheckCircle } from 'lucide-react-native';
import { useGetProjectPolicies } from '../../application/hooks/useProjectQueries';


export const ProjectPoliciesScreen = () => {
  const { data: policies, isLoading } = useGetProjectPolicies();

  return (
    <LinearGradient colors={['#F3E8FF', '#E9D5FF']} style={styles.container}>
      <BlurView intensity={40} style={styles.header}>
        <Shield size={32} color="#9333EA" />
        <Text variant="h1" color="#6B21A8">ChÃ­nh sÃ¡ch BÃ¡n HÃ ng</Text>
      </BlurView>
      
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? <Text>Loading Glassmorphism policies...</Text> : (
          policies?.map((policy: any) => (
            <BlurView intensity={80} tint="light" style={styles.card} key={policy.id}>
              <View style={styles.cardHeader}>
                <Text variant="h3" weight="bold">{policy.name}</Text>
                <CheckCircle size={20} color="#10B981" />
              </View>
              <Text variant="body2" color="#64748B">{policy.description}</Text>
              <View style={styles.divider} />
              <Text variant="caption" weight="bold">Hiá»‡u lá»±c: {policy.effectiveDate}</Text>
            </BlurView>
          )) || <Text>No active policies</Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#FFF' },
  content: { padding: 16, gap: 16 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#FFF', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', my: 12 }
});
