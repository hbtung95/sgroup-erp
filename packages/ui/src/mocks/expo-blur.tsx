import React from 'react';
import { View } from 'react-native';

export const BlurView = ({ intensity = 50, tint = 'default', style, children, ...props }: any) => {
  const getBackgroundColor = () => {
    switch(tint) {
      case 'light': return 'rgba(255, 255, 255, 0.5)';
      case 'dark': return 'rgba(0, 0, 0, 0.5)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  };

  return (
    <View 
      style={[{ 
        backgroundColor: getBackgroundColor(), 
        backdropFilter: `blur(${intensity * 0.2}px)`,
        WebkitBackdropFilter: `blur(${intensity * 0.2}px)`
      }, style]} 
      {...props}
    >
      {children}
    </View>
  );
};
