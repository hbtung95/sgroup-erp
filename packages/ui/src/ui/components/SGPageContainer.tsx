import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, sgds } from '../../theme/theme';

interface Props {
  children: React.ReactNode;
  maxWidth?: number;
  padding?: number;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  bottomBar?: React.ReactNode;
}

export function SGPageContainer({ children, maxWidth = 1200, padding = sgds.layout.contentPadding, scrollable = true, style, contentStyle, bottomBar }: Props) {
  const c = useTheme();
  const inner = <View style={[styles.inner, { maxWidth, padding }, contentStyle]}>{children}</View>;
  return (
    <View style={[styles.container, { backgroundColor: c.bg }, style]}>
      {scrollable ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {inner}
        </ScrollView>
      ) : <View style={styles.scroll}>{inner}</View>}
      {bottomBar}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center' },
  inner: { width: '100%', paddingBottom: 100 },
});
