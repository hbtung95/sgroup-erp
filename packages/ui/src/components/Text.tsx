import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {}

export function Text({ className, ...props }: TextProps) {
  return <RNText className={`text-[--text-primary] ${className || ''}`} {...props} />;
}
