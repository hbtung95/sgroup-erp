import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, spacing, radius, animations } from '../../theme/theme';

interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  style?: ViewStyle;
}

export function SGLoadingOverlay({ visible, title = "Đang xử lý...", message = "Vui lòng chờ trong giây lát", style }: Props) {
  const c = useTheme();
  if (!visible) return null;

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(2,6,23,0.50)' }, style]}>
      {isWeb && (
        <style>{`
          .sg-loading-overlay-blur {
            backdrop-filter: blur(26px) saturate(180%);
            -webkit-backdrop-filter: blur(26px) saturate(180%);
          }
          .sg-spinner-tech {
            width: 24px;
            height: 24px;
            border-radius: 999px;
            border: 2px solid rgba(255,255,255,0.1);
            border-top-color: ${c.accentCyan};
            border-right-color: ${c.brand};
            animation: sgSpin 0.8s linear infinite;
          }
          @keyframes sgSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          
          @keyframes sgPopIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .sg-animate-pop { animation: sgPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        `}</style>
      )}
      
      <View 
        {...(isWeb ? { className: 'sg-loading-overlay-blur sg-animate-pop' } : {}) as any}
        style={[
          styles.panel, 
          { 
            backgroundColor: 'rgba(255,255,255,0.06)', 
            borderColor: c.glassBorder,
          }
        ]}
      >
        <View style={styles.inner}>
          {isWeb ? (
            <div className="sg-spinner-tech" />
          ) : (
            <ActivityIndicator size="small" color={c.accentCyan} />
          )}
          
          <View style={styles.textContainer}>
            <Text style={[typography.h4, { color: c.text, fontSize: 14, fontWeight: '600' }]}>
              {title}
            </Text>
            {message && (
              <Text style={[typography.small, { color: c.textSecondary, marginTop: 4, fontSize: 12 }]}>
                {message}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 9999,
  },
  panel: { 
    width: Platform.OS === 'web' ? 'min(520px, 90%)' : '85%',
    borderRadius: radius.xl, 
    borderWidth: 1, 
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
    } : {}) as any,
  },
  inner: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    marginLeft: 14,
    flex: 1,
  }
});
