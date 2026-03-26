import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { UserCircle, Briefcase, MapPin } from 'lucide-react-native';

export const CrmViewer = ({ route }: any) => {
  const customerId = route?.params?.id || 'mock-id';

  return (
    <ScrollView style={styles.container}>
      <BlurView intensity={100} tint="dark" style={styles.hero}>
        <UserCircle size={64} color="#FFF" style={{marginBottom: 16}} />
        <Text variant="h1" color="#FFF">Khách Hàng Bí Ẩn</Text>
        <Text variant="body1" color="#94A3B8">ID: {customerId}</Text>
      </BlurView>

      <View style={styles.content}>
         <View style={styles.glassRow}>
           <Briefcase size={20} color="#1E293B" />
           <Text variant="body1" weight="bold" style={{flex: 1, marginLeft: 12}}>Quan tâm Dự án Đảo Kim Cương</Text>
         </View>
         <View style={styles.glassRow}>
           <MapPin size={20} color="#1E293B" />
           <Text variant="body1" weight="bold" style={{flex: 1, marginLeft: 12}}>Quận 2, TP.HCM</Text>
         </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  hero: { padding: 40, paddingTop: 80, alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.8)' },
  content: { padding: 20, gap: 16, marginTop: -20 },
  glassRow: { 
    flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, 
    backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10
  }
});
