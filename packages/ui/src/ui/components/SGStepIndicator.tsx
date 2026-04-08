import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme, typography, sgds } from '../../theme/theme';

interface Step { label: string; description?: string }

interface Props {
  steps: Step[];
  currentStep: number;
  color?: string;
  style?: ViewStyle;
}

export function SGStepIndicator({ steps, currentStep, color, style }: Props) {
  const c = useTheme();
  const clr = color || c.brand;

  return (
    <View style={[styles.row, style]}>
      {steps.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <React.Fragment key={i}>
            <View style={styles.stepWrap}>
              <View style={[styles.circle, {
                backgroundColor: done ? clr : active ? `${clr}20` : c.bgTertiary,
                borderColor: done || active ? clr : c.border,
                borderWidth: active ? 2 : 0,
              }]}>
                {done ? <Check size={14} color="#fff" strokeWidth={3} /> : (
                  <Text style={[typography.smallBold, { color: active ? clr : c.textTertiary }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[typography.caption, {
                color: done || active ? c.text : c.textTertiary,
                fontWeight: active ? '700' : '500',
                textAlign: 'center',
                marginTop: 8,
              }]}>{step.label}</Text>
              {step.description && (
                <Text style={[typography.caption, { color: c.textTertiary, fontSize: 10, textAlign: 'center' }]}>{step.description}</Text>
              )}
            </View>
            {!isLast && (
              <View style={[styles.line, { backgroundColor: done ? clr : c.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  stepWrap: { alignItems: 'center', flex: 1 },
  circle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  line: { height: 2, flex: 1, marginTop: 15, marginHorizontal: -8 },
});
