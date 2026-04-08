import React, { useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, sgds, radius } from '../../theme/theme';

interface Props {
  children: React.ReactNode;
  variant?: 'base' | 'glass' | 'gradient' | 'elevated' | 'glow';
  gradientColors?: readonly [string, string, ...string[]];
  onPress?: () => void;
  noPadding?: boolean;
  style?: ViewStyle;
}

export function SGCard({ children, variant = 'base', gradientColors, onPress, noPadding, style }: Props) {
  const c = useTheme();
  const cardRef = useRef<any>(null);

  // Mouse tracking logic for Web (from AppScript script)
  useEffect(() => {
    if (Platform.OS === 'web' && (variant === 'elevated' || variant === 'glow' || variant === 'glass')) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        cardRef.current.style.setProperty('--mouse-x', `${x}%`);
        cardRef.current.style.setProperty('--mouse-y', `${y}%`);
      };

      const element = cardRef.current;
      if (element) {
        element.addEventListener('mousemove', handleMouseMove);
        return () => element.removeEventListener('mousemove', handleMouseMove);
      }
    }
  }, [variant]);

  const variantStyle = variant === 'glass'
    ? { backgroundColor: c.glass, borderColor: c.glassBorder, ...sgds.glass }
    : variant === 'elevated' || variant === 'glow'
    ? { backgroundColor: c.bgElevated, borderColor: c.glassBorder }
    : { backgroundColor: c.bgCard, borderColor: c.border };

  const webStyles = Platform.OS === 'web' ? {
    boxShadow: variant === 'elevated' || variant === 'glow' 
      ? `0 24px 64px -12px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.05), 0 0 0 1px ${c.glassBorder}` 
      : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: variant === 'glass' ? 'blur(32px) saturate(180%)' : 'none',
    WebkitBackdropFilter: variant === 'glass' ? 'blur(32px) saturate(180%)' : 'none',
  } as any : {};

  // Custom glow background for web
  const glowOverlay = Platform.OS === 'web' && (variant === 'elevated' || variant === 'glow' || variant === 'glass') ? (
    <div 
      className="sg-card-glow"
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        background: `radial-gradient(1000px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--sg-accent-blue-rgb), 0.15), transparent 40%)`,
        zIndex: 0,
        opacity: 0,
        transition: 'opacity 0.4s ease',
      }}
    />
  ) : null;

  const inner = (
    //@ts-ignore - ref for web
    <View ref={cardRef} style={[styles.card, variantStyle as any, webStyles, noPadding && { padding: 0 }, style]}>
      {glowOverlay}
      <View style={{ zIndex: 1 }}>
        {children}
      </View>
      <style>{`
        .sg-card:hover .sg-card-glow { opacity: 1 !important; }
      `}</style>
    </View>
  );

  if (variant === 'gradient') {
    const colors = gradientColors || (c.gradientBrand as any);
    return onPress ? (
      <Pressable onPress={onPress}
        style={({ hovered }: any) => [Platform.OS === 'web' && ({
          ...sgds.transition.fast, ...sgds.cursor,
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? `0 12px 32px ${c.shadowStrong}` : 'none',
        } as any)]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.card, { borderColor: 'transparent' }, noPadding && { padding: 0 }, style]}>
          {children}
        </LinearGradient>
      </Pressable>
    ) : (
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: 'transparent' }, noPadding && { padding: 0 }, style]}>
        {children}
      </LinearGradient>
    );
  }

  if (onPress) {
    return (
      <Pressable onPress={onPress}
        {...(Platform.OS === 'web' ? { className: 'sg-card' } : {}) as any}
        style={({ hovered }: any) => [Platform.OS === 'web' && ({
          ...sgds.transition.fast, ...sgds.cursor,
          transform: hovered ? 'translateY(-4px)' : 'none',
        } as any)]}>
        {inner}
      </Pressable>
    );
  }

  return <View {...(Platform.OS === 'web' ? { className: 'sg-card' } : {}) as any}>{inner}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 24,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' } : {}) as any,
  },
});
