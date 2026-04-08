import React from 'react';
import { View, ViewStyle } from 'react-native';
import { spacing } from '../../theme/theme';

interface Props { size?: keyof typeof spacing; flex?: number; style?: ViewStyle }

export function SGSpacer({ size = 'md', flex, style }: Props) {
  if (flex != null) return <View style={[{ flex }, style]} />;
  const px = spacing[size];
  return <View style={[{ width: px, height: px }, style]} />;
}
