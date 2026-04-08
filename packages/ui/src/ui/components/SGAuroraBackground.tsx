import React, { useEffect } from 'react';
import { StyleSheet, View, Platform, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolate
} from 'react-native-reanimated';
import { useTheme } from '../../theme/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SGAuroraBackground = () => {
  const theme = useTheme();
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withRepeat(
      withTiming(1, {
        duration: 25000,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
      }),
      -1,
      true
    );
  }, []);

  const aurora1Style = useAnimatedStyle(() => {
    const translateX = interpolate(anim.value, [0, 0.5, 1], [0, 50, -50]);
    const translateY = interpolate(anim.value, [0, 0.5, 1], [0, -40, 40]);
    const scale = interpolate(anim.value, [0, 0.5, 1], [1, 1.1, 1]);
    const rotate = interpolate(anim.value, [0, 0.5, 1], [0, 5, -5]);

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
        { rotate: `${rotate}deg` },
      ] as any,
    };
  });

  const aurora2Style = useAnimatedStyle(() => {
    const translateX = interpolate(anim.value, [0, 0.5, 1], [0, -60, 60]);
    const translateY = interpolate(anim.value, [0, 0.5, 1], [0, 30, -30]);
    const scale = interpolate(anim.value, [0, 0.5, 1], [1, 1.15, 0.95]);
    
    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ] as any,
    };
  });

  // Đối với Web, chúng ta có thể dùng CSS trực tiếp để tối ưu hiệu năng
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <div className="sg-bg-ambient-wrapper">
          <style>{`
            .sg-bg-ambient-wrapper {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              overflow: hidden;
              z-index: -1;
              pointer-events: none;
              background-color: ${theme.bg};
            }
            .aurora-blob {
              position: absolute;
              border-radius: 50%;
              filter: blur(100px);
              opacity: 0.8;
              animation: sgAuroraFlow 25s infinite alternate ease-in-out;
              will-change: transform;
            }
            .aurora-1 {
              top: -10%; left: -10%; width: 60vw; height: 60vw;
              background: radial-gradient(circle, ${theme.aurora[0]}, transparent 70%);
            }
            .aurora-2 {
              bottom: -10%; right: -10%; width: 50vw; height: 50vw;
              background: radial-gradient(circle, ${theme.aurora[1]}, transparent 70%);
              animation-delay: -8s;
            }
            .aurora-3 {
              top: 30%; right: 20%; width: 40vw; height: 40vw;
              background: radial-gradient(circle, ${theme.aurora[2]}, transparent 70%);
              animation-delay: -15s;
            }
            @keyframes sgAuroraFlow {
              0% { transform: translate(0, 0) scale(1) rotate(0deg); }
              50% { transform: translate(5vw, -5vh) scale(1.1) rotate(5deg); }
              100% { transform: translate(-5vw, 5vh) scale(1) rotate(-5deg); }
            }
          `}</style>
          <div className="aurora-blob aurora-1" />
          <div className="aurora-blob aurora-2" />
          <div className="aurora-blob aurora-3" />
        </div>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Animated.View 
        style={[
          styles.blob, 
          styles.blob1, 
          { backgroundColor: theme.aurora[0] }, 
          aurora1Style
        ]} 
      />
      <Animated.View 
        style={[
          styles.blob, 
          styles.blob2, 
          { backgroundColor: theme.aurora[1] }, 
          aurora2Style
        ]} 
      />
      <Animated.View 
        style={[
          styles.blob, 
          styles.blob3, 
          { backgroundColor: theme.aurora[2] }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.5,
    ...(Platform.OS !== 'web' ? {
      // Blur on mobile is expensive, use sparingly or with alternatives
    } : {}),
  },
  blob1: {
    top: -SCREEN_WIDTH * 0.2,
    left: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
  },
  blob2: {
    bottom: -SCREEN_WIDTH * 0.2,
    right: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  blob3: {
    top: SCREEN_HEIGHT * 0.3,
    right: SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
  },
});
