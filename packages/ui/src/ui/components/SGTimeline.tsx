import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, typography, radius, spacing } from '../../theme/theme';

interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface Props {
  items: TimelineItem[];
  style?: ViewStyle;
}

export function SGTimeline({ items, style }: Props) {
  const c = useTheme();

  return (
    <View style={[styles.container, style]}>
      {items.map((item, i) => {
        const clr = item.color || c.brand;
        const isLast = i === items.length - 1;
        return (
          <View key={i} style={styles.item}>
            {/* Line + dot */}
            <View style={styles.lineCol}>
              <View style={[styles.dot, { backgroundColor: clr, borderColor: `${clr}30` }]}>
                {item.icon}
              </View>
              {!isLast && <View style={[styles.line, { backgroundColor: c.divider }]} />}
            </View>
            {/* Content */}
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={[typography.bodyBold, { color: c.text, flex: 1 }]}>{item.title}</Text>
                {item.time && <Text style={[typography.caption, { color: c.textTertiary }]}>{item.time}</Text>}
              </View>
              {item.description && (
                <Text style={[typography.small, { color: c.textSecondary, marginTop: 4, lineHeight: 20 }]}>{item.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  item: { flexDirection: 'row', minHeight: 60 },
  lineCol: { width: 32, alignItems: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, zIndex: 1, marginTop: 4 },
  line: { width: 2, flex: 1, marginVertical: 4 },
  content: { flex: 1, paddingLeft: 14, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
