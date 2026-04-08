import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Save, UploadCloud } from 'lucide-react-native';
import { useTheme, typography, sgds, spacing } from '../../theme/theme';
import { SGPillSelector } from './SGPillSelector';
import { SGButton } from './SGButton';
import { SGBottomBar } from './SGBottomBar';

const SCENARIOS = [
  { key: 'base', label: 'Thực tế', color: '#0ea5e9' },
  { key: 'optimistic', label: 'Lạc quan', color: '#22c55e' },
  { key: 'pessimistic', label: 'Thận trọng', color: '#f59e0b' },
];

interface Props {
  emoji?: string;
  title: string;
  year?: number;
  scenario?: string;
  onScenarioChange?: (key: string) => void;
  scenarios?: { key: string; label: string; color?: string }[];
  style?: ViewStyle;
}

export function SGScenarioBar({ emoji, title, year, scenario, onScenarioChange, scenarios, style }: Props) {
  const c = useTheme();
  const opts = scenarios || SCENARIOS;
  const fullTitle = `${emoji ? emoji + ' ' : ''}${title}${year ? ` ${year}` : ''}`;

  return (
    <View style={[styles.bar, { borderBottomColor: c.border }, style]}>
      <Text style={[typography.h3, { color: c.text, textTransform: 'uppercase' }]}>{fullTitle}</Text>
      {onScenarioChange && scenario && (
        <SGPillSelector options={opts} activeKey={scenario} onChange={onScenarioChange} size="sm" />
      )}
    </View>
  );
}

interface ActionBarProps {
  onSave?: () => void;
  onPublish?: () => void;
  saveLabel?: string;
  publishLabel?: string;
  loading?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function SGActionBar({ onSave, onPublish, saveLabel = 'Lưu nháp', publishLabel = 'Xuất bản Kế hoạch', loading, children, style }: ActionBarProps) {
  const c = useTheme();
  return (
    <View style={style}>
      <SGBottomBar style={styles.actionBar as any}>
        <View style={{ flex: 1 }} />
      {children}
      {onSave && (
        <SGButton title={saveLabel} variant="outline" icon={<Save size={16} color={c.textSecondary} />} onPress={onSave} />
      )}
      {onPublish && (
        <SGButton title={publishLabel} variant="primary" icon={<UploadCloud size={16} color="#fff" />} onPress={onPublish} loading={loading} />
      )}
      </SGBottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, flexWrap: 'wrap', gap: 12 },
  actionBar: { justifyContent: 'flex-end' },
});
