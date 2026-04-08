import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Upload, File, X, Image as ImageIcon } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function SGFileUpload({ onFilesSelected, accept, multiple, maxSizeMB = 10, label, hint, disabled, style }: Props) {
  const c = useTheme();
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);

  const handleDrop = (e: any) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer?.files || []) as File[];
    processFiles(dropped);
  };

  const processFiles = (newFiles: File[]) => {
    const valid = newFiles.filter(f => f.size <= maxSizeMB * 1024 * 1024);
    setFiles(valid.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB` })));
    onFilesSelected?.(valid);
  };

  const handleClick = () => {
    if (Platform.OS !== 'web' || disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept || '*';
    input.multiple = multiple || false;
    input.onchange = (e: any) => processFiles(Array.from(e.target.files || []));
    input.click();
  };

  const removeFile = (idx: number) => setFiles(f => f.filter((_, i) => i !== idx));

  return (
    <View style={style}>
      {label && <Text style={[typography.label, { color: c.textSecondary, marginBottom: 8 }]}>{label}</Text>}
      <Pressable
        onPress={handleClick}
        disabled={disabled}
        // @ts-ignore web events
        onDragOver={(e: any) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={[styles.dropZone, {
          borderColor: dragging ? c.brand : c.border,
          backgroundColor: dragging ? `${c.brand}08` : c.bgTertiary,
          opacity: disabled ? 0.5 : 1,
        }, Platform.OS === 'web' && ({ ...sgds.cursor } as any)]}
      >
        <Upload size={28} color={dragging ? c.brand : c.textTertiary} strokeWidth={1.5} />
        <Text style={[typography.body, { color: c.text, fontWeight: '700', marginTop: 12 }]}>
          Kéo thả hoặc click để tải lên
        </Text>
        <Text style={[typography.caption, { color: c.textTertiary, marginTop: 4 }]}>
          {hint || `Tối đa ${maxSizeMB}MB${accept ? ` · ${accept}` : ''}`}
        </Text>
      </Pressable>

      {files.length > 0 && (
        <View style={styles.fileList}>
          {files.map((f, i) => (
            <View key={i} style={[styles.fileItem, { borderColor: c.border }]}>
              <File size={16} color={c.textSecondary} />
              <Text style={[typography.small, { color: c.text, flex: 1 }]} numberOfLines={1}>{f.name}</Text>
              <Text style={[typography.caption, { color: c.textTertiary }]}>{f.size}</Text>
              <Pressable onPress={() => removeFile(i)} style={Platform.OS === 'web' && (sgds.cursor as any)}>
                <X size={14} color={c.textTertiary} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropZone: { borderWidth: 2, borderStyle: 'dashed', borderRadius: radius.xl, padding: spacing['3xl'], alignItems: 'center', justifyContent: 'center' },
  fileList: { marginTop: 12, gap: 8 },
  fileItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
});
