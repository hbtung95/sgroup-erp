import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, typography, spacing } from '../../theme/theme';

interface Props {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function SGField({ label, hint, error, children }: Props) {
  const c = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[typography.small, styles.label, { color: c.textSecondary }]}>
          {label}
        </Text>
      )}
      
      <View style={error ? { borderColor: c.danger } : undefined}>
        {children}
      </View>

      {error ? (
        <Text style={[typography.caption, styles.error, { color: c.danger }]}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={[typography.caption, styles.hint, { color: c.textDisabled }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
    gap: 6,
  },
  label: {
    fontWeight: '500',
    marginBottom: 2,
  },
  error: {
    marginTop: 4,
  },
  hint: {
    marginTop: 4,
  },
});
