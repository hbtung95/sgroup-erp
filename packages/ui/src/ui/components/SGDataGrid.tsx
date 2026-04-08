import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  columns?: number;
  gap?: number;
  minItemWidth?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SGDataGrid({ columns = 3, gap = 16, minItemWidth, children, style }: Props) {
  const items = React.Children.toArray(children);
  return (
    <View style={[styles.grid, { gap }, style]}>
      {items.map((child, i) => (
        <View key={i} style={{ flex: 1, minWidth: minItemWidth || 180 }}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
