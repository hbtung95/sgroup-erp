import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  minChildWidth?: number;
  style?: ViewStyle;
}

export function SGGrid({ children, columns, gap = 16, minChildWidth = 280, style }: Props) {
  const items = React.Children.toArray(children);

  return (
    <View style={[styles.grid, { gap }, style]}>
      {items.map((child, i) => (
        <View key={i} style={{
          flex: columns ? 1 / columns : 1,
          minWidth: minChildWidth,
          flexBasis: columns ? `${100 / columns}%` as any : 'auto',
        }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
