import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  style?: ViewStyle;
}

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

export function SGDatePicker({ value, onChange, label, minDate, maxDate, style }: Props) {
  const c = useTheme();
  const today = new Date();
  const sel = value || today;
  const [viewYear, setViewYear] = useState(sel.getFullYear());
  const [viewMonth, setViewMonth] = useState(sel.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(startDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const isSelected = (d: number) => value && value.getDate() === d && value.getMonth() === viewMonth && value.getFullYear() === viewYear;
  const isToday = (d: number) => today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  const isDisabled = (d: number) => {
    const dt = new Date(viewYear, viewMonth, d);
    return (minDate && dt < minDate) || (maxDate && dt > maxDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.bgCard, borderColor: c.border }, style]}>
      {label && <Text style={[typography.label, { color: c.textSecondary, marginBottom: 12 }]}>{label}</Text>}
      <View style={styles.header}>
        <Pressable onPress={prevMonth} style={[styles.navBtn, { backgroundColor: c.bgTertiary }, Platform.OS === 'web' && (sgds.cursor as any)]}>
          <ChevronLeft size={16} color={c.textSecondary} />
        </Pressable>
        <Text style={[typography.bodyBold, { color: c.text }]}>{MONTHS[viewMonth]} {viewYear}</Text>
        <Pressable onPress={nextMonth} style={[styles.navBtn, { backgroundColor: c.bgTertiary }, Platform.OS === 'web' && (sgds.cursor as any)]}>
          <ChevronRight size={16} color={c.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.dayNames}>
        {DAYS.map(d => <Text key={d} style={[styles.dayName, { color: c.textTertiary }]}>{d}</Text>)}
      </View>
      <View style={styles.grid}>
        {days.map((d, i) => d == null ? <View key={i} style={styles.cell} /> : (
          <Pressable key={i} disabled={isDisabled(d)}
            onPress={() => onChange(new Date(viewYear, viewMonth, d))}
            style={({ hovered }: any) => [styles.cell, {
              backgroundColor: isSelected(d) ? c.brand : hovered ? c.bgTertiary : 'transparent',
              borderRadius: 10, opacity: isDisabled(d) ? 0.3 : 1,
            }, isToday(d) && !isSelected(d) && { borderWidth: 2, borderColor: c.brand },
              Platform.OS === 'web' && ({ ...sgds.transition.fast, ...sgds.cursor } as any)]}>
            <Text style={[typography.small, {
              color: isSelected(d) ? '#fff' : c.text,
              fontWeight: isSelected(d) || isToday(d) ? '800' : '500',
            }]}>{d}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: radius['2xl'], padding: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  navBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dayNames: { flexDirection: 'row', marginBottom: 8 },
  dayName: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%` as any, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
});
