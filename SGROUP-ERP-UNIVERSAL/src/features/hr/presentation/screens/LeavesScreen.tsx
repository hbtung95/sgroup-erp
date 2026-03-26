import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useGetLeaves, useRequestLeave } from '../../application/hooks/useHRQueries';
import { SGCard } from '../../../../shared/ui/SGCard';

// Skeletal refactor to comply with Feature-Sliced Design
export const LeavesScreen = () => {
  const { data: leaves, isLoading } = useGetLeaves();
  const { mutateAsync: requestLeave } = useRequestLeave();

  return (
    <ScrollView style={{ padding: 20 }}>
      <SGCard>
        <Text>Leave Management Module</Text>
        {isLoading ? <Text>Loading...</Text> : <Text>{leaves?.total || 0} Leaves Found</Text>}
      </SGCard>
    </ScrollView>
  );
};
