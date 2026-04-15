import React from 'react';

interface SGGlassPanelProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  withBorder?: boolean;
}

const PADDINGS = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function SGGlassPanel({
  children,
  className = '',
  padding = 'md',
  withBorder = true,
}: SGGlassPanelProps) {
  return (
    <div
      className={`bg-sg-card ${withBorder ? 'border border-sg-border' : ''} ${PADDINGS[padding]} rounded-[24px] shadow-sm backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}
