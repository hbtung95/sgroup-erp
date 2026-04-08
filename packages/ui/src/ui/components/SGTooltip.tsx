import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  style?: ViewStyle;
}

export function SGTooltip({ content, children, position = 'top', style }: Props) {
  const c = useTheme();
  const [show, setShow] = useState(false);

  if (Platform.OS !== 'web') return <View style={style}>{children}</View>;

  const pos: Record<string, ViewStyle> = {
    top: { bottom: '100%', left: '50%', marginBottom: 8 },
    bottom: { top: '100%', left: '50%', marginTop: 8 },
    left: { right: '100%', top: '50%', marginRight: 8 },
    right: { left: '100%', top: '50%', marginLeft: 8 },
  };
  const tx: Record<string, any> = {
    top: { transform: [{ translateX: '-50%' }] },
    bottom: { transform: [{ translateX: '-50%' }] },
    left: { transform: [{ translateY: '-50%' }] },
    right: { transform: [{ translateY: '-50%' }] },
  };

  return (
    <View style={[styles.wrap, style]}
      // @ts-ignore web events
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <View style={[styles.tip, { backgroundColor: c.bgCard === '#FFFFFF' ? '#0f172a' : '#1e293b' }, pos[position], tx[position],
          { boxShadow: '0 4px 16px rgba(0,0,0,0.3)' } as any]}>
          <Text style={[typography.caption, { color: '#fff', textAlign: 'center' }]}>{content}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  tip: { position: 'absolute', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, zIndex: 999, maxWidth: 240 },
});
