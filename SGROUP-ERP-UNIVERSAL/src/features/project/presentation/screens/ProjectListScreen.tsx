import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';

export const ProjectListScreen = () => {
  return (
    <View style={styles.container}>
      <BlurView intensity={90} style={styles.header}>
        <Text variant="h1" weight="bold">Danh sÃ¡ch Dá»± Ã¡n</Text>
      </BlurView>
      <ScrollView contentContainerStyle={styles.list}>
        <Text>Glassmorphism Project List view...</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, paddingTop: 60 },
  list: { padding: 16, gap: 12 }
});
