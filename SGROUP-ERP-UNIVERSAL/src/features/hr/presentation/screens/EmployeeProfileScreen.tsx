import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react-native';
import { useGetEmployeeById } from '../../application/hooks/useHRQueries';

import { SGCard } from '../../../../shared/ui/SGCard';

export const EmployeeProfileScreen = ({ route }: any) => {
  const employeeId = route?.params?.id || 'sample-id';
  const { data: employee, isLoading, error } = useGetEmployeeById(employeeId);

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  if (error) return <View style={styles.center}><Text color="red">Failed to load profile</Text></View>;
  if (!employee) return <View style={styles.center}><Text>Employee not found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.heroBackground}>
        <BlurView intensity={20} style={styles.heroBlur}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarFallback}>
              <Text variant="h2" color="#FFF">{employee.fullName.charAt(0)}</Text>
            </View>
            <View style={styles.statusBadge} />
          </View>
          <Text variant="h1" color="#FFF" style={styles.name}>{employee.fullName}</Text>
          <Text variant="body1" color="#E2E8F0">{employee.position?.name || 'Staff'} • {employee.department?.name || 'HQ'}</Text>
        </BlurView>
      </LinearGradient>

      <View style={styles.content}>
        <SGCard style={styles.infoCard}>
          <Text variant="h3" weight="bold" style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <Mail size={20} color="#64748B" />
            <Text style={styles.infoText}>{employee.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={20} color="#64748B" />
            <Text style={styles.infoText}>{employee.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={20} color="#64748B" />
            <Text style={styles.infoText}>{employee.address || 'N/A'}</Text>
          </View>
        </SGCard>

        <SGCard style={styles.infoCard}>
          <Text variant="h3" weight="bold" style={styles.sectionTitle}>Employment Details</Text>
          
          <View style={styles.infoRow}>
            <Briefcase size={20} color="#64748B" />
            <View>
              <Text color="#64748B" variant="caption">Employee ID</Text>
              <Text>{employee.employeeCode}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={20} color="#64748B" />
            <View>
              <Text color="#64748B" variant="caption">Join Date</Text>
              <Text>{new Date(employee.joinDate).toLocaleDateString()}</Text>
            </View>
          </View>
        </SGCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroBackground: { height: 280, justifyContent: 'flex-end' },
  heroBlur: { padding: 24, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarFallback: { 
    width: 100, height: 100, borderRadius: 50, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    borderWidth: 2, borderColor: '#FFF',
    alignItems: 'center', justifyContent: 'center' 
  },
  statusBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#10B981', borderWidth: 3, borderColor: '#7C3AED'
  },
  name: { marginBottom: 4 },
  content: { padding: 20, gap: 16, marginTop: -20 },
  infoCard: { padding: 20 },
  sectionTitle: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  infoText: { flex: 1, color: '#1E293B' },
});
