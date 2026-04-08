import React from 'react';
import { View } from 'react-native';

export const LinearGradient = ({ colors, start, end, style, children, ...props }: any) => {
  // Simple angle calculation for start/end
  let angle = '180deg';
  if (start && end) {
    if (start.x === 0 && start.y === 0 && end.x === 1 && end.y === 1) angle = '135deg';
    else if (start.x === 0 && end.x === 1 && start.y === end.y) angle = '90deg';
  }
  
  const gradient = colors && colors.length > 0 ? `linear-gradient(${angle}, ${colors.join(', ')})` : undefined;
  
  return (
    <View style={[{ backgroundImage: gradient }, style]} {...props}>
      {children}
    </View>
  );
};
