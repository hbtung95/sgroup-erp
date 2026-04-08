import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  children: React.ReactNode;
  title?: string;
  titleIcon?: React.ReactNode;
  titleColor?: string;
  seq?: number;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
  style?: ViewStyle;
}

export function SGSection({ children, title, titleIcon, titleColor, seq, headerRight, noPadding, style }: Props) {
  const c = useTheme();

  return (
    <View style={[styles.section, {
      backgroundColor: c.bgCard, borderColor: c.border,
    }, Platform.OS === 'web' && ({
      ...sgds.glass,
      backdropFilter: 'blur(32px) saturate(180%)',
      WebkitBackdropFilter: 'blur(32px) saturate(180%)',
      boxShadow: `0 8px 32px ${c.shadow}`,
    } as any), noPadding && { padding: 0 }, style]}>
      {title && (
        <View style={[styles.header, noPadding && { paddingHorizontal: spacing['2xl'], paddingTop: spacing['2xl'] }]}>
          <View style={styles.titleRow}>
            {titleColor && <View style={[styles.accent, { backgroundColor: titleColor }]} />}
            {titleIcon && (
              <View style={[styles.iconBox, { backgroundColor: `${titleColor || c.brand}20` }]}>
                {titleIcon}
              </View>
            )}
            {seq != null && (
              <View style={[styles.seqBox, { backgroundColor: `${titleColor || c.brand}15` }]}>
                <Text style={[typography.smallBold, { color: titleColor || c.brand }]}>{seq}</Text>
              </View>
            )}
            <Text style={[typography.h3, { color: c.text, textTransform: 'uppercase', letterSpacing: 1 }]}>{title}</Text>
          </View>
          {headerRight}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: radius['2xl'] + 4,
    padding: spacing['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  accent: { width: 4, height: 28, borderRadius: 2 },
  iconBox: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  seqBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
