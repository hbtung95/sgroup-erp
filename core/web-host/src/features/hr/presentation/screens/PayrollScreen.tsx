import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useGetPayroll, useGeneratePayroll } from '../../application/hooks/useHRQueries';
import { SGCard } from '@sgroup/ui/src/ui/components/SGCard';

// Skeletal refactor to comply with Feature-Sliced Design
export const PayrollScreen = () => {
  const period = '2026-03';
  const { data: payroll, isLoading } = useGetPayroll(period);
  const { mutateAsync: generatePayroll } = useGeneratePayroll();

  return (
    <ScrollView style={{ padding: 20 }}>
      <SGCard>
        <Text>Payroll Module: {period}</Text>
        {isLoading ? <Text>Loading...</Text> : <Text>{payroll?.length || 0} Records</Text>}
      </SGCard>
    </ScrollView>
  );
};
