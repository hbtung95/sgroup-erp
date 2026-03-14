import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useTheme, typography } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard, SGButton } from '../../../shared/ui';
import { FolderPlus, FileCheck, FolderOpen, MoreVertical, FileText, Image as ImageIcon, Download } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

const MOCK_FOLDERS = [
  { id: '1', name: 'Pháp lý dự án', count: 12, size: '45 MB', updatedAt: '2023-10-12', color: '#10b981' },
  { id: '2', name: 'Sale Kit', count: 24, size: '120 MB', updatedAt: '2023-10-15', color: '#3b82f6' },
  { id: '3', name: 'Mặt bằng & Thiết kế', count: 8, size: '85 MB', updatedAt: '2023-10-10', color: '#f59e0b' },
  { id: '4', name: 'Chính sách', count: 3, size: '5 MB', updatedAt: '2023-10-16', color: '#8b5cf6' },
];

const MOCK_FILES = [
  { id: '1', name: 'Giấy phép xây dựng.pdf', type: 'pdf', size: '2.5 MB', uploader: 'Nguyễn Văn A', date: '12/10/2023' },
  { id: '2', name: 'Sale_Kit_Full_Version_v2.pptx', type: 'powerpoint', size: '45 MB', uploader: 'Trần Thị B', date: '15/10/2023' },
  { id: '3', name: 'Mặt bằng Tầng 3-15.png', type: 'image', size: '4.2 MB', uploader: 'Nguyễn Văn A', date: '10/10/2023' },
  { id: '4', name: 'Quy_trinh_giu_cho_Q4.docx', type: 'word', size: '1.2 MB', uploader: 'Lê Văn C', date: '16/10/2023' },
];

export function ProjectDocs() {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const [activeTab, setActiveTab] = useState('folders');

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={22} color="#ef4444" />;
      case 'image': return <ImageIcon size={22} color="#10b981" />;
      case 'word': return <FileText size={22} color="#3b82f6" />;
      case 'powerpoint': return <FileText size={22} color="#f59e0b" />;
      default: return <FileText size={22} color={colors.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Aurora Backdrop */}
      {Platform.OS === 'web' && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 0, overflow: 'hidden' }]} pointerEvents="none">
          <View style={{
            position: 'absolute', top: '15%', left: '-8%', width: 500, height: 500,
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.03)' : 'rgba(59, 130, 246, 0.02)',
            borderRadius: 250,
          } as any} />
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { zIndex: 1 }]}>
        <View>
          <Text style={[typography.h1, { color: colors.text, fontWeight: '800', letterSpacing: -0.5 }]}>Tài liệu Dự án</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8, fontSize: 15 }]}>
            Quản lý và lưu trữ hồ sơ pháp lý, ấn phẩm truyền thông
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SGButton title="Tạo Thư mục" icon={<FolderPlus size={18} color="#10b981" />} variant="outline" onPress={() => {}} 
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />
          <SGButton title="Tải lên" icon={<FileCheck size={18} color="#fff" />} variant="primary" onPress={() => {}} 
            style={{ backgroundColor: '#10b981' }} />
        </View>
      </View>

      <View style={[styles.sectionCard, isDark ? styles.glassCardDark : styles.glassCardLight, Platform.OS === 'web' && styles.glassEffect as any, { zIndex: 1 }]}>
        {/* Tabs */}
        <View style={{ flexDirection: 'row', gap: 24, marginBottom: 28, borderBottomWidth: 2, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
          {['folders', 'recent'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={{ paddingBottom: 14, borderBottomWidth: 3, borderBottomColor: activeTab === tab ? '#3b82f6' : 'transparent', marginBottom: -2 }}
            >
              <Text style={[typography.body, { 
                color: activeTab === tab ? '#3b82f6' : colors.textSecondary,
                fontWeight: activeTab === tab ? '800' : '600'
              }]}>
                {tab === 'folders' ? 'Thư mục' : 'Truy cập gần đây'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Folders Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 36 }}>
            {MOCK_FOLDERS.map(folder => (
              <TouchableOpacity key={folder.id} style={[styles.folderCard, { 
                backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                ...(Platform.OS === 'web' && { 
                  boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                } as any),
              }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                  <View style={[styles.folderIconBox, { backgroundColor: `${folder.color}12` }]}>
                    <FolderOpen size={22} color={folder.color} fill={`${folder.color}30`} />
                  </View>
                  <TouchableOpacity style={{ padding: 4 }}>
                    <MoreVertical size={16} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
                <Text style={[typography.h4, { color: colors.text, marginBottom: 6, fontWeight: '800' }]} numberOfLines={1}>{folder.name}</Text>
                <Text style={[typography.micro, { color: colors.textSecondary, fontWeight: '500' }]}>{folder.count} files • {folder.size}</Text>
                <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 14, fontWeight: '500' }]}>Cập nhật: {folder.updatedAt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Files List */}
          <Text style={[typography.h4, { color: colors.text, marginBottom: 18, fontWeight: '800' }]}>Danh sách Tài liệu</Text>
          <View style={{ gap: 12 }}>
            {MOCK_FILES.map((file, idx) => (
              <View key={file.id} style={[styles.fileRow, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                ...(Platform.OS === 'web' && { boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.02)' } as any),
              }]}>
                <View style={[styles.fileIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }]}>
                  {getFileIcon(file.type)}
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[typography.body, { color: colors.text, fontWeight: '700', fontSize: 14 }]} numberOfLines={1}>{file.name}</Text>
                  <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 4, fontWeight: '500' }]}>
                    {file.size} • Tải lên bởi {file.uploader}
                  </Text>
                </View>
                <Text style={[typography.micro, { color: colors.textTertiary, width: 100, textAlign: 'right', fontWeight: '500' }]}>{file.date}</Text>
                <TouchableOpacity style={[styles.actionBtn, { marginLeft: 16 }]}>
                  <Download size={17} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <MoreVertical size={17} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: isDesktop ? 40 : 20, paddingBottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  folderCard: {
    width: (Platform.OS === 'web' ? 'calc(25% - 15px)' : '46%') as any,
    minWidth: 200, padding: 22, borderRadius: 18, borderWidth: 1
  },
  folderIconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  fileRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1 },
  fileIconBox: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  actionBtn: { padding: 8, borderRadius: 8 },
  sectionCard: { padding: 28, borderRadius: 20, flex: 1 },
  glassEffect: {
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as any),
  },
  glassCardDark: { backgroundColor: 'rgba(30, 41, 59, 0.65)', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1, ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' } as any) },
  glassCardLight: { backgroundColor: 'rgba(255, 255, 255, 0.85)', borderColor: 'rgba(0, 0, 0, 0.04)', borderWidth: 1, ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)' } as any) },
});
