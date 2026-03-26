/**
 * MarketingReports — Premium analytics & reporting cards
 * SGDS: glass cards with glow, gradient icons, animations
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { BarChart3, TrendingUp, PieChart, Activity, Download } from 'lucide-react-native';
import { SGPageContainer, SGButton } from '../../../../shared/ui';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { typography, spacing, radius, sgds } from '../../../../shared/theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

const REPORT_CARDS = [
  {
    title: 'Báo cáo ROI Chiến dịch',
    description: 'Phân tích lợi tức đầu tư chi tiết theo từng chiến dịch và kênh quảng cáo.',
    icon: TrendingUp,
    gradient: ['#F59E0B', '#D97706'] as [string, string],
  },
  {
    title: 'Phân bổ Nguồn Lead',
    description: 'Thống kê chi tiết tỷ lệ chuyển đổi MQL/SQL theo từng nguồn gốc đổ về CRM.',
    icon: PieChart,
    gradient: ['#3b82f6', '#6366f1'] as [string, string],
  },
  {
    title: 'Phân tích Creative/Ads',
    description: 'Đo lường độ "fatigue" của creative và so sánh tỷ lệ A/B testing nội dung quảng cáo.',
    icon: Activity,
    gradient: ['#8b5cf6', '#a855f7'] as [string, string],
  },
];

const AnimatedCard = ({ index, children }: { index: number; children: React.ReactNode }) => {
  const translateY = useSharedValue(24);
  const opacity = useSharedValue(0);
  useEffect(() => {
    const delay = index * 80;
    translateY.value = withDelay(delay, withSpring(0, { damping: 22, stiffness: 90 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
};

export function MarketingReports() {
  const { theme, isDark, colors } = useAppTheme();

  return (
    <SGPageContainer>
      {/* Header */}
      <AnimatedCard index={0}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIcon}
            >
              <BarChart3 size={26} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[typography.h1, { color: colors.text }]}>Báo Cáo Phân Tích</Text>
              <Text style={[typography.small, { color: colors.textSecondary, marginTop: 3 }]}>
                Insight & báo cáo chuyên sâu tự động
              </Text>
            </View>
          </View>
          <SGButton title="Xuất Báo Cáo" icon={<Download size={18} color="#fff" />} onPress={() => {}} />
        </View>
      </AnimatedCard>

      {/* Report Cards */}
      <View style={styles.cardsRow}>
        {REPORT_CARDS.map((card, i) => {
          const IconComp = card.icon;
          return (
            <AnimatedCard key={i} index={i + 1}>
              <View style={[styles.reportCard, {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              }, Platform.OS === 'web' ? {
                ...sgds.glass,
                ...sgds.transition.normal,
              } as any : {}]}>
                <LinearGradient
                  colors={card.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardIcon}
                >
                  <IconComp size={32} color="#fff" strokeWidth={1.5} />
                </LinearGradient>
                <Text style={[typography.h3, { color: colors.text, marginBottom: 8, textAlign: 'center' }]}>
                  {card.title}
                </Text>
                <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
                  {card.description}
                </Text>
                <SGButton title="Xem Báo Cáo" variant="outline" onPress={() => {}} />
              </View>
            </AnimatedCard>
          );
        })}
      </View>
    </SGPageContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  reportCard: {
    flex: 1,
    minWidth: 300,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
