import React from 'react';
import { View, Platform } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Props {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  showArea?: boolean;
}

export const SGSparkline = ({ data, color, width = 120, height = 40, showArea = true }: Props) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2; // Extra padding to avoid clipping

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((d - min) / range) * (height - padding * 2) - padding;
    return { x, y };
  });

  const pathData = points.reduce((acc, p, i) => {
    return acc + (i === 0 ? `M ${p.x},${p.y}` : ` L ${p.x},${p.y}`);
  }, '');

  const areaPathData = `${pathData} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {showArea && (
          <Path d={areaPathData} fill="url(#grad)" />
        )}
        <Path 
          d={pathData} 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </Svg>
    </View>
  );
};
