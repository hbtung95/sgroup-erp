import React, { useRef, useState, useEffect } from 'react';
import { View, Text, PanResponder, StyleSheet, ViewStyle, Platform, LayoutChangeEvent } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  color?: string; // fallback color if leftColor not provided
  leftColor?: string;
  rightColor?: string;
  trackHeight?: number;
  thumbSize?: number;
  hideHeader?: boolean;
  formatValue?: (v: number) => string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function SGSlider({
  value, onValueChange, min = 0, max = 100, step = 1, label, color, 
  leftColor, rightColor, trackHeight = 8, thumbSize = 22, hideHeader,
  formatValue, disabled, style,
}: Props) {
  const c = useTheme();
  const cLeft = leftColor || color || c.brand;
  const cRight = rightColor || c.bgTertiary;
  
  const widthRef = useRef(0);
  
  const [localVal, setLocalVal] = useState(value);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isDragging.current) {
      setLocalVal(value);
    }
  }, [value]);

  const pct = Math.max(0, Math.min(1, (localVal - min) / (max - min)));

  const propsRef = useRef({ min, max, step, onValueChange, disabled });
  useEffect(() => {
    propsRef.current = { min, max, step, onValueChange, disabled };
  }, [min, max, step, onValueChange, disabled]);

  const snap = (v: number, pMin: number, pMax: number, pStep: number) => {
    const raw = Math.round((v - pMin) / pStep) * pStep + pMin;
    return Math.max(pMin, Math.min(pMax, parseFloat(raw.toFixed(10))));
  };

  const startValRef = useRef(localVal);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !propsRef.current.disabled,
      onMoveShouldSetPanResponder: () => !propsRef.current.disabled,
      onPanResponderGrant: (e) => {
        isDragging.current = true;
        const w = widthRef.current;
        if (w <= 0) return;
        const { min, max, step, onValueChange } = propsRef.current;
        const x = e.nativeEvent.locationX;
        const initialVal = snap(min + (x / w) * (max - min), min, max, step);
        startValRef.current = initialVal;
        setLocalVal(initialVal);
        onValueChange(initialVal);
      },
      onPanResponderMove: (e, gestureState) => {
        const w = widthRef.current;
        if (w <= 0) return;
        const { min, max, step, onValueChange } = propsRef.current;
        const deltaVal = (gestureState.dx / w) * (max - min);
        const newVal = snap(startValRef.current + deltaVal, min, max, step);
        setLocalVal(newVal);
        onValueChange(newVal);
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
        // Optionally trigger one last sync, but usually move covers it
      },
      onPanResponderTerminate: () => {
        isDragging.current = false;
      }
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
  };

  return (
    <View style={[styles.wrap, { opacity: disabled ? 0.5 : 1 }, style]}>
      {!hideHeader && (label || formatValue) && (
        <View style={styles.header}>
          {label && <Text style={[typography.label, { color: c.textSecondary }]}>{label}</Text>}
          <Text style={[typography.bodyBold, { color: cLeft }]}>{formatValue ? formatValue(localVal) : localVal}</Text>
        </View>
      )}
      <View 
        style={[styles.track, { backgroundColor: cRight, height: trackHeight, borderRadius: trackHeight / 2 }]} 
        onLayout={onLayout} 
        {...pan.panHandlers}
      >
        <View 
          pointerEvents="none" 
          style={[
            styles.fill, 
            { width: `${pct * 100}%` as any, backgroundColor: cLeft, height: trackHeight, borderRadius: trackHeight / 2 },
            Platform.OS === 'web' && ({ boxShadow: `0 0 10px ${cLeft}30` } as any)
          ]} 
        />
        <View 
          pointerEvents="none" 
          style={[
            styles.thumb, 
            { 
              left: `${pct * 100}%` as any, backgroundColor: '#fff', borderColor: cLeft,
              width: thumbSize, height: thumbSize, borderRadius: thumbSize / 2,
              top: -(thumbSize - trackHeight)/2, marginLeft: -thumbSize/2,
              borderWidth: thumbSize > 24 ? 4 : 3 
            }, 
            Platform.OS === 'web' && ({ boxShadow: `0 2px 8px rgba(0,0,0,0.15)`, transform: 'translateX(-50%)' } as any)
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16, ...(Platform.OS === 'web' ? { userSelect: 'none' } : {}) as any },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  track: { position: 'relative', justifyContent: 'center', ...(Platform.OS === 'web' ? { cursor: 'pointer', touchAction: 'none' } : {}) as any },
  fill: { position: 'absolute', left: 0, top: 0 },
  thumb: { position: 'absolute', elevation: 4 },
});
