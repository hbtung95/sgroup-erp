import React from 'react';
import { View, StyleSheet , Text } from 'react-native';

export const ProjectDetailView = () => {
  return (
    <View style={styles.container}>
      <Text variant="h2" weight="bold">Chi tiáº¿t Dá»± Ã¡n</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }
});
