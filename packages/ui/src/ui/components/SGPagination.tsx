import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme, typography, sgds } from '../../theme/theme';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  style?: ViewStyle;
}

export function SGPagination({ currentPage, totalPages, onPageChange, siblingCount = 1, style }: Props) {
  const c = useTheme();

  const range = (start: number, end: number) => new Array(end - start + 1).fill(0).map((_, i) => start + i);

  const pages = (() => {
    const total = siblingCount * 2 + 5;
    if (totalPages <= total) return range(1, totalPages);
    const leftSib = Math.max(currentPage - siblingCount, 1);
    const rightSib = Math.min(currentPage + siblingCount, totalPages);
    const showLeftDots = leftSib > 2;
    const showRightDots = rightSib < totalPages - 1;
    if (!showLeftDots && showRightDots) return [...range(1, 3 + siblingCount * 2), -1, totalPages];
    if (showLeftDots && !showRightDots) return [1, -2, ...range(totalPages - (2 + siblingCount * 2), totalPages)];
    return [1, -2, ...range(leftSib, rightSib), -1, totalPages];
  })();

  const btn = (page: number | string, content: React.ReactNode, onPress?: () => void, active?: boolean) => (
    <Pressable key={String(page)} onPress={onPress} disabled={!onPress}
      style={({ hovered }: any) => [styles.btn, {
        backgroundColor: active ? c.brand : hovered && onPress ? c.bgTertiary : 'transparent',
        borderColor: active ? c.brand : 'transparent',
      }, Platform.OS === 'web' && onPress && ({ ...sgds.transition.fast, ...sgds.cursor } as any)]}>
      {typeof content === 'string' || typeof content === 'number'
        ? <Text style={[typography.smallBold, { color: active ? '#fff' : onPress ? c.text : c.textTertiary }]}>{content}</Text>
        : content}
    </Pressable>
  );

  return (
    <View style={[styles.row, style]}>
      {btn('prev', <ChevronLeft size={16} color={currentPage === 1 ? c.textTertiary : c.textSecondary} />,
        currentPage > 1 ? () => onPageChange(currentPage - 1) : undefined)}
      {pages.map(p => p < 0
        ? btn(p, '···')
        : btn(p, p, () => onPageChange(p), p === currentPage))}
      {btn('next', <ChevronRight size={16} color={currentPage === totalPages ? c.textTertiary : c.textSecondary} />,
        currentPage < totalPages ? () => onPageChange(currentPage + 1) : undefined)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  btn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
