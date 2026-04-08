import React, { useRef } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useTheme, animations, sgds } from '../../theme/theme';
import { SGIcons } from './SGIcons';

interface Props {
  onStep: (dir: number) => void;
  onStop: () => void;
}

export function SGStepper({ onStep, onStop }: Props) {
  const c = useTheme();
  const timerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const startHold = (dir: number) => {
    onStep(dir);
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => onStep(dir), 100);
    }, 400);
  };

  const stopHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onStop();
  };

  const StepBtn = ({ dir, icon }: { dir: number, icon: string }) => (
    <Pressable
      onPressIn={() => startHold(dir)}
      onPressOut={stopHold}
      style={({ hovered, pressed }: any) => [
        styles.btn,
        { 
          backgroundColor: c.glassHeavy,
          borderColor: c.glassBorder,
        },
        Platform.OS === 'web' && hovered && { filter: 'brightness(1.1)', borderColor: c.brand } as any,
        pressed && { transform: [{ translateY: 0.5 }, { scale: 0.98 }] },
      ]}
    >
      {(SGIcons as any)[icon]({ size: 10, color: c.textSecondary, strokeWidth: 3 })}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StepBtn dir={1} icon="ChevronUp" />
      <StepBtn dir={-1} icon="ChevronDown" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -17 }],
    gap: 4,
    zIndex: 10,
  },
  btn: {
    width: 22,
    height: 15,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { 
      backdropFilter: 'blur(10px)', 
      WebkitBackdropFilter: 'blur(10px)',
      transition: 'all 0.1s ease',
    } : {}) as any,
  },
});
