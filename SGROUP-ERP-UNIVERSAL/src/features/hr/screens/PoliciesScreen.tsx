/**
 * PoliciesScreen — HR Policies and Regulations
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { BookOpen, ChevronDown, ChevronUp, Shield, Clock, AlertTriangle, Users, Briefcase } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../../shared/theme/useAppTheme';

import { usePolicies } from '../hooks/useHR';

const ICON_MAP: Record<string, any> = {
  Clock,
  Briefcase,
  Users,
  AlertTriangle,
  Shield,
  BookOpen,
};

export function PoliciesScreen() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: rawPolicies, isLoading } = usePolicies();
  const policies = Array.isArray(rawPolicies) ? rawPolicies : (rawPolicies as any)?.data ?? [];

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 0,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#ec4899', textTransform: 'uppercase', marginBottom: 4 }}>NHÂN SỰ</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Chính Sách Cẩm Nang SGroup</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, marginTop: 8 }}>
            Cập nhật lần cuối: 01/01/2026 • Ban Hành: Giám Đốc Nhân Sự
          </Text>
        </Animated.View>

        {/* Accordion List */}
        <View style={{ gap: 12 }}>
          {isLoading && <Text style={{ color: cSub, textAlign: 'center', padding: 20 }}>Đang tải chính sách...</Text>}
          {!isLoading && policies.length === 0 && <Text style={{ color: cSub, textAlign: 'center', padding: 20 }}>Chưa có chính sách nào được ban hành.</Text>}
          {policies.map((section: any, idx: number) => {
            const isExpanded = expandedId === section.id || (idx === 0 && expandedId === null);
            const SectionIcon = ICON_MAP[section.icon || 'BookOpen'] || BookOpen;
            
            let items: string[] = [];
            try {
              items = JSON.parse(section.items);
            } catch (e) {
              items = typeof section.items === 'string' ? [section.items] : [];
            }

            return (
              <Animated.View entering={FadeInDown.delay(100 + idx * 50).duration(400).springify()} key={section.id} style={cardStyle}>
                <TouchableOpacity
                  onPress={() => setExpandedId(isExpanded ? '' : section.id)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 24, gap: 16,
                    backgroundColor: isExpanded ? (isDark ? `${section.color}10` : `${section.color}08`) : 'transparent',
                  }}
                >
                  <View style={{
                    width: 44, height: 44, borderRadius: 14,
                    backgroundColor: isDark ? `${section.color}20` : `${section.color}15`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <SectionIcon size={22} color={section.color} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 17, fontWeight: '800', color: cText }}>{section.title}</Text>
                  {isExpanded
                    ? <ChevronUp size={20} color={cSub} />
                    : <ChevronDown size={20} color={cSub} />
                  }
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8, gap: 12, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                    {items.map((item, idx) => (
                      <Text key={idx} style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 24 }}>
                        {item}
                      </Text>
                    ))}
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
