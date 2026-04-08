import React from 'react';
import { Svg, Path, Rect, Circle, Polyline, Line, Ellipse } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
}

const W = ({ size = 20, color = 'currentColor', strokeWidth = 1.5, ...p }: IconProps, children: React.ReactNode) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </Svg>
);

export const SGIcons = {
  Dashboard: (p: IconProps) => W(p, (
    <>
      <Rect x="3" y="3" width="7" height="9" rx="1" />
      <Rect x="14" y="3" width="7" height="5" rx="1" />
      <Rect x="14" y="12" width="7" height="9" rx="1" />
      <Rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  )),
  Database: (p: IconProps) => W(p, (
    <>
      <Ellipse cx="12" cy="5" rx="9" ry="3" />
      <Path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <Path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </>
  )),
  Code: (p: IconProps) => W(p, (
    <>
      <Polyline points="16 18 22 12 16 6" />
      <Polyline points="8 6 2 12 8 18" />
    </>
  )),
  Settings: (p: IconProps) => W(p, (
    <>
      <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.18-.08a2 2 0 0 0-2 0l-.08.18a2 2 0 0 1-1.73 1l-.25.43a2 2 0 0 1 0 2l.08.18a2 2 0 0 0 0 2l-.08.18a2 2 0 0 1 1.73 1l.25.43a2 2 0 0 1 0 2l.18.08a2 2 0 0 0 2 0l.08-.18a2 2 0 0 1 1.73-1l.43-.25a2 2 0 0 1 2 0l.18.08a2 2 0 0 0 2 0l.08-.18a2 2 0 0 1 1.73-1l.25-.43a2 2 0 0 1 0-2l-.08-.18a2 2 0 0 0 0-2l.08-.18a2 2 0 0 1-1.73-1l-.25-.43a2 2 0 0 1 0-2l-.18-.08a2 2 0 0 0-2 0z" />
      <Circle cx="12" cy="12" r="3" />
    </>
  )),
  Sun: (p: IconProps) => W(p, (
    <>
      <Circle cx="12" cy="12" r="5" />
      <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </>
  )),
  Moon: (p: IconProps) => W(p, <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />),
  Activity: (p: IconProps) => W(p, <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />),
  Search: (p: IconProps) => W(p, (
    <>
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  )),
  Server: (p: IconProps) => W(p, (
    <>
      <Rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <Rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <Line x1="6" y1="6" x2="6.01" y2="6" />
      <Line x1="6" y1="18" x2="6.01" y2="18" />
    </>
  )),
  ChevronDown: (p: IconProps) => W(p, <Polyline points="6 9 12 15 18 9" />),
  ChevronUp: (p: IconProps) => W(p, <Polyline points="18 15 12 9 6 15" />),
  MoreHorizontal: (p: IconProps) => W(p, (
    <>
      <Circle cx="12" cy="12" r="1" />
      <Circle cx="19" cy="12" r="1" />
      <Circle cx="5" cy="12" r="1" />
    </>
  )),
  ArrowUpRight: (p: IconProps) => W(p, (
    <>
      <Line x1="7" y1="17" x2="17" y2="7" />
      <Polyline points="7 7 17 7 17 17" />
    </>
  )),
  CheckCircle: (p: IconProps) => W(p, (
    <>
      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <Polyline points="22 4 12 14.01 9 11.01" />
    </>
  )),
};
