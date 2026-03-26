/**
 * ProjectDocs — Tài liệu Dự án cho NVKD
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { FolderOpen, FileText, Download, Eye, Search, ChevronRight, Image as ImageIcon, Film } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGPlanningSectionTitle } from '../../../../shared/ui/components';

type DocItem = {
  id: string;
  name: string;
  project: string;
  category: 'brochure' | 'pricelist' | 'policy' | 'media' | 'contract';
  size: string;
  date: string;
};

const CATEGORIES = [
  { key: 'all', label: 'Tất Cả', count: 10 },
  { key: 'brochure', label: 'Brochure', count: 3 },
  { key: 'pricelist', label: 'Bảng Giá', count: 3 },
  { key: 'policy', label: 'Chính Sách', count: 2 },
  { key: 'media', label: 'Ảnh / Video', count: 1 },
  { key: 'contract', label: 'Mẫu HĐ', count: 1 },
];

const docs: DocItem[] = [];

const CAT_ICONS: Record<string, any> = {
  brochure: { icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
  pricelist: { icon: FileText, color: '#8b5cf6', bg: '#f5f3ff' },
  policy: { icon: FileText, color: '#f59e0b', bg: '#fffbeb' },
  media: { icon: ImageIcon, color: '#ec4899', bg: '#fdf2f8' },
  contract: { icon: FileText, color: '#22c55e', bg: '#f0fdf4' },
};

export function ProjectDocs() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? docs : docs.filter(d => d.category === filter);

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase', marginBottom: 4 }}>TÀI LIỆU DỰ ÁN</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Kho Tài Liệu Bán Hàng</Text>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.key} onPress={() => setFilter(cat.key)}
              style={{
                paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14,
                backgroundColor: filter === cat.key ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                borderWidth: 1, borderColor: filter === cat.key ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
              }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: filter === cat.key ? '#fff' : cSub }}>
                {cat.label} ({cat.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* File List */}
        <View style={cardStyle}>
          <SGPlanningSectionTitle icon={FolderOpen} title="Tệp Tin" accent="#3b82f6" badgeText="FILES" style={{ marginBottom: 24 }} />

          <View style={{ gap: 8 }}>
            {filtered.map(doc => {
              const catCfg = CAT_ICONS[doc.category] || CAT_ICONS.brochure;
              const CatIcon = catCfg.icon;
              return (
                <TouchableOpacity key={doc.id} style={{
                  flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                }}>
                  <View style={{
                    width: 48, height: 48, borderRadius: 14,
                    backgroundColor: isDark ? `${catCfg.color}15` : catCfg.bg,
                    alignItems: 'center', justifyContent: 'center', marginRight: 16,
                  }}>
                    <CatIcon size={22} color={catCfg.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: cText, marginBottom: 4 }} numberOfLines={1}>{doc.name}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>
                      {doc.project} • {doc.size} • {doc.date}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                      <Eye size={16} color={cSub} />
                    </View>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', alignItems: 'center', justifyContent: 'center' }}>
                      <Download size={16} color="#3b82f6" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
