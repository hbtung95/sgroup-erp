import React, { useRef } from 'react';
import { Pressable, Text, View, StyleSheet, Platform, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, sgds, typography, animations, radius } from '../../theme/theme';
import { SGIcons } from './SGIcons';

interface Props {
  title: string;
  onPress?: (event?: any) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string | React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function SGButton({
  title, onPress, variant = 'primary', size = 'md', disabled, loading,
  icon, iconPosition = 'left', fullWidth, style,
}: Props) {
  const c = useTheme();
  const btnRef = useRef<any>(null);

  const sizeStyle = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;
  const textSize = size === 'sm' ? typography.smallBold : typography.bodyBold;
  const isDisabled = disabled || loading;
  const fwStyle = fullWidth ? { width: '100%' as any } : {};

  // Ripple effect logic for Web
  const handlePress = (event: any) => {
    if (isDisabled || !onPress) return;

    if (Platform.OS === 'web' && btnRef.current) {
      const button = btnRef.current;
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const clickEvent = event.nativeEvent || event;
      
      const sizeVal = Math.max(rect.width, rect.height);
      const x = (clickEvent.clientX || 0) - rect.left - sizeVal / 2;
      const y = (clickEvent.clientY || 0) - rect.top - sizeVal / 2;
      
      ripple.className = 'sg-ripple';
      Object.assign(ripple.style, {
        width: `${sizeVal}px`,
        height: `${sizeVal}px`,
        left: `${x}px`,
        top: `${y}px`,
        position: 'absolute',
        borderRadius: '50%',
        transform: 'scale(0)',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        pointerEvents: 'none',
        animation: 'sgRipple 0.6s linear',
      });
      
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
    
    onPress(event);
  };

  const renderIcon = (color: string) => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      const IconCmp = (SGIcons as any)[icon];
      return IconCmp ? <IconCmp size={size === 'sm' ? 14 : 16} color={color} /> : null;
    }
    // If it's a function component or an object-based component (e.g. forwardRef from Lucide)
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && !React.isValidElement(icon))) {
      const IconCmp = icon as any;
      return <IconCmp size={size === 'sm' ? 14 : 16} color={color} />;
    }
    // If it's already a React element, clone it or return it
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as any, { color });
    }
    return null;
  };

  const renderContent = (textColor: string) => (
    loading ? (
      <View style={styles.loadingContainer}>
        {Platform.OS === 'web' ? <div className="sg-spinner" style={{ width: 16, height: 16 }} /> : <ActivityIndicator color={textColor} size="small" />}
        <Text style={[textSize, { color: textColor, marginLeft: 8 }]}>{title}</Text>
      </View>
    ) : (
      <View style={[styles.inner, iconPosition === 'right' && { flexDirection: 'row-reverse' }]}>
        {renderIcon(textColor)}
        <Text style={[textSize, { color: textColor }]}>{title}</Text>
      </View>
    )
  );

  const commonWebStyle = Platform.OS === 'web' ? {
    ...sgds.transition.fast,
    ...sgds.cursor,
    userSelect: 'none',
    position: 'relative',
    // Removed overflow: 'hidden' to allow drop-shadows to be visible
  } as any : {};

  if (variant === 'primary') {
    return (
      //@ts-ignore ref for web
      <Pressable ref={btnRef} onPress={handlePress} disabled={isDisabled}
        style={({ hovered, pressed }: any) => [
          fwStyle,
          commonWebStyle,
          { borderRadius: radius.md }, // if the outer receives border radius from style it will be merged below
          hovered && !isDisabled && { transform: 'translateY(-2px)' },
          pressed && !isDisabled && { transform: 'scale(0.96)' },
          Platform.OS === 'web' && { transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
          style,
          // Strip any background/border passed accidentally to the outer container
          { backgroundColor: 'transparent', borderWidth: 0 }
        ]}>
        {({ hovered }: any) => (
          <LinearGradient 
            colors={hovered && !isDisabled ? ['#4f46e5', '#3b82f6', '#0ea5e9'] : ['#4338ca', '#3b82f6', '#0284c7']} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[
              styles.base, 
              sizeStyle, 
              isDisabled && styles.disabled,
              { 
                borderWidth: 1, 
                borderColor: 'rgba(255,255,255,0.15)',
                // Ensure overflow hidden is on the inner content to contain ripples
                overflow: 'hidden', 
              },
              Platform.OS === 'web' && !isDisabled && ({ 
                boxShadow: hovered 
                  ? '0 12px 24px -6px rgba(59, 130, 246, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4)' 
                  : '0 6px 16px -4px rgba(59, 130, 246, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
              } as any)
            ]}>
            {renderContent('#ffffff')}
            {Platform.OS === 'web' && (
              <style>{`
                @keyframes sgRipple { to { transform: scale(4); opacity: 0; } }
                .sg-ripple { z-index: 0; }
              `}</style>
            )}
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  const bgColor = variant === 'secondary' ? c.bgTertiary : 'transparent';
  const borderColor = variant === 'outline' ? c.borderStrong : 'transparent';
  const textColor = variant === 'ghost' ? c.brand : (variant === 'danger' ? c.danger : c.text);

  return (
    //@ts-ignore ref for web
    <Pressable ref={btnRef} onPress={handlePress} disabled={isDisabled}
      style={({ hovered }: any) => [
        styles.base, 
        sizeStyle, 
        fwStyle,
        commonWebStyle,
        { 
          backgroundColor: hovered && !isDisabled ? (variant === 'danger' ? `${c.danger}15` : c.bgCardHover) : bgColor,
          borderColor: variant === 'outline' || variant === 'secondary' ? borderColor : 'transparent',
          borderWidth: 1,
        },
        isDisabled && styles.disabled,
        hovered && !isDisabled && { transform: 'scale(0.98)' },
        style
      ]}>
      {renderContent(textColor)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: radius.md, 
    overflow: 'hidden' 
  },
  inner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    zIndex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  sm: { paddingHorizontal: 12, paddingVertical: 8 },
  md: { paddingHorizontal: 20, paddingVertical: 10 },
  lg: { paddingHorizontal: 28, paddingVertical: 14 },
  disabled: { opacity: 0.5 },
});
