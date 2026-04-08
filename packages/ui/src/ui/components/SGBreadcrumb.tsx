import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme, typography, sgds } from '../../theme/theme';

interface Props {
  items: { label: string; onPress?: () => void }[];
  separator?: React.ReactNode;
  style?: ViewStyle;
}

export function SGBreadcrumb({ items, separator, style }: Props) {
  const c = useTheme();
  return (
    <View style={[styles.row, style]}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const clickable = !!item.onPress && !last;
        return (
          <React.Fragment key={i}>
            {clickable ? (
              <Pressable onPress={item.onPress} style={Platform.OS === 'web' && (sgds.cursor as any)}>
                <Text style={[typography.small, { color: c.textTertiary }]}>{item.label}</Text>
              </Pressable>
            ) : (
              <Text style={[typography.smallBold, { color: last ? c.text : c.textTertiary }]}>{item.label}</Text>
            )}
            {!last && (separator || <ChevronRight size={14} color={c.textTertiary} strokeWidth={2} style={{ marginHorizontal: 6 }} />)}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
