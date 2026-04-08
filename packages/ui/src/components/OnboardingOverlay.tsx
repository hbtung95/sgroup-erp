import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react-native';
import { useThemeStore } from '../theme/themeStore';
import { useTheme } from '../theme/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OnboardingStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface OnboardingOverlayProps {
  steps: OnboardingStep[];
  storageKey: string; // e.g. 'onboarding_sales_v1'
  onComplete?: () => void;
}

/**
 * Onboarding overlay — shown once on first visit.
 * Provides step-by-step guided tour with slide navigation.
 * Stores completion in AsyncStorage so user sees it only once.
 */
export function OnboardingOverlay({ steps, storageKey, onComplete }: OnboardingOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const colors = useTheme();
  const { isDark } = useThemeStore();

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then(val => {
      if (!val) {
        setVisible(true);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      }
    }).catch(() => {});
  }, []);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setVisible(false);
      AsyncStorage.setItem(storageKey, 'done').catch(() => {});
      onComplete?.();
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (!visible) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={[styles.card, {
        backgroundColor: isDark ? 'rgba(15,23,42,0.97)' : '#fff',
        borderColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)',
        ...(Platform.OS === 'web' ? {
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
        } : {}),
      } as any]}>
        {/* Close */}
        <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
          <X size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` } as any]} />
        </View>

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5' }]}>
          {step.icon || <Sparkles size={32} color="#10b981" />}
        </View>

        {/* Content */}
        <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{step.description}</Text>

        {/* Step indicator */}
        <View style={styles.dotsRow}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === currentStep ? '#10b981' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0') }]} />
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity onPress={handlePrev} disabled={currentStep === 0}
            style={[styles.navBtn, { opacity: currentStep === 0 ? 0.3 : 1 }]}>
            <ChevronLeft size={18} color={colors.textSecondary} />
            <Text style={[styles.navText, { color: colors.textSecondary }]}>Trước</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={[styles.nextBtn, { backgroundColor: isLast ? '#10b981' : (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5') }]}>
            <Text style={[styles.navText, { color: isLast ? '#fff' : '#10b981', fontWeight: '800' }]}>
              {isLast ? 'Bắt đầu!' : 'Tiếp theo'}
            </Text>
            {!isLast && <ChevronRight size={18} color="#10b981" />}
          </TouchableOpacity>
        </View>

        {/* Skip */}
        <TouchableOpacity onPress={handleDismiss} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: colors.textTertiary }]}>Bỏ qua hướng dẫn</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: '90%',
    maxWidth: 480,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(150,150,150,0.15)',
    borderRadius: 2,
    marginBottom: 28,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'web' ? "'Plus Jakarta Sans', system-ui, sans-serif" : undefined,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Platform.OS === 'web' ? "'Plus Jakarta Sans', system-ui, sans-serif" : undefined,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  navText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'web' ? "'Plus Jakarta Sans', system-ui, sans-serif" : undefined,
  },
  skipBtn: {
    marginTop: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'web' ? "'Plus Jakarta Sans', system-ui, sans-serif" : undefined,
  },
});
