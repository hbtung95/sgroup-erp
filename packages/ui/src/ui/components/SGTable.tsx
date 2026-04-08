import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ViewStyle, Platform, ActivityIndicator } from 'react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';
import { SGButton } from './SGButton';

export type TableColumn = {
  key: string;
  title: string;
  flex?: number;
  width?: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any, index: number) => React.ReactNode;
};

interface Props {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  onRowPress?: (row: any, index: number) => void;
  emptyText?: string;
  style?: ViewStyle;
  // Pagination props from AppScript code
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function SGTable({ 
  columns, 
  data = [], 
  loading = false,
  onRowPress, 
  emptyText = 'Không có dữ liệu', 
  style,
  page = 1,
  pageSize = 10,
  onPageChange
}: Props) {
  const c = useTheme();

  if (loading) {
    return (
      <View style={[styles.wrap, styles.center, { borderColor: c.border, backgroundColor: c.bgTertiary }, style]}>
        <ActivityIndicator color={c.brand} size="large" />
        <Text style={[typography.small, { color: c.textSecondary, marginTop: spacing.md }]}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.wrap, styles.center, { borderColor: c.border, backgroundColor: c.bgTertiary }, style]}>
        <Text style={[typography.body, { color: c.textTertiary }]}>{emptyText}</Text>
      </View>
    );
  }

  // Pagination logic
  const start = (page - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);
  const totalPages = Math.ceil(data.length / pageSize);

  const renderCell = (col: TableColumn, row: any, idx: number) => {
    const val = row[col.key];
    const content = col.render ? col.render(val, row, idx) : (
      <Text style={[typography.small, { color: c.text, textAlign: col.align || 'left' }]} numberOfLines={1}>
        {val}
      </Text>
    );
    return (
      <View key={col.key} style={[styles.cell, col.width ? { width: col.width, flexShrink: 0 } : { flex: col.flex || 1 }, col.minWidth ? { minWidth: col.minWidth } : {}]}>
        {content}
      </View>
    );
  };

  return (
    <View style={[styles.wrap, { borderColor: c.border, backgroundColor: c.bgTertiary }, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: '100%' }}>
        <View style={{ flex: 1, minWidth: (Platform.OS === 'web' ? '100%' : 720) as any }}>
          {/* Header - Sticky Header on Web via backdropFilter */}
          <View style={[
            styles.headerRow, 
            { 
              backgroundColor: c.bgSecondary, 
              borderBottomColor: c.divider,
              ...(Platform.OS === 'web' ? { 
                position: 'sticky', 
                top: 0, 
                zIndex: 10,
                backgroundColor: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              } : {} as any)
            }
          ]}>
            {columns.map(col => (
              <View key={col.key} style={[styles.cell, col.width ? { width: col.width, flexShrink: 0 } : { flex: col.flex || 1 }, col.minWidth ? { minWidth: col.minWidth } : {}]}>
                <Text style={[typography.label, { color: c.textSecondary, textAlign: col.align || 'left', fontSize: 12 }]}>
                  {col.title}
                </Text>
              </View>
            ))}
          </View>

          {/* Body */}
          <View>
            {pageData.map((row, i) => (
              <Pressable 
                key={i}
                style={({ hovered }: any) => [
                  styles.dataRow,
                  { borderBottomColor: c.divider },
                  hovered && { backgroundColor: 'rgba(79,124,255,0.06)' }, // Calm hover from AppScript
                  Platform.OS === 'web' && (sgds.transition.fast as any)
                ]}
                onPress={() => onRowPress?.(row, i)}
                disabled={!onRowPress}
              >
                {columns.map(col => renderCell(col, row, i))}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Pagination Footer */}
      <View style={[styles.footer, { borderTopColor: c.divider }]}>
        <Text style={[typography.caption, { color: c.textSecondary }]}>
          Trang {page} / {totalPages}
        </Text>
        <View style={styles.footerActions}>
          <SGButton 
            variant="ghost" 
            title="Prev" 
            size="sm"
            disabled={page === 1}
            onPress={() => onPageChange?.(page - 1)}
          />
          <View style={{ width: spacing.sm }} />
          <SGButton 
            variant="ghost" 
            title="Next" 
            size="sm"
            disabled={page === totalPages}
            onPress={() => onPageChange?.(page + 1)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    width: '100%',
    borderWidth: 1, 
    borderRadius: radius.lg, 
    overflow: 'hidden',
  },
  center: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    paddingHorizontal: spacing.base, 
    borderBottomWidth: 1,
  },
  dataRow: { 
    flexDirection: 'row', 
    paddingVertical: 14, 
    paddingHorizontal: spacing.base, 
    borderBottomWidth: 1,
  },
  cell: { 
    paddingHorizontal: 8, 
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderTopWidth: 1,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
